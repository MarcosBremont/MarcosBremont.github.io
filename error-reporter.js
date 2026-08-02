(function () {
  'use strict';

  const CFG_KEY = 'tinclass_error_alerts_cfg_v1';
  const DEDUPE_WINDOW_MS = 2 * 60 * 1000;
  const BURST_WINDOW_MS = 60 * 60 * 1000;
  const BURST_MAX_SEND = 8;

  const DEFAULT_CFG = {
    enabled: true,
    minSeverity: 'medium',
    sendEmail: true,
    saveFirestore: true,
    includeUserAgent: true,
    includeUrl: true
  };

  const _lastByFingerprint = new Map();
  let _burstCount = 0;
  let _burstStart = Date.now();
  let _isReporting = false;

  function _safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function _getCfg() {
    const raw = localStorage.getItem(CFG_KEY);
    const parsed = raw ? _safeJsonParse(raw, {}) : {};
    return Object.assign({}, DEFAULT_CFG, parsed || {});
  }

  function _setCfg(partial) {
    const nextCfg = Object.assign({}, _getCfg(), partial || {});
    localStorage.setItem(CFG_KEY, JSON.stringify(nextCfg));
    return nextCfg;
  }

  function _severityWeight(level) {
    if (level === 'high') return 3;
    if (level === 'medium') return 2;
    return 1;
  }

  function _fingerprint(payload) {
    return [
      payload.type || 'unknown',
      payload.message || 'no-message',
      payload.filename || 'no-file',
      String(payload.lineno || 0),
      String(payload.colno || 0)
    ].join('|');
  }

  function _toStringError(reason) {
    if (!reason) return 'Unknown error';
    if (typeof reason === 'string') return reason;
    if (reason instanceof Error) return reason.message || String(reason);
    if (typeof reason.message === 'string') return reason.message;
    try {
      return JSON.stringify(reason);
    } catch (_) {
      return String(reason);
    }
  }

  function _toSafeString(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (value instanceof Error) return (value.stack || value.message || String(value));
    if (typeof value === 'object') {
      if (typeof value.message === 'string' && value.message) {
        return value.stack ? (value.message + '\n' + value.stack) : value.message;
      }
      try {
        return JSON.stringify(value);
      } catch (_) {
        return String(value);
      }
    }
    return String(value);
  }

  function _argsToMessage(args) {
    return (args || []).map(_toSafeString).join(' | ').slice(0, 1200) || 'sin-detalle';
  }

  function _extractStackFromArgs(args) {
    const list = args || [];
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i];
      if (item instanceof Error && item.stack) return String(item.stack).slice(0, 4000);
      if (item && typeof item === 'object' && typeof item.stack === 'string') return String(item.stack).slice(0, 4000);
    }
    return null;
  }

  function _shouldReportWarnMessage(msg) {
    const s = String(msg || '').toLowerCase();
    if (!s) return false;
    if (s.includes('[errorreporter]')) return false;
    return (
      s.includes('error') ||
      s.includes('failed') ||
      s.includes('fail') ||
      s.includes('exception') ||
      s.includes('reject') ||
      s.includes('timeout') ||
      s.includes('network') ||
      s.includes('firebase') ||
      s.includes('firestore') ||
      s.includes('storage') ||
      s.includes('auth') ||
      s.includes('cors') ||
      s.includes('5xx') ||
      s.includes('4xx')
    );
  }

  function _sanitizeUrl(url) {
    try {
      const u = new URL(String(url || ''));
      u.search = '';
      return u.toString();
    } catch (_) {
      return String(url || '');
    }
  }

  function _inferModuleFromUrl(url) {
    const u = String(url || '').toLowerCase();
    if (!u) return 'network';
    if (u.includes('firestore') || u.includes('firebase')) return 'firebase';
    if (u.includes('emailjs')) return 'emailjs';
    if (u.includes('openrouter') || u.includes('groq') || u.includes('generativelanguage')) return 'ia';
    return 'network';
  }

  function _pickSeverity(message, type) {
    const msg = String(message || '').toLowerCase();
    if (type === 'unhandledrejection') return 'high';
    if (msg.includes('typeerror') || msg.includes('referenceerror') || msg.includes('syntaxerror')) return 'high';
    if (msg.includes('network') || msg.includes('timeout')) return 'medium';
    return 'medium';
  }

  function _shouldIgnore(payload) {
    const msg = String(payload.message || '').toLowerCase();
    const file = String(payload.filename || '').toLowerCase();

    if (!msg || msg === 'script error.') return true;
    if (msg.includes('resizeobserver loop limit exceeded')) return true;
    if (msg.includes('non-error promise rejection captured')) return true;
    if (msg.includes('the operation was aborted')) return true;
    if (msg.includes('[errorreporter]')) return true;
    if (file.includes('extensions/')) return true;

    return false;
  }

  function _isDuplicate(payload) {
    const fp = _fingerprint(payload);
    const now = Date.now();
    const prev = _lastByFingerprint.get(fp) || 0;
    if (now - prev < DEDUPE_WINDOW_MS) return true;
    _lastByFingerprint.set(fp, now);
    return false;
  }

  function _withinBurstLimit() {
    const now = Date.now();
    if (now - _burstStart > BURST_WINDOW_MS) {
      _burstStart = now;
      _burstCount = 0;
    }
    if (_burstCount >= BURST_MAX_SEND) return false;
    _burstCount += 1;
    return true;
  }

  function _resolveUserContext() {
    const user = window.currentUser || null;
    return {
      uid: user && user.uid ? user.uid : null,
      email: user && user.email ? user.email : null
    };
  }

  function _buildPayload(base) {
    const ctxUser = _resolveUserContext();
    const payload = {
      type: base.type || 'error',
      message: String(base.message || 'Unknown error'),
      stack: base.stack ? String(base.stack).slice(0, 4000) : null,
      filename: base.filename || null,
      lineno: Number(base.lineno || 0) || null,
      colno: Number(base.colno || 0) || null,
      source: base.source || 'runtime',
      severity: base.severity || _pickSeverity(base.message, base.type),
      action: base.action || null,
      module: base.module || null,
      uid: ctxUser.uid,
      userEmail: ctxUser.email,
      appVersion: window.TINCLASS_BUILD_VERSION || 'vdev',
      swVersion: window.TINCLASS_SW_VERSION || 'vsw',
      ts: new Date().toISOString()
    };

    const cfg = _getCfg();
    if (cfg.includeUserAgent) payload.userAgent = navigator.userAgent;
    if (cfg.includeUrl) payload.url = window.location.href;

    return payload;
  }

  function _resolveFirestoreDb() {
    if (window.db && typeof window.db.collection === 'function') return window.db;
    if (typeof db !== 'undefined' && db && typeof db.collection === 'function') return db;
    return null;
  }

  function _resolveFirebaseFieldValue() {
    if (window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue) {
      return window.firebase.firestore.FieldValue;
    }
    if (typeof firebase !== 'undefined' && firebase && firebase.firestore && firebase.firestore.FieldValue) {
      return firebase.firestore.FieldValue;
    }
    return null;
  }

  function _whereLabel(payload) {
    const f = payload.filename || 'archivo-desconocido';
    const l = payload.lineno || '-';
    const c = payload.colno || '-';
    return f + ':' + l + ':' + c;
  }

  function _whenLabel(tsIso) {
    try {
      return new Date(tsIso).toLocaleString('es-DO', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (_) {
      return tsIso || 'fecha-desconocida';
    }
  }

  async function _sendByEmail(payload) {
    const hasEmailJs = typeof emailjs !== 'undefined' && emailjs && typeof emailjs.send === 'function';
    const hasConfig = typeof EMAILJS_SERVICE_ID !== 'undefined' && typeof EMAILJS_PUBLIC_KEY !== 'undefined';
    if (!hasEmailJs || !hasConfig) return { ok: false, reason: 'emailjs-not-available' };

    const serviceId = EMAILJS_SERVICE_ID;
    const templateId = (typeof EMAILJS_ERROR_TEMPLATE_ID !== 'undefined' && EMAILJS_ERROR_TEMPLATE_ID)
      ? EMAILJS_ERROR_TEMPLATE_ID
      : null;
    const target = (typeof ADMIN_EMAIL !== 'undefined' && ADMIN_EMAIL) ? ADMIN_EMAIL : null;

    if (!templateId || !target) return { ok: false, reason: 'email-config-missing' };
    if (typeof EMAILJS_TEMPLATE_ID !== 'undefined' && templateId === EMAILJS_TEMPLATE_ID) {
      return { ok: false, reason: 'error-template-must-be-different-from-otp' };
    }

    const shortStack = payload.stack ? String(payload.stack).split('\n').slice(0, 8).join('\n') : 'n/a';
    const where = _whereLabel(payload);
    const when = _whenLabel(payload.ts);
    const subject = '[ALERTA ERROR][' + String(payload.severity || 'high').toUpperCase() + '] ' + String(payload.message || 'Error sin mensaje').slice(0, 120);
    const summary = [
      'Error: ' + payload.message,
      'Severidad: ' + payload.severity,
      'Modulo: ' + (payload.module || 'n/a'),
      'Accion: ' + (payload.action || 'n/a'),
      'Donde: ' + where,
      'Cuando: ' + when,
      'UID: ' + (payload.uid || 'n/a'),
      'Usuario: ' + (payload.userEmail || 'n/a'),
      'Build: ' + (payload.appVersion || 'n/a') + ' / SW: ' + (payload.swVersion || 'n/a'),
      'URL: ' + (payload.url || 'n/a'),
      'Fecha: ' + payload.ts,
      'Stack:',
      shortStack
    ].join('\n');

    const params = {
      to_email: target,
      email: target,
      user_email: target,
      recipient: target,
      app_name: 'TinClass',
      report_type: 'error_alert',
      alert_subject: subject,
      alert_title: 'Alerta de error en TinClass',
      error_message: payload.message,
      error_where: where,
      error_when: when,
      error_summary: summary,
      severity: payload.severity,
      source_file: payload.filename || 'n/a',
      source_line: payload.lineno || '-',
      route_url: payload.url || 'n/a',
      user_uid: payload.uid || 'n/a',
      user_email_context: payload.userEmail || 'n/a',
      build_version: payload.appVersion || 'n/a',
      sw_version: payload.swVersion || 'n/a',
      stack: shortStack,
      timestamp: payload.ts
    };

    try {
      const response = await emailjs.send(serviceId, templateId, params, { publicKey: EMAILJS_PUBLIC_KEY });
      return { ok: true, status: response && response.status ? response.status : 200 };
    } catch (e) {
      return { ok: false, reason: (e && (e.text || e.message)) ? (e.text || e.message) : String(e) };
    }
  }

  async function _saveInFirestore(payload) {
    try {
      let dbRef = _resolveFirestoreDb();
      if (!dbRef) {
        // Firebase puede tardar unos instantes en estar disponible tras el boot.
        for (let i = 0; i < 8 && !dbRef; i += 1) {
          await new Promise(resolve => setTimeout(resolve, 250));
          dbRef = _resolveFirestoreDb();
        }
      }
      if (!dbRef) return { ok: false, reason: 'db-not-ready' };

      const fieldValue = _resolveFirebaseFieldValue();
      const doc = Object.assign({}, payload, {
        createdAt: fieldValue
          ? fieldValue.serverTimestamp()
          : new Date().toISOString()
      });
      await dbRef.collection('error_logs').add(doc);
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: (e && e.message) ? e.message : String(e) };
    }
  }

  async function _dispatchReport(basePayload) {
    const cfg = _getCfg();
    if (!cfg.enabled) return;

    const payload = _buildPayload(basePayload);
    if (_shouldIgnore(payload)) return;
    if (_isDuplicate(payload)) return;

    if (_severityWeight(payload.severity) < _severityWeight(cfg.minSeverity)) return;
    if (!_withinBurstLimit()) return;

    if (_isReporting) return;
    _isReporting = true;
    try {
      if (cfg.sendEmail) {
        const mailResult = await _sendByEmail(payload);
        if (!mailResult.ok) {
          console.warn('[ErrorReporter] Fallo enviando correo:', mailResult.reason || mailResult.status || 'desconocido');
        }
      }
      if (cfg.saveFirestore) {
        const logResult = await _saveInFirestore(payload);
        if (!logResult.ok) {
          console.warn('[ErrorReporter] Fallo guardando log en Firestore:', logResult.reason || 'desconocido');
        }
      }
    } finally {
      _isReporting = false;
    }
  }

  function _onWindowError(event) {
    if (_isReporting) return;
    const err = event && event.error ? event.error : null;
    _dispatchReport({
      type: 'error',
      source: 'window.error',
      message: event && event.message ? event.message : (err && err.message ? err.message : 'Runtime error'),
      filename: event && event.filename ? event.filename : null,
      lineno: event && event.lineno ? event.lineno : null,
      colno: event && event.colno ? event.colno : null,
      stack: err && err.stack ? err.stack : null
    });
  }

  function _onUnhandledRejection(event) {
    if (_isReporting) return;
    const reason = event ? event.reason : null;
    _dispatchReport({
      type: 'unhandledrejection',
      source: 'window.unhandledrejection',
      message: _toStringError(reason),
      stack: reason && reason.stack ? reason.stack : null,
      severity: 'high'
    });
  }

  function _onResourceError(event) {
    if (_isReporting) return;
    const target = event && event.target ? event.target : null;
    if (!target || target === window) return;
    const src = target.currentSrc || target.src || target.href || null;
    const tag = target.tagName ? String(target.tagName).toLowerCase() : 'resource';

    _dispatchReport({
      type: 'resource_error',
      source: 'window.resourceerror',
      message: 'No se pudo cargar recurso <' + tag + '>',
      filename: src ? _sanitizeUrl(src) : null,
      severity: 'high',
      module: 'assets',
      action: tag
    });
  }

  function _setupConsoleHooks() {
    if (typeof console === 'undefined') return;
    if (console.__tinclassReporterPatched) return;

    const originalError = typeof console.error === 'function' ? console.error.bind(console) : null;
    const originalWarn = typeof console.warn === 'function' ? console.warn.bind(console) : null;

    if (originalError) {
      console.error = function () {
        const args = Array.prototype.slice.call(arguments);
        _dispatchReport({
          type: 'console_error',
          source: 'console.error',
          severity: 'high',
          module: 'console',
          message: _argsToMessage(args),
          stack: _extractStackFromArgs(args)
        });
        return originalError.apply(console, args);
      };
    }

    if (originalWarn) {
      console.warn = function () {
        const args = Array.prototype.slice.call(arguments);
        const msg = _argsToMessage(args);
        if (_shouldReportWarnMessage(msg)) {
          _dispatchReport({
            type: 'console_warn',
            source: 'console.warn',
            severity: 'medium',
            module: 'console',
            message: msg,
            stack: _extractStackFromArgs(args)
          });
        }
        return originalWarn.apply(console, args);
      };
    }

    console.__tinclassReporterPatched = true;
  }

  function _setupFetchHook() {
    if (typeof window.fetch !== 'function') return;
    if (window.fetch.__tinclassReporterPatched) return;

    const originalFetch = window.fetch.bind(window);
    const patchedFetch = async function (input, init) {
      const url = typeof input === 'string'
        ? input
        : (input && input.url ? input.url : 'unknown-url');
      const method = (init && init.method) || (input && input.method) || 'GET';

      try {
        const response = await originalFetch(input, init);
        if (!response.ok) {
          _dispatchReport({
            type: 'fetch_http_error',
            source: 'fetch.response',
            severity: response.status >= 500 ? 'high' : 'medium',
            module: _inferModuleFromUrl(url),
            action: method,
            message: 'HTTP ' + response.status + ' ' + (response.statusText || 'Error') + ' en ' + _sanitizeUrl(url),
            filename: _sanitizeUrl(url)
          });
        }
        return response;
      } catch (err) {
        _dispatchReport({
          type: 'fetch_exception',
          source: 'fetch.catch',
          severity: 'high',
          module: _inferModuleFromUrl(url),
          action: method,
          message: _toStringError(err) + ' en ' + _sanitizeUrl(url),
          filename: _sanitizeUrl(url),
          stack: err && err.stack ? err.stack : null
        });
        throw err;
      }
    };

    patchedFetch.__tinclassReporterPatched = true;
    window.fetch = patchedFetch;
  }

  function _manualReport(error, context) {
    const err = error instanceof Error ? error : null;
    const ctx = context || {};
    _dispatchReport({
      type: ctx.type || 'manual',
      source: ctx.source || 'manual',
      module: ctx.module || null,
      action: ctx.action || null,
      severity: ctx.severity || 'high',
      message: err ? err.message : _toStringError(error),
      stack: err && err.stack ? err.stack : (ctx.stack || null),
      filename: ctx.filename || null,
      lineno: ctx.lineno || null,
      colno: ctx.colno || null
    });
  }

  window.tinclassErrorAlertsConfig = {
    get: _getCfg,
    set: _setCfg,
    reset: function () {
      localStorage.removeItem(CFG_KEY);
      return _getCfg();
    }
  };

  window.tinclassReportError = _manualReport;

  window.addEventListener('error', _onWindowError);
  window.addEventListener('error', _onResourceError, true);
  window.addEventListener('unhandledrejection', _onUnhandledRejection);
  _setupConsoleHooks();
  _setupFetchHook();
})();

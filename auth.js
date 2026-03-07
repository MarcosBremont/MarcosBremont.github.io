// ================================================================
// AUTH.JS — Autenticación Firebase para El Gran Planificador
// ================================================================

window.currentUser = null;

// ── Claves localStorage a migrar ────────────────────────────────
const FIREBASE_STORES = [
  { store: 'planificacion', key: 'planificadorRA_borrador_v1' },
  { store: 'biblioteca',    key: 'planificadorRA_biblioteca_v1' },
  { store: 'calificaciones',key: 'planificadorRA_calificaciones_v1' },
  { store: 'asistencia',    key: 'planificadorRA_asistencia_v1' },
  { store: 'comentarios',   key: 'planificadorRA_comentarios_v1' },
  { store: 'horario',       key: 'planificadorRA_horario_v1' },
  { store: 'tareas',        key: 'planificadorRA_tareas_v1' },
  { store: 'diarias',       key: 'planificadorRA_diarias_v1' },
  { store: 'notas',         key: 'planificadorRA_notas_docente_v1' },
  { store: 'bitacora',      key: 'planificadorRA_bitacora_v1' },
  { store: 'incidencias',   key: 'planificadorRA_incidencias_v1' },
  { store: 'recuperaciones',key: 'planificadorRA_recuperaciones_v1' },
  { store: 'libreta',       key: 'planificadorRA_libreta_v1' },
  { store: 'participacion', key: 'planificadorRA_participacion_v1' },
  { store: 'blog',                  key: 'planificadorRA_blog_v1' },
  { store: 'reportes',              key: 'planificadorRA_reportes_v1' },
  { store: 'calendario_escolar',    key: 'planificadorRA_calendario_escolar_v1' },
];

const MIGRATION_FLAG = 'planificadorRA_migrated_v1';

// ── Estado del flujo OTP de registro ────────────────────────────
let _pendingOtp = null;
// { code, email, pass, nombre, expiresAt, timerInterval }

// ── Observer de estado de autenticación ─────────────────────────
auth.onAuthStateChanged(async (user) => {
  if (user) {
    window.currentUser = user;
    await _onLogin(user);
  } else {
    window.currentUser = null;
    _mostrarAuthOverlay();
  }
});

// ── Al iniciar sesión: carga datos de Firestore ──────────────────
async function _onLogin(user) {
  _actualizarHeaderUsuario(user);

  // ¿Primer login con datos locales sin migrar?
  const yaMigrado = localStorage.getItem(MIGRATION_FLAG);
  const tieneDatosLocales = FIREBASE_STORES.some(({ key }) => localStorage.getItem(key) !== null);

  if (!yaMigrado && tieneDatosLocales) {
    await _migrarDatosLocales(user.uid);
  } else {
    // Cargar datos desde Firestore → localStorage
    await _cargarDesdeFirestore(user.uid);
  }

  _ocultarAuthOverlay();

  // Registrar sesión en Firestore (sin await para no bloquear)
  _registrarSesion(user);

  // Iniciar la app (si DOMContentLoaded ya corrió)
  if (typeof _arrancarApp === 'function') _arrancarApp();
}

// ── Registro de sesión en Firestore ──────────────────────────────
function _parseBrowser(ua) {
  if (/Edg\//.test(ua))     return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua))  return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua))  return 'Safari';
  return 'Navegador desconocido';
}
function _parseOS(ua) {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
  if (/Windows NT/.test(ua))    return 'Windows';
  if (/Mac OS X/.test(ua))      return 'macOS';
  if (/Android/.test(ua))       return 'Android';
  if (/iPhone|iPad/.test(ua))   return 'iOS';
  if (/Linux/.test(ua))         return 'Linux';
  return 'Sistema desconocido';
}
function _parseDevice(ua) {
  if (/Mobi|Android|iPhone|iPad/.test(ua)) return 'Móvil / Tablet';
  return 'Escritorio';
}

async function _registrarSesion(user) {
  try {
    const ua = navigator.userAgent;
    const sesionRef = db.collection('users').doc(user.uid)
                        .collection('sessions').doc();
    await sesionRef.set({
      timestamp:  firebase.firestore.FieldValue.serverTimestamp(),
      browser:    _parseBrowser(ua),
      os:         _parseOS(ua),
      device:     _parseDevice(ua),
      resolution: (screen.width || 0) + 'x' + (screen.height || 0),
      language:   navigator.language || '?',
      email:      user.email || ''
    });
    // Mantener solo las últimas 50 sesiones
    const col = db.collection('users').doc(user.uid).collection('sessions');
    const snap = await col.orderBy('timestamp', 'asc').get();
    if (snap.size > 50) {
      const batch = db.batch();
      snap.docs.slice(0, snap.size - 50).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (e) { /* silencioso — no bloquea el login */ }
}

// ── Cargar todos los stores desde Firestore ──────────────────────
async function _cargarDesdeFirestore(uid) {
  try {
    const base = db.collection('users').doc(uid).collection('data');
    const promesas = FIREBASE_STORES.map(async ({ store, key }) => {
      try {
        const doc = await base.doc(store).get();
        if (doc.exists && doc.data().payload) {
          localStorage.setItem(key, doc.data().payload);
        }
      } catch (e) {
        console.warn('Error cargando store:', store, e);
      }
    });
    await Promise.all(promesas);
  } catch (e) {
    console.error('Error al cargar desde Firestore:', e);
  }
}

// ── Migrar datos locales a Firestore (primer login) ──────────────
async function _migrarDatosLocales(uid) {
  _mostrarToastMigracion('Sincronizando tus datos con la nube…');
  try {
    const base = db.collection('users').doc(uid).collection('data');
    const promesas = FIREBASE_STORES.map(async ({ store, key }) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        await base.doc(store).set({ payload: raw });
      }
    });
    await Promise.all(promesas);
    localStorage.setItem(MIGRATION_FLAG, '1');
    _mostrarToastMigracion('✓ Datos sincronizados con la nube', true);
    setTimeout(() => document.getElementById('auth-migration-toast')?.remove(), 3000);
  } catch (e) {
    console.error('Error en migración:', e);
  }
}

// ── Sincronizar un store a Firestore (llamado tras cada guardado) ─
window._syncFirebase = function(store, data) {
  if (!window.currentUser) return;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  db.collection('users').doc(window.currentUser.uid)
    .collection('data').doc(store)
    .set({ payload })
    .catch(e => console.warn('Sync Firebase error [' + store + ']:', e));
};

// ================================================================
// FUNCIONES DE AUTENTICACIÓN
// ================================================================

async function authIniciarSesionEmail() {
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  if (!email || !pass) return _authError('Completa email y contraseña.');

  _authSetLoading(true);
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (e) {
    _authSetLoading(false);
    _authError(_tradError(e.code));
  }
}

// ── Código de invitación ─────────────────────────────────────────
function _getCodigoInvitacion() {
  const custom = localStorage.getItem('metabot_invite_code');
  if (custom) return custom;
  return (typeof METABOT_INVITE_CODE_DEFAULT !== 'undefined') ? METABOT_INVITE_CODE_DEFAULT : 'METABOT2026';
}

function guardarCodigoInvitacion() {
  const input = document.getElementById('cfg-invite-code-input');
  const val = input?.value.trim();
  if (!val) { if (typeof mostrarToast === 'function') mostrarToast('Ingresa un código', 'error'); return; }
  if (val.length < 4) { if (typeof mostrarToast === 'function') mostrarToast('Mínimo 4 caracteres', 'error'); return; }
  localStorage.setItem('metabot_invite_code', val.toUpperCase());
  if (input) input.value = '';
  const lbl = document.getElementById('cfg-invite-code-actual');
  if (lbl) lbl.textContent = 'Código activo: ' + val.toUpperCase();
  if (typeof mostrarToast === 'function') mostrarToast('Código de invitación actualizado ✓', 'success');
}

async function authRegistrarse() {
  const email  = document.getElementById('auth-email-reg').value.trim();
  const pass   = document.getElementById('auth-pass-reg').value;
  const pass2  = document.getElementById('auth-pass-reg2').value;
  const nombre = document.getElementById('auth-nombre-reg').value.trim();

  if (!email || !pass || !pass2) return _authError('Completa todos los campos.', 'reg');
  if (pass !== pass2) return _authError('Las contraseñas no coinciden.', 'reg');
  if (pass.length < 6) return _authError('La contraseña debe tener al menos 6 caracteres.', 'reg');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return _authError('El formato del correo no es válido.', 'reg');

  _authSetLoading(true, 'reg');

  // Generar código OTP de 6 dígitos
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));

  // Guardar estado pendiente (10 min de expiración)
  if (_pendingOtp?.timerInterval) clearInterval(_pendingOtp.timerInterval);
  _pendingOtp = {
    code: otpCode,
    email,
    pass,
    nombre,
    expiresAt: Date.now() + 10 * 60 * 1000,
    timerInterval: null,
  };

  // Enviar OTP por correo
  const enviado = await _enviarEmailOTP(email, otpCode);
  _authSetLoading(false, 'reg');

  if (!enviado) {
    // EmailJS no configurado — modo desarrollo: mostrar código en consola
    console.info('[OTP Registro] Código:', otpCode, '— Configura EmailJS en firebase-config.js para envío real.');
  }

  _mostrarPanelOTP(email);
}

// ── Enviar OTP vía EmailJS ────────────────────────────────────────
async function _enviarEmailOTP(email, code) {
  if (typeof EMAILJS_SERVICE_ID === 'undefined' ||
      EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
    return false; // no configurado
  }
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { email: email, passcode: code },
      EMAILJS_PUBLIC_KEY
    );
    return true;
  } catch (e) {
    console.error('EmailJS error:', e);
    return false;
  }
}

// ── Mostrar panel OTP ────────────────────────────────────────────
function _mostrarPanelOTP(email) {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.remove('hidden');
  document.querySelector('.auth-tabs')?.style.setProperty('display', 'none');
  document.getElementById('auth-form-login')?.style.setProperty('display', 'none');
  document.getElementById('auth-form-registro')?.style.setProperty('display', 'none');

  const panel = document.getElementById('auth-verificacion-panel');
  if (panel) panel.style.display = 'block';
  const emailEl = document.getElementById('auth-ver-email');
  if (emailEl) emailEl.textContent = email;
  const msg = document.getElementById('auth-ver-msg');
  if (msg) msg.textContent = '';
  const input = document.getElementById('auth-otp-input');
  if (input) { input.value = ''; setTimeout(() => input.focus(), 120); }

  // Countdown timer
  _iniciarTimerOTP();
}

function _iniciarTimerOTP() {
  const timerEl = document.getElementById('auth-otp-timer');
  if (!timerEl || !_pendingOtp) return;
  if (_pendingOtp.timerInterval) clearInterval(_pendingOtp.timerInterval);
  _pendingOtp.timerInterval = setInterval(() => {
    const secsLeft = Math.max(0, Math.ceil((_pendingOtp.expiresAt - Date.now()) / 1000));
    const m = Math.floor(secsLeft / 60);
    const s = secsLeft % 60;
    timerEl.textContent = secsLeft > 0
      ? 'El código expira en ' + m + ':' + String(s).padStart(2, '0')
      : 'Código expirado. Solicita uno nuevo.';
    if (secsLeft === 0) {
      clearInterval(_pendingOtp.timerInterval);
      _pendingOtp = null;
    }
  }, 1000);
}

// ── Verificar código OTP ingresado ───────────────────────────────
async function authVerificarOTPRegistro() {
  const input = document.getElementById('auth-otp-input');
  const msg   = document.getElementById('auth-ver-msg');
  const code  = (input?.value || '').trim();

  if (!code || code.length < 6) {
    if (msg) { msg.style.color = '#C62828'; msg.textContent = 'Ingresa el código de 6 dígitos.'; }
    return;
  }
  if (!_pendingOtp) {
    if (msg) { msg.style.color = '#C62828'; msg.textContent = 'Sesión expirada. Vuelve a registrarte.'; }
    return;
  }
  if (Date.now() > _pendingOtp.expiresAt) {
    if (msg) { msg.style.color = '#C62828'; msg.textContent = 'El código expiró. Solicita uno nuevo.'; }
    _pendingOtp = null;
    return;
  }
  if (code !== _pendingOtp.code) {
    if (msg) { msg.style.color = '#C62828'; msg.textContent = 'Código incorrecto. Inténtalo de nuevo.'; }
    if (input) { input.value = ''; input.focus(); }
    return;
  }

  // Código correcto — crear la cuenta
  if (msg) { msg.style.color = '#2E7D32'; msg.textContent = '✓ Código verificado. Creando tu cuenta…'; }
  const btn = document.getElementById('auth-btn-otp');
  if (btn) btn.disabled = true;

  const { email, pass, nombre } = _pendingOtp;
  if (_pendingOtp.timerInterval) clearInterval(_pendingOtp.timerInterval);
  _pendingOtp = null;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    if (nombre) await cred.user.updateProfile({ displayName: nombre });
    // onAuthStateChanged disparará _onLogin automáticamente
  } catch (e) {
    if (btn) btn.disabled = false;
    if (msg) { msg.style.color = '#C62828'; msg.textContent = _tradError(e.code); }
  }
}

// ── Reenviar OTP ─────────────────────────────────────────────────
async function authReenviarOTPRegistro() {
  const msg = document.getElementById('auth-ver-msg');
  const email = _pendingOtp?.email || document.getElementById('auth-ver-email')?.textContent;
  if (!email) {
    if (msg) { msg.style.color = '#C62828'; msg.textContent = 'Error al reenviar. Vuelve a registrarte.'; }
    return;
  }

  const nuevoCode = String(Math.floor(100000 + Math.random() * 900000));
  if (_pendingOtp?.timerInterval) clearInterval(_pendingOtp.timerInterval);
  _pendingOtp = {
    ...(  _pendingOtp || {}),
    code: nuevoCode,
    email,
    expiresAt: Date.now() + 10 * 60 * 1000,
    timerInterval: null,
  };

  const btn = document.getElementById('auth-btn-otp-reenv');
  if (btn) btn.disabled = true;

  const enviado = await _enviarEmailOTP(email, nuevoCode);

  if (btn) btn.disabled = false;
  _iniciarTimerOTP();

  if (enviado) {
    if (msg) { msg.style.color = '#2E7D32'; msg.textContent = '✓ Nuevo código enviado. Revisa tu correo.'; }
  } else {
    console.info('[OTP Reenvío] Nuevo código:', nuevoCode);
    if (msg) { msg.style.color = '#F57F17'; msg.textContent = 'Correo no configurado. Revisa la consola del navegador.'; }
  }

  const input = document.getElementById('auth-otp-input');
  if (input) { input.value = ''; input.focus(); }
}

function authVolverAlLogin() {
  if (_pendingOtp?.timerInterval) clearInterval(_pendingOtp.timerInterval);
  _pendingOtp = null;
  document.querySelector('.auth-tabs')?.style.removeProperty('display');
  const panel = document.getElementById('auth-verificacion-panel');
  if (panel) panel.style.display = 'none';
  const timerEl = document.getElementById('auth-otp-timer');
  if (timerEl) timerEl.textContent = '';
  authCambiarTab('login');
}

function authMostrarCodigoGoogle() {
  const overlay = document.getElementById('auth-google-code-overlay');
  const input = document.getElementById('auth-codigo-google');
  const errEl = document.getElementById('auth-codigo-google-error');
  if (input) input.value = '';
  if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
  if (overlay) overlay.classList.remove('hidden');
  setTimeout(() => input?.focus(), 120);
}

async function _confirmarCodigoGoogle() {
  const input = document.getElementById('auth-codigo-google');
  const errEl = document.getElementById('auth-codigo-google-error');
  const codigo = (input?.value || '').trim();

  if (!codigo) {
    if (errEl) { errEl.textContent = 'Ingresa el código de invitación.'; errEl.classList.add('visible'); }
    return;
  }
  if (codigo.toUpperCase() !== _getCodigoInvitacion().toUpperCase()) {
    if (errEl) { errEl.textContent = 'Código incorrecto. Acceso denegado.'; errEl.classList.add('visible'); }
    if (input) input.value = '';
    setTimeout(() => input?.focus(), 50);
    return;
  }

  // Código correcto — cerrar modal y abrir Google sign-in
  document.getElementById('auth-google-code-overlay')?.classList.add('hidden');
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      _authError(_tradError(e.code));
    }
  }
}

async function authIniciarSesionGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      _authError(_tradError(e.code));
    }
  }
}

async function authCerrarSesion() {
  _cerrarUserMenu();
  if (!confirm('¿Cerrar sesión? Los datos están guardados en la nube.')) return;
  if (typeof registrarCambio === 'function') registrarCambio('Sesión cerrada — ' + (window.currentUser?.email || ''));
  await auth.signOut();
  // Limpiar caché local (los datos están en la nube)
  FIREBASE_STORES.forEach(({ key }) => localStorage.removeItem(key));
  localStorage.removeItem(MIGRATION_FLAG);
  location.reload();
}

// ================================================================
// UI HELPERS
// ================================================================

function _mostrarAuthOverlay() {
  const el = document.getElementById('auth-overlay');
  if (el) el.classList.remove('hidden');
}

function _ocultarAuthOverlay() {
  const el = document.getElementById('auth-overlay');
  if (el) el.classList.add('hidden');
}

function authCambiarTab(tab) {
  document.getElementById('auth-form-login').style.display    = tab === 'login' ? 'flex' : 'none';
  document.getElementById('auth-form-registro').style.display = tab === 'reg'   ? 'flex' : 'none';
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('activo', (i === 0 && tab === 'login') || (i === 1 && tab === 'reg'));
  });
  _authError('');
  _authError('', 'reg');
}

function _authError(msg, form = 'login') {
  const id = form === 'reg' ? 'auth-error-reg' : 'auth-error-login';
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('visible', !!msg);
}

function _authSetLoading(loading, form = 'login') {
  const btnId = form === 'reg' ? 'auth-btn-reg' : 'auth-btn-login';
  const spinId = form === 'reg' ? 'auth-spin-reg' : 'auth-spin-login';
  const btn = document.getElementById(btnId);
  const spin = document.getElementById(spinId);
  if (btn) btn.disabled = loading;
  if (spin) spin.classList.toggle('visible', loading);
}

function _tradError(code) {
  const map = {
    'auth/invalid-email':            'El email no es válido.',
    'auth/user-not-found':           'No existe una cuenta con ese email.',
    'auth/wrong-password':           'Contraseña incorrecta.',
    'auth/email-already-in-use':     'Ese email ya está registrado.',
    'auth/weak-password':            'La contraseña es muy débil.',
    'auth/too-many-requests':        'Demasiados intentos. Intenta más tarde.',
    'auth/network-request-failed':   'Error de red. Verifica tu conexión.',
    'auth/invalid-credential':       'Credenciales inválidas.',
  };
  return map[code] || 'Error al iniciar sesión. Intenta de nuevo.';
}

function _mostrarToastMigracion(msg, ok = false) {
  let el = document.getElementById('auth-migration-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'auth-migration-toast';
    el.className = 'auth-migration-toast';
    document.body.appendChild(el);
  }
  el.style.background = ok ? '#1B5E20' : '#1565C0';
  el.innerHTML = `<span class="material-icons" style="font-size:18px;">${ok ? 'cloud_done' : 'cloud_upload'}</span> ${msg}`;
}

// ── Header: avatar + menú usuario ───────────────────────────────
function _actualizarHeaderUsuario(user) {
  const wrap = document.getElementById('auth-user-wrap');
  if (!wrap) return;

  const inicial = (user.displayName || user.email || 'U')[0].toUpperCase();
  const nombre  = user.displayName || user.email.split('@')[0];

  wrap.innerHTML = `
    <div class="btn-user-wrap">
      <button class="btn-user-account" onclick="toggleUserMenu()" title="Tu cuenta">
        <div class="btn-user-avatar">${inicial}</div>
        <span class="btn-user-name">${nombre}</span>
        <span class="material-icons" style="font-size:18px;color:#78909C;">expand_more</span>
      </button>
      <div class="user-menu" id="user-menu">
        <div class="user-menu-email">${user.email}</div>
        <button class="user-menu-item" onclick="_cerrarUserMenu();abrirMiCuenta()">
          <span class="material-icons" style="font-size:18px;">manage_accounts</span> Mi cuenta
        </button>
        <button class="user-menu-item danger" onclick="authCerrarSesion()">
          <span class="material-icons" style="font-size:18px;">logout</span> Cerrar sesión
        </button>
      </div>
    </div>`;
}

function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.toggle('visible');
}

function _cerrarUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.remove('visible');
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!e.target.closest('.btn-user-wrap')) _cerrarUserMenu();
});

// Enter en inputs del formulario
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('auth-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') authIniciarSesionEmail();
  });
  document.getElementById('auth-pass-reg2')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') authRegistrarse();
  });
});

// ================================================================
// MI CUENTA — Cambiar email y contraseña
// ================================================================

function abrirMiCuenta() {
  const user = window.currentUser;
  if (!user) return;
  // Poblar email actual
  const emailInput = document.getElementById('cuenta-email-nuevo');
  if (emailInput) emailInput.value = user.email || '';
  // Limpiar campos de contraseña y mensajes
  ['cuenta-pass-actual','cuenta-pass-nueva','cuenta-pass-nueva2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _cuentaMsg('email', '');
  _cuentaMsg('pass', '');
  document.getElementById('cuenta-overlay')?.classList.remove('hidden');
}

function cerrarMiCuenta() {
  document.getElementById('cuenta-overlay')?.classList.add('hidden');
}

// Reautenticar (necesario antes de cambiar email o contraseña)
async function _reautenticar(passActual) {
  const user = window.currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, passActual);
  await user.reauthenticateWithCredential(credential);
}

async function authCambiarEmail() {
  const user = window.currentUser;
  if (!user) return;
  const nuevoEmail = document.getElementById('cuenta-email-nuevo').value.trim();
  const passActual = document.getElementById('cuenta-pass-para-email').value;
  if (!nuevoEmail) return _cuentaMsg('email', 'Ingresa el nuevo correo.');
  if (!passActual) return _cuentaMsg('email', 'Ingresa tu contraseña actual para confirmar.');
  if (nuevoEmail === user.email) return _cuentaMsg('email', 'Es el mismo correo actual.');

  _cuentaLoading('email', true);
  try {
    await _reautenticar(passActual);
    await user.verifyBeforeUpdateEmail(nuevoEmail);
    _cuentaMsg('email', '✓ Se envió un correo de verificación a ' + nuevoEmail + '. Confirma el enlace para aplicar el cambio.', true);
    document.getElementById('cuenta-pass-para-email').value = '';
  } catch (e) {
    _cuentaMsg('email', _tradError(e.code));
  }
  _cuentaLoading('email', false);
}

async function authCambiarPassword() {
  const user = window.currentUser;
  if (!user) return;
  const passActual = document.getElementById('cuenta-pass-actual').value;
  const passNueva  = document.getElementById('cuenta-pass-nueva').value;
  const passNueva2 = document.getElementById('cuenta-pass-nueva2').value;
  if (!passActual) return _cuentaMsg('pass', 'Ingresa tu contraseña actual.');
  if (!passNueva)  return _cuentaMsg('pass', 'Ingresa la nueva contraseña.');
  if (passNueva.length < 6) return _cuentaMsg('pass', 'La contraseña debe tener al menos 6 caracteres.');
  if (passNueva !== passNueva2) return _cuentaMsg('pass', 'Las contraseñas no coinciden.');

  _cuentaLoading('pass', true);
  try {
    await _reautenticar(passActual);
    await user.updatePassword(passNueva);
    _cuentaMsg('pass', '✓ Contraseña actualizada correctamente.', true);
    ['cuenta-pass-actual','cuenta-pass-nueva','cuenta-pass-nueva2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  } catch (e) {
    _cuentaMsg('pass', _tradError(e.code));
  }
  _cuentaLoading('pass', false);
}

function _cuentaMsg(section, msg, ok = false) {
  const el = document.getElementById('cuenta-msg-' + section);
  if (!el) return;
  el.textContent = msg;
  el.className = 'auth-error' + (msg ? ' visible' : '') + (ok ? ' ok' : '');
}

function _cuentaLoading(section, loading) {
  const btn  = document.getElementById('cuenta-btn-' + section);
  const spin = document.getElementById('cuenta-spin-' + section);
  if (btn)  btn.disabled = loading;
  if (spin) spin.classList.toggle('visible', loading);
}

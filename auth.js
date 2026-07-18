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
  { store: 'cuentas_estudiantes',  key: 'planificadorRA_cuentas_estudiantes_v1' },
  { store: 'groqKey',              key: 'planificadorRA_groqKey' },
  { store: 'geminiKey',            key: 'planificadorRA_geminiKey' },
  { store: 'openrouterKey',        key: 'planificadorRA_openrouterKey' },
  { store: 'stickies',             key: 'planificadorRA_stickies_v1' },
  { store: 'notas_clase',          key: 'planificadorRA_notas_clase_v1' },
  { store: 'obs_estudiantes',      key: 'planificadorRA_obs_estudiantes_v1' },
  { store: 'eval_formas',          key: 'planificadorRA_eval_formas_v1' },
  { store: 'cal_backups',          key: 'planificadorRA_cal_backups_v1' },
  { store: 'year_archives',       key: 'planificadorRA_year_archives_v1' },
  { store: 'active_year',          key: 'planificadorRA_active_year_v1' },
  { store: 'preferencias',         key: 'planificadorRA_preferencias_v1' },
];

const MIGRATION_FLAG = 'planificadorRA_migrated_v1';

// ── Estado del flujo OTP de registro ────────────────────────────
let _pendingOtp = null;
// { code, email, pass, nombre, expiresAt, timerInterval }
let _registrando = false; // flag para evitar que onAuthStateChanged interfiera durante registro

// ── Observer de estado de autenticación ─────────────────────────
auth.onAuthStateChanged(async (user) => {
  if (_registrando) return; // Registro en curso, se manejará manualmente
  if (user) {
    window.currentUser = user;
    // Verificar perfil y estado de aprobación
    const perfil = await _obtenerPerfilUsuario(user.uid);

    // Superadmins, admins de centro y directores NUNCA se bloquean
    const esSA = _esSuperadminAuth(user.email);
    const esAdmin = !esSA && await _esAdminCentro(user.email);
    const esDirector = !esSA && !esAdmin && perfil && perfil.rol === 'director';
    if (esSA || esAdmin || esDirector) {
      // Si tienen perfil pendiente/rechazado, auto-aprobar
      if (perfil && (perfil.estado === 'pendiente' || perfil.estado === 'rechazado')) {
        const nuevoRol = esSA ? 'superadmin' : esAdmin ? 'admin_centro' : 'director';
        await _crearPerfilUsuario(user.uid, { rol: nuevoRol, estado: 'aprobado' });
      }
      await _onLogin(user);
      return;
    }

    if (perfil && perfil.estado === 'pendiente') {
      _mostrarPantallaPendiente(perfil);
      return;
    }
    if (perfil && perfil.estado === 'rechazado') {
      _mostrarPantallaRechazado(perfil);
      return;
    }
    await _onLogin(user);
  } else {
    window.currentUser = null;
    _mostrarAuthOverlay();
    _cargarCentrosParaRegistro(); // pre-cargar selectores de centros
  }
});

// ── Perfil de usuario en Firestore ────────────────────────────────

/** Obtiene el perfil del usuario desde Firestore */
async function _obtenerPerfilUsuario(uid) {
  try {
    const doc = await db.collection('usuarios').doc(uid).get();
    if (doc.exists) return doc.data();
    return null;
  } catch (e) {
    console.warn('Error obteniendo perfil:', e);
    return null;
  }
}

/** Crea o actualiza el perfil del usuario en Firestore */
async function _crearPerfilUsuario(uid, data) {
  try {
    await db.collection('usuarios').doc(uid).set(data, { merge: true });
  } catch (e) {
    console.error('Error creando perfil:', e);
  }
}

/** Carga la lista de centros educativos en los selectores de registro */
async function _cargarCentrosParaRegistro() {
  try {
    const snap = await db.collection('centros').orderBy('nombre').get();
    const centros = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const selectors = ['auth-centro-reg', 'auth-centro-google'];
    selectors.forEach(selId => {
      const sel = document.getElementById(selId);
      if (!sel) return;
      sel.innerHTML = '<option value="">— Selecciona tu centro educativo —</option>';
      centros.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre + (c.distrito ? ' (' + c.distrito + ')' : '');
        sel.appendChild(opt);
      });
    });
  } catch (e) {
    console.warn('Error cargando centros para registro:', e.code, e.message);
    const selectors = ['auth-centro-reg', 'auth-centro-google'];
    selectors.forEach(selId => {
      const sel = document.getElementById(selId);
      if (!sel) return;
      sel.innerHTML = '<option value="">— Error al cargar centros —</option>';
    });
  }
}

/** Muestra la pantalla de espera para docentes pendientes */
function _mostrarPantallaPendiente(perfil) {
  _actualizarHeaderUsuario(window.currentUser);
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.remove('hidden');
  // Ocultar tabs y formularios
  document.querySelector('.auth-tabs')?.style.setProperty('display', 'none');
  document.getElementById('auth-form-login')?.style.setProperty('display', 'none');
  document.getElementById('auth-form-registro')?.style.setProperty('display', 'none');
  document.getElementById('auth-verificacion-panel')?.style.setProperty('display', 'none');
  // Mostrar panel pendiente
  const panel = document.getElementById('auth-pending-panel');
  if (panel) panel.style.display = 'block';
  // Mostrar nombre del centro
  const centroEl = document.getElementById('auth-pending-centro');
  if (centroEl && perfil.centroNombre) {
    centroEl.textContent = 'Centro: ' + perfil.centroNombre;
  }
}

/** Muestra pantalla de rechazo */
function _mostrarPantallaRechazado(perfil) {
  const overlay = document.getElementById('auth-overlay');
  if (overlay) overlay.classList.remove('hidden');
  document.querySelector('.auth-tabs')?.style.setProperty('display', 'none');
  document.getElementById('auth-form-login')?.style.setProperty('display', 'none');
  document.getElementById('auth-form-registro')?.style.setProperty('display', 'none');
  document.getElementById('auth-verificacion-panel')?.style.setProperty('display', 'none');
  const panel = document.getElementById('auth-pending-panel');
  if (panel) {
    panel.style.display = 'block';
    panel.querySelector('.material-icons').textContent = 'block';
    panel.querySelector('.material-icons').style.color = '#C62828';
    panel.querySelector('div[style*="font-weight:800"]').textContent = 'Cuenta rechazada';
    panel.querySelector('p').innerHTML = 'Tu solicitud de registro fue rechazada por el administrador del centro.<br>Contacta al administrador para más información.';
  }
}

/** Cierre de sesión desde pantalla de pendiente */
async function authCerrarSesionPendiente() {
  await auth.signOut();
  location.reload();
}

/** Verifica si el usuario es superadmin (no necesita centro) */
function _esSuperadminAuth(email) {
  if (!email) return false;
  const defaults = ['soymarcosbremont@gmail.com'];
  if (defaults.includes(email.toLowerCase())) return true;
  try {
    const extra = JSON.parse(localStorage.getItem('tinclass_superadmin_emails') || '[]');
    return extra.map(e => e.toLowerCase()).includes(email.toLowerCase());
  } catch { return false; }
}

/** Verifica si el usuario es admin de algún centro */
async function _esAdminCentro(email) {
  try {
    const snap = await db.collection('centros').get();
    return snap.docs.some(d => (d.data().admins || []).map(e => e.toLowerCase()).includes(email.toLowerCase()));
  } catch { return false; }
}

// ── Al iniciar sesión: carga datos de Firestore ──────────────────
async function _onLogin(user) {
  _actualizarHeaderUsuario(user);

  // Superadmins y admins de centro no necesitan aprobación — asegurar que tienen perfil
  const perfil = await _obtenerPerfilUsuario(user.uid);
  if (!perfil) {
    // Usuario sin perfil (login viejo o superadmin) — crear perfil auto-aprobado
    const esSA = _esSuperadminAuth(user.email);
    const esAdmin = !esSA && await _esAdminCentro(user.email);
    if (esSA || esAdmin) {
      await _crearPerfilUsuario(user.uid, {
        nombre: user.displayName || '',
        email: user.email,
        rol: esSA ? 'superadmin' : 'admin_centro',
        centroId: '',
        centroNombre: '',
        estado: 'aprobado',
        createdAt: new Date().toISOString()
      });
    }
    // Si no es ni superadmin ni admin, es docente sin perfil — crear como pendiente
    else {
      await _crearPerfilUsuario(user.uid, {
        nombre: user.displayName || '',
        email: user.email,
        rol: 'docente',
        centroId: '',
        centroNombre: '',
        estado: 'pendiente',
        createdAt: new Date().toISOString()
      });
      _mostrarPantallaPendiente({ estado: 'pendiente', centroNombre: '' });
      return;
    }
  }

  // ¿Primer login con datos locales sin migrar?
  const yaMigrado = localStorage.getItem(MIGRATION_FLAG);
  const tieneDatosLocales = FIREBASE_STORES.some(({ key }) => localStorage.getItem(key) !== null);

  if (!yaMigrado && tieneDatosLocales) {
    await _migrarDatosLocales(user.uid);
  } else {
    // Cargar datos desde Firestore → localStorage
    await _cargarDesdeFirestore(user.uid);
    // Marcar como migrado para que no vuelva a intentar la migración
    // en el siguiente reload (los datos ya están en Firebase)
    localStorage.setItem(MIGRATION_FLAG, '1');
  }

  // Sincronizar PIN de bloqueo desde el perfil de Firebase
  const perfilPin = perfil || await _obtenerPerfilUsuario(user.uid);
  if (perfilPin?.pin) {
    localStorage.setItem('_tinclass_pin', perfilPin.pin);
  } else {
    localStorage.removeItem('_tinclass_pin');
  }

  _ocultarAuthOverlay();
  // Ocultar panel pendiente por si estaba visible
  const pendPanel = document.getElementById('auth-pending-panel');
  if (pendPanel) pendPanel.style.display = 'none';
  document.querySelector('.auth-tabs')?.style.removeProperty('display');

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
        // Biblioteca: sistema de chunks con fusión local
        if (store === 'biblioteca') {
          const payload = await _cargarBibliotecaChunks(base);
          const localRaw = localStorage.getItem(key);

          // Fusionar Firebase + localStorage para no perder planes
          let firebaseItems = [];
          let localItems = [];
          try { firebaseItems = JSON.parse(payload || '{"items":[]}').items || []; } catch(e) {}
          try { localItems = JSON.parse(localRaw || '{"items":[]}').items || []; } catch(e) {}

          // Índice de IDs en Firebase
          const fbIds = new Set(firebaseItems.map(i => i.id));
          // Planes que están en local pero NO en Firebase (no llegaron a sincronizarse)
          const soloEnLocal = localItems.filter(i => i.id && !fbIds.has(i.id));

          if (soloEnLocal.length > 0) {
            // Hay planes locales que Firebase no tiene → fusionar y subir
            console.warn(`[Biblioteca] ${soloEnLocal.length} plan(es) encontrado(s) en local pero no en Firebase. Fusionando y subiendo...`);
            const merged = { items: [...firebaseItems, ...soloEnLocal] };
            localStorage.setItem(key, JSON.stringify(merged));
            // Subir fusión a Firebase (sin await para no bloquear la carga)
            if (typeof _escribirChunksBiblioteca === 'function') {
              _escribirChunksBiblioteca(base, merged).catch(e => console.warn('Error subiendo fusión:', e));
            }
          } else if (payload) {
            // Firebase está al día → usar datos de Firebase
            localStorage.setItem(key, payload);
          }
          // Si ni Firebase ni local tienen datos, no tocar localStorage
          return;
        }

        // Diarias: carga chunked (o fallback legacy), fusionar con local
        if (store === 'diarias') {
          let fbSesiones = {};
          const metaDoc = await base.doc('diarias_meta').get();
          if (metaDoc.exists && metaDoc.data().payload) {
            // Formato chunked
            const meta = JSON.parse(metaDoc.data().payload);
            const totalChunks = meta.totalChunks || 0;
            for (let i = 0; i < totalChunks; i++) {
              try {
                const chunkDoc = await base.doc('diarias_chunk_' + i).get();
                if (chunkDoc.exists && chunkDoc.data().payload) {
                  const chunk = JSON.parse(chunkDoc.data().payload);
                  Object.assign(fbSesiones, chunk.sesiones || {});
                }
              } catch(e) { console.warn('Error leyendo diarias_chunk_' + i, e); }
            }
          } else {
            // Fallback: formato legacy (doc único)
            try {
              const legacyDoc = await base.doc('diarias').get();
              if (legacyDoc.exists && legacyDoc.data().payload) {
                fbSesiones = JSON.parse(legacyDoc.data().payload).sesiones || {};
              } else {
                // Firebase no tiene diarias en ningún formato → marcar para upload desde local
                window._diariasFbVacio = true;
              }
            } catch(e) { window._diariasFbVacio = true; }
          }
          const localRaw = localStorage.getItem(key);
          let localSesiones = {};
          try { localSesiones = JSON.parse(localRaw || '{}').sesiones || {}; } catch(e) {}
          const merged = { sesiones: { ...fbSesiones, ...localSesiones } };
          localStorage.setItem(key, JSON.stringify(merged));
          return;
        }

        const doc = await base.doc(store).get();
        if (!doc.exists || !doc.data().payload) return;

        // Calificaciones: fusionar con resolución por timestamp
        // El dispositivo con datos más recientes gana; Firebase gana en empate
        // (evita que localStorage viejo de otro dispositivo sobreescriba datos nuevos de Firebase)
        if (store === 'calificaciones') {
          const localRaw = localStorage.getItem(key);
          let fbCal = {}, localCal = {}, fbTs = 0, localTs = 0;
          let fbCursos = {}, localCursos = {};
          let fbArchivados = {}, localArchivados = {};
          try {
            fbCal = JSON.parse(doc.data().payload || '{}') || {};
            fbCursos = fbCal.cursos || {};
            fbArchivados = fbCal.cursosArchivados || {};
            fbTs = fbCal._lastModified || 0;
          } catch(e) {}
          try {
            localCal = JSON.parse(localRaw || '{}') || {};
            localCursos = localCal.cursos || {};
            localArchivados = localCal.cursosArchivados || {};
            localTs = localCal._lastModified || 0;
          } catch(e) {}

          const localGana = localTs > fbTs;
          const base = localGana ? { ...fbCal, ...localCal } : { ...localCal, ...fbCal };
          const cursosMerged = localGana
            ? { ...fbCursos, ...localCursos }
            : { ...localCursos, ...fbCursos };
          const cursosArchivadosMerged = { ...fbArchivados, ...localArchivados };

          const merged = {
            ...base,
            cursos: cursosMerged,
            cursosArchivados: cursosArchivadosMerged,
            _lastModified: Math.max(localTs, fbTs)
          };

          if (!merged.cursoActivoId || !merged.cursos?.[merged.cursoActivoId]) {
            const ids = Object.keys(merged.cursos || {});
            merged.cursoActivoId = ids.length ? ids[0] : null;
          }

          localStorage.setItem(key, JSON.stringify(merged));

          if (JSON.stringify(merged) !== JSON.stringify(fbCal) && window._syncFirebase) {
            window._syncFirebase('calificaciones', merged);
          }
          return;
        }

        // Blog: fusionar por timestamp para evitar que Firebase viejo reescriba
        // el archivado local recién creado al cerrar ciclo.
        if (store === 'blog') {
          const localRaw = localStorage.getItem(key);
          let fbBlog = {}, localBlog = {}, fbTs = 0, localTs = 0;
          try {
            fbBlog = JSON.parse(doc.data().payload || '{}') || {};
            fbTs = Number(fbBlog._lastModified || 0) || 0;
          } catch (e) {}
          try {
            localBlog = JSON.parse(localRaw || '{}') || {};
            localTs = Number(localBlog._lastModified || 0) || 0;
          } catch (e) {}

          const fbPosts = Array.isArray(fbBlog.posts) ? fbBlog.posts : [];
          const localPosts = Array.isArray(localBlog.posts) ? localBlog.posts : [];
          const fbArch = fbBlog.postsArchivados && typeof fbBlog.postsArchivados === 'object' ? fbBlog.postsArchivados : {};
          const localArch = localBlog.postsArchivados && typeof localBlog.postsArchivados === 'object' ? localBlog.postsArchivados : {};

          const localGana = localTs > fbTs;
          const merged = {
            ...(localGana ? { ...fbBlog, ...localBlog } : { ...localBlog, ...fbBlog }),
            posts: localGana ? localPosts : fbPosts,
            postsArchivados: { ...fbArch, ...localArch },
            _lastModified: Math.max(localTs, fbTs, Date.now())
          };

          localStorage.setItem(key, JSON.stringify(merged));

          if (JSON.stringify(merged) !== JSON.stringify(fbBlog) && window._syncFirebase) {
            window._syncFirebase('blog', merged);
          }
          return;
        }

        // Stores dinámicos: el payload es un objeto cuyos keys se restauran individualmente en localStorage
        if (['notas_clase', 'obs_estudiantes', 'eval_formas', 'preferencias'].includes(store)) {
          try {
            const data = JSON.parse(doc.data().payload || '{}');
            Object.entries(data).forEach(([k, v]) => {
              if (v !== null && v !== undefined) localStorage.setItem(k, v);
            });
          } catch (e) { console.warn('Error expandiendo store dinámico:', store, e); }
          return;
        }

        localStorage.setItem(key, doc.data().payload);
      } catch (e) {
        console.warn('Error cargando store:', store, e);
      }
    });
    await Promise.all(promesas);
    // Cargar metadatos de guías HTML adjuntas
    if (typeof _cargarGuiasMeta === 'function') {
      try { await _cargarGuiasMeta(); } catch(e) { console.warn('Error cargando guías:', e); }
    }
  } catch (e) {
    console.error('Error al cargar desde Firestore:', e);
  }
}

async function _cargarBibliotecaChunks(base) {
  // Intentar cargar desde chunks
  const metaDoc = await base.doc('biblioteca_meta').get();
  if (metaDoc.exists && metaDoc.data().payload) {
    const meta = JSON.parse(metaDoc.data().payload);
    const totalChunks = meta.totalChunks || 0;
    const allItems = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkDoc = await base.doc(`biblioteca_chunk_${i}`).get();
      if (chunkDoc.exists && chunkDoc.data().payload) {
        const chunk = JSON.parse(chunkDoc.data().payload);
        allItems.push(...(chunk.items || []));
      }
    }
    return JSON.stringify({ items: allItems });
  }

  // Fallback: doc único antiguo (migración)
  const oldDoc = await base.doc('biblioteca').get();
  if (oldDoc.exists && oldDoc.data().payload) {
    const payload = oldDoc.data().payload;
    // Migrar automáticamente a chunks
    try {
      const biblio = JSON.parse(payload);
      await _escribirChunksBiblioteca(base, biblio);
      await base.doc('biblioteca').delete();
    } catch(e) { console.warn('Error migrando biblioteca a chunks:', e); }
    return payload;
  }
  return null;
}

async function _escribirChunksBiblioteca(base, biblio) {
  const MAX_BYTES = 850000;
  const items = biblio.items || [];
  const chunks = [];
  let currentChunk = [];
  let currentSize = 50;

  for (const item of items) {
    const itemSize = JSON.stringify(item).length;
    if (currentSize + itemSize > MAX_BYTES && currentChunk.length > 0) {
      chunks.push([...currentChunk]);
      currentChunk = [];
      currentSize = 50;
    }
    currentChunk.push(item);
    currentSize += itemSize;
  }
  if (currentChunk.length > 0) chunks.push(currentChunk);
  if (chunks.length === 0) chunks.push([]);

  // Leer cuántos chunks había antes para borrar los sobrantes
  let prevChunks = 0;
  try {
    const metaOld = await base.doc('biblioteca_meta').get();
    if (metaOld.exists) prevChunks = JSON.parse(metaOld.data().payload || '{}').totalChunks || 0;
  } catch(e) {}

  // Guardar chunks nuevos
  for (let i = 0; i < chunks.length; i++) {
    await base.doc(`biblioteca_chunk_${i}`).set({
      payload: JSON.stringify({ items: chunks[i] })
    });
  }

  // Borrar chunks sobrantes del save anterior
  for (let i = chunks.length; i < prevChunks; i++) {
    await base.doc(`biblioteca_chunk_${i}`).delete().catch(() => {});
  }

  // Guardar meta
  await base.doc('biblioteca_meta').set({
    payload: JSON.stringify({ totalChunks: chunks.length, updatedAt: new Date().toISOString() })
  });
}

// Exponer para uso desde app.js
window._guardarBibliotecaChunks = async function(biblio) {
  if (!window.currentUser) return;
  const base = db.collection('users').doc(window.currentUser.uid).collection('data');
  await _escribirChunksBiblioteca(base, biblio);
};

// ── Migrar datos locales a Firestore (primer login) ──────────────
async function _migrarDatosLocales(uid) {
  _mostrarToastMigracion('Sincronizando tus datos con la nube…');
  try {
    const base = db.collection('users').doc(uid).collection('data');
    const promesas = FIREBASE_STORES.map(async ({ store, key }) => {
      // Stores dinámicos: recolectar claves individuales en un objeto
      if (store === 'notas_clase') {
        const data = {};
        Object.keys(localStorage).filter(k => k.startsWith('notaclase_')).forEach(k => { data[k] = localStorage.getItem(k); });
        if (Object.keys(data).length) await base.doc(store).set({ payload: JSON.stringify(data) });
        return;
      }
      if (store === 'obs_estudiantes') {
        const data = {};
        Object.keys(localStorage).filter(k => k.startsWith('obs_est_')).forEach(k => { data[k] = localStorage.getItem(k); });
        if (Object.keys(data).length) await base.doc(store).set({ payload: JSON.stringify(data) });
        return;
      }
      if (store === 'eval_formas') {
        const data = {};
        Object.keys(localStorage).filter(k => k.startsWith('eval_')).forEach(k => { data[k] = localStorage.getItem(k); });
        if (Object.keys(data).length) await base.doc(store).set({ payload: JSON.stringify(data) });
        return;
      }
      if (store === 'preferencias') {
        const data = {};
        ['cfg_dark_mode','cfg_fuente_grande','cfg_alertas','cfg_manana','cfg_asistencia_activa','cfg_umbral_riesgo','cfg_umbral_acts','asist_umbral','planificadorRA_touchMode_v1'].forEach(k => {
          const v = localStorage.getItem(k); if (v !== null) data[k] = v;
        });
        if (Object.keys(data).length) await base.doc(store).set({ payload: JSON.stringify(data) });
        return;
      }
      // Store normal: clave única en localStorage
      const raw = localStorage.getItem(key);
      if (raw) await base.doc(store).set({ payload: raw });
    });
    await Promise.all(promesas);
    localStorage.setItem(MIGRATION_FLAG, '1');
    _mostrarToastMigracion('✓ Datos sincronizados con la nube', true);
    setTimeout(() => document.getElementById('auth-migration-toast')?.remove(), 3000);
  } catch (e) {
    console.error('Error en migración:', e);
    localStorage.setItem(MIGRATION_FLAG, '1');
    setTimeout(() => document.getElementById('auth-migration-toast')?.remove(), 3000);
  }
}

// ── Sincronizar un store a Firestore (llamado tras cada guardado) ─
window._syncFirebase = function(store, data) {
  if (!window.currentUser) return;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return db.collection('users').doc(window.currentUser.uid)
    .collection('data').doc(store)
    .set({ payload })
    .catch(e => console.warn('Sync Firebase error [' + store + ']:', e));
};

// Versión async que garantiza el guardado antes de continuar
window._syncFirebaseAwait = async function(store, data) {
  if (!window.currentUser) return;
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  try {
    await db.collection('users').doc(window.currentUser.uid)
      .collection('data').doc(store)
      .set({ payload });
  } catch (e) {
    console.warn('Sync Firebase error [' + store + ']:', e);
  }
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
  const custom = localStorage.getItem('tinclass_invite_code');
  if (custom) return custom;
  return (typeof TINCLASS_INVITE_CODE_DEFAULT !== 'undefined') ? TINCLASS_INVITE_CODE_DEFAULT : 'TINCLASS2026';
}

function guardarCodigoInvitacion() {
  const input = document.getElementById('cfg-invite-code-input');
  const val = input?.value.trim();
  if (!val) { if (typeof mostrarToast === 'function') mostrarToast('Ingresa un código', 'error'); return; }
  if (val.length < 4) { if (typeof mostrarToast === 'function') mostrarToast('Mínimo 4 caracteres', 'error'); return; }
  localStorage.setItem('tinclass_invite_code', val.toUpperCase());
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
  const centroId = document.getElementById('auth-centro-reg')?.value;
  const centroNombre = document.getElementById('auth-centro-reg')?.selectedOptions[0]?.textContent || '';

  if (!nombre) return _authError('Ingresa tu nombre completo.', 'reg');
  if (!email || !pass || !pass2) return _authError('Completa todos los campos.', 'reg');
  if (!centroId) return _authError('Selecciona tu centro educativo.', 'reg');
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
    centroId,
    centroNombre,
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

  const { email, pass, nombre, centroId, centroNombre } = _pendingOtp;
  if (_pendingOtp.timerInterval) clearInterval(_pendingOtp.timerInterval);
  _pendingOtp = null;

  try {
    _registrando = true; // Evitar que onAuthStateChanged procese antes de crear perfil
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    if (nombre) await cred.user.updateProfile({ displayName: nombre });
    // Crear perfil en Firestore con estado pendiente
    const perfilData = {
      nombre: nombre || '',
      email: email,
      rol: 'docente',
      centroId: centroId || '',
      centroNombre: centroNombre || '',
      estado: 'pendiente',
      createdAt: new Date().toISOString()
    };
    await _crearPerfilUsuario(cred.user.uid, perfilData);
    _registrando = false;
    // Mostrar pantalla de espera directamente
    window.currentUser = cred.user;
    _mostrarPantallaPendiente(perfilData);
  } catch (e) {
    _registrando = false;
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
  const errEl = document.getElementById('auth-codigo-google-error');
  const centroId = document.getElementById('auth-centro-google')?.value;
  const centroNombre = document.getElementById('auth-centro-google')?.selectedOptions[0]?.textContent || '';

  if (!centroId) {
    if (errEl) { errEl.textContent = 'Selecciona tu centro educativo.'; errEl.classList.add('visible'); }
    return;
  }

  // Guardar centro seleccionado para usarlo después del login
  window._pendingGoogleCentro = { centroId, centroNombre };

  // Código correcto — cerrar modal y abrir Google sign-in
  document.getElementById('auth-google-code-overlay')?.classList.add('hidden');
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    _registrando = true;
    const result = await auth.signInWithPopup(provider);
    // Si es usuario nuevo, crear perfil pendiente
    if (result.additionalUserInfo?.isNewUser && window._pendingGoogleCentro) {
      const perfilData = {
        nombre: result.user.displayName || '',
        email: result.user.email,
        rol: 'docente',
        centroId: window._pendingGoogleCentro.centroId,
        centroNombre: window._pendingGoogleCentro.centroNombre,
        estado: 'pendiente',
        createdAt: new Date().toISOString()
      };
      await _crearPerfilUsuario(result.user.uid, perfilData);
      window._pendingGoogleCentro = null;
      _registrando = false;
      window.currentUser = result.user;
      _mostrarPantallaPendiente(perfilData);
      return;
    }
    _registrando = false;
    // Usuario existente — onAuthStateChanged no se disparó, re-evaluar
    window.currentUser = result.user;
    const perfil = await _obtenerPerfilUsuario(result.user.uid);
    if (perfil && perfil.estado === 'pendiente') { _mostrarPantallaPendiente(perfil); return; }
    if (perfil && perfil.estado === 'rechazado') { _mostrarPantallaRechazado(perfil); return; }
    await _onLogin(result.user);
  } catch (e) {
    _registrando = false;
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

function _togglePassVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.querySelector('.material-icons').textContent = show ? 'visibility_off' : 'visibility';
  btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
}

function _mostrarAuthOverlay() {
  const splash = document.getElementById('splash-loader');
  if (splash) { splash.classList.add('oculto'); setTimeout(() => splash.remove(), 500); }
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

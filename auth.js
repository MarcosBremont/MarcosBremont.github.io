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
];

const MIGRATION_FLAG = 'planificadorRA_migrated_v1';

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

  // Iniciar la app (si DOMContentLoaded ya corrió)
  if (typeof _arrancarApp === 'function') _arrancarApp();
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

async function authRegistrarse() {
  const email = document.getElementById('auth-email-reg').value.trim();
  const pass  = document.getElementById('auth-pass-reg').value;
  const pass2 = document.getElementById('auth-pass-reg2').value;
  const nombre = document.getElementById('auth-nombre-reg').value.trim();

  if (!email || !pass || !pass2) return _authError('Completa todos los campos.', 'reg');
  if (pass !== pass2) return _authError('Las contraseñas no coinciden.', 'reg');
  if (pass.length < 6) return _authError('La contraseña debe tener al menos 6 caracteres.', 'reg');

  _authSetLoading(true, 'reg');
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    if (nombre) await cred.user.updateProfile({ displayName: nombre });
  } catch (e) {
    _authSetLoading(false, 'reg');
    _authError(_tradError(e.code), 'reg');
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

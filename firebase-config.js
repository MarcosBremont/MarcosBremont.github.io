// ================================================================
// FIREBASE CONFIGURATION — El Gran Planificador Educativo
// ================================================================
// INSTRUCCIONES:
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto (ej: "gran-planificador")
// 3. En el proyecto: Configuración ⚙️ → Tus apps → Web (</>)
// 4. Registra la app y copia el objeto firebaseConfig
// 5. Pega los valores reales abajo (reemplaza los XXXXXXXX)
// 6. Activa Firestore: Build → Firestore Database → Create database
// 7. Activa Auth: Build → Authentication → Sign-in method
//    → Habilitar "Email/Contraseña" y "Google"
// 8. En Firestore → Rules, pega estas reglas:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        // Datos privados del docente
//        match /users/{userId}/data/{doc} {
//          allow read, write: if request.auth != null
//                             && request.auth.uid == userId;
//        }
//        // Cuentas estudiantes — lectura pública para login en reporte.html
//        match /users/{userId}/data/cuentas_estudiantes {
//          allow read: if true;
//          allow write: if request.auth != null && request.auth.uid == userId;
//        }
//        // Calendario escolar del admin (todos los autenticados leen, solo admin escribe)
//        match /public_calendar/{doc} {
//          allow read: if request.auth != null;
//          allow write: if request.auth != null
//                       && request.auth.token.email == 'tucorreo@gmail.com';
//        }
//        // Blog público — posts visibles sin login
//        match /public_blogs/{userId}/posts/{postId} {
//          allow read: if true;
//          allow write: if request.auth != null && request.auth.uid == userId;
//        }
//        // Blog público — entregas de estudiantes
//        match /public_blogs/{userId}/submissions/{subId} {
//          allow create: if true;
//          allow read, update, delete: if request.auth != null && request.auth.uid == userId;
//        }
//        // Reportes de comportamiento — estudiantes crean, docente lee/borra
//        match /public_blogs/{userId}/reportes_comportamiento/{repId} {
//          allow create: if true;
//          allow read, update, delete: if request.auth != null && request.auth.uid == userId;
//        }
//        // Denuncias anónimas — cualquiera crea, solo el docente lee/borra
//        match /public_blogs/{userId}/denuncias/{denId} {
//          allow create: if true;
//          allow read, update, delete: if request.auth != null && request.auth.uid == userId;
//        }
//        // Historial de sesiones (privado — solo el propio docente)
//        match /users/{userId}/sessions/{sessionId} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//        // Configuración global (superadmin/admin escribe, todos los autenticados leen)
//        match /config/{doc} {
//          allow read: if request.auth != null;
//          allow write: if request.auth != null;
//        }
//        // Centros educativos (lectura pública para registro, escritura autenticada)
//        match /centros/{centroId} {
//          allow read: if true;
//          allow write: if request.auth != null;
//        }
//        // Perfiles de usuario
//        match /perfiles/{userId} {
//          allow read: if request.auth != null;
//          allow write: if request.auth != null;
//        }
//        // Avisos de directores
//        match /avisos/{avisoId} {
//          allow read: if request.auth != null;
//          allow write: if request.auth != null;
//        }
//      }
//    }
//
// 9. En Storage → Rules, pega estas reglas:
//    rules_version = '2';
//    service firebase.storage {
//      match /b/{bucket}/o {
//        match /centros/{centroId}/{allPaths=**} {
//          allow read: if request.auth != null;
//          allow write: if request.auth != null
//                       && request.resource.size < 5 * 1024 * 1024;
//        }
//        match /guias/{uid}/{allPaths=**} {
//          allow read, write, delete: if request.auth != null && request.auth.uid == uid;
//        }
//      }
//    }
// ================================================================

// ── Código de invitación por defecto (cámbialo desde Configuración dentro de la app)
const TINCLASS_INVITE_CODE_DEFAULT = 'TINCLASS2026';

// ── Email del administrador (propietario del calendario escolar compartido) ──
// Cambia este valor por tu propio correo de Google/Email registrado en la app
const ADMIN_EMAIL = 'soymarcosbremont@gmail.com';

// ================================================================
// EMAILJS — Envío de códigos OTP al correo del docente
// ================================================================
// INSTRUCCIONES para activar el envío de códigos por correo:
// 1. Crea una cuenta GRATIS en https://www.emailjs.com  (200 emails/mes)
// 2. En "Email Services" → Add New Service → Gmail (u otro)
//    → conecta tu cuenta → copia el Service ID (ej: service_abc123)
// 3. En "Email Templates" → Create New Template → elegir "One-Time Password"
//    → Asunto: "Codigo de verificacion - TinClass"
//    → La plantilla debe usar {{passcode}} (código) y como destinatario {{to_email}}.
//    → También conviene aceptar {{email}} por compatibilidad.
//    → Guarda y copia el Template ID (ej: template_xyz789)
// 4. En "Account" → copia tu Public Key (ej: user_AbCdEfGhIj)
// 5. En EmailJS revisa "Allowed Origins" y agrega https://tinclass.com
// 5. Pega los tres valores aquí abajo:
// ================================================================
const EMAILJS_SERVICE_ID  = 'service_sgj6ij6';   // Reemplaza con tu Service ID
const EMAILJS_TEMPLATE_ID = 'template_z6zqstl';  // Reemplaza con tu Template ID
const EMAILJS_PUBLIC_KEY  = 'XPOUVX51K_CUwNDVJ';   // Reemplaza con tu Public Key

// ================================================================
// EMAILJS — Alertas de error (misma cuenta que el OTP de arriba, plantilla
// distinta). El envío de correo de estas alertas está DESACTIVADO por
// defecto (ver DEFAULT_CFG.sendEmail en error-reporter.js) para no gastar
// cuota -- los errores se siguen guardando en Firestore igual, revisables
// desde Superadmin > Bugs. Variables de la plantilla:
// {{alert_subject}}, {{alert_title}}, {{error_message}}, {{error_where}}, {{error_when}},
// {{route_url}}, {{severity}}, {{build_version}}, {{sw_version}}, {{user_uid}}, {{user_email_context}}, {{stack}}
// ================================================================
const EMAILJS_ERROR_SERVICE_ID = 'service_sgj6ij6';
const EMAILJS_ERROR_PUBLIC_KEY = 'XPOUVX51K_CUwNDVJ';
const EMAILJS_ERROR_TEMPLATE_ID = 'template_u82f83c';

const firebaseConfig = {
  apiKey:            "AIzaSyA7-ES4dg5_2E9jpFMYqDIygN15GSpOnj0",
  authDomain:        "metabot-7af4d.firebaseapp.com",
  projectId:         "metabot-7af4d",
  storageBucket:     "metabot-7af4d.firebasestorage.app",
  messagingSenderId: "872698787040",
  appId:             "1:872698787040:web:9f8914b0601996d1f68c85"
};

firebase.initializeApp(firebaseConfig);

const db      = firebase.firestore();
const auth    = firebase.auth();
const storage = firebase.storage();

// ── Modo sin conexión ────────────────────────────────────────────────────
// Guarda en IndexedDB una copia local de lo leído y pone en cola cualquier
// escritura que no pueda salir por falta de red (_syncFirebase, subida de
// fotos/evidencias, etc.), reenviándola sola en cuanto vuelva la conexión --
// sin esto, _syncFirebase() (ver auth.js) simplemente descartaba el cambio
// en silencio (solo un console.warn) si fallaba por estar offline, sin
// ninguna cola ni reintento. synchronizeTabs:true porque es realista tener
// TinClass abierto en más de una pestaña o dispositivo a la vez -- sin esa
// opción, la segunda pestaña simplemente falla al activar la persistencia
// (código 'failed-precondition') y queda funcionando sin caché local, no
// truena. Debe llamarse ANTES de cualquier otra operación de Firestore (por
// eso va aquí, justo después de crear `db`) -- pero no hace falta esperar
// esta promesa para seguir usando `db` normalmente: Firestore encola las
// operaciones que le lleguen mientras esto termina de activarse.
// ── Liberar espacio ANTES de activar la coordinación multi-pestaña ──────
// synchronizeTabs:true hace que Firestore escriba sus propias claves de
// coordinación (firestore_targets_/firestore_clients_/firestore_mutations_)
// en localStorage, no solo en IndexedDB -- si el origen ya está casi lleno
// (ej. blog del docente con adjuntos + años archivados, ver guardarBlog en
// app.js), esa escritura interna del SDK falla a mitad de una sincronización
// y Firestore queda en "INTERNAL ASSERTION FAILED: Unexpected state": un
// estado roto que tumba TODAS las lecturas/escrituras, no solo la que lo
// disparó (visto en producción: reportado como "se cayó todo el sistema").
// Se libera lo prescindible ANTES de que esto pueda pasar, mismo criterio
// que _setItemQuotaSafe/LS_QUOTA_SACRIFICIO en auth.js.
// Extraída a función reutilizable: se llama preventivamente aquí abajo ANTES
// de enablePersistence, y también de forma reactiva mas abajo si Firestore
// ya quedó roto (ver _recuperarDeFirestoreRoto) -- el umbral preventivo
// original (4.000.000 caracteres, ~8 MB) resultó insuficiente en la
// práctica: en dispositivos con cuota más chica (móviles, Safari, que a
// veces rondan solo 5 MB = ~2.500.000 caracteres por origen), la limpieza
// corría demasiado tarde -- el origen ya podía estar sobre cuota antes de
// que el chequeo disparara, y hasta el propio localStorage.setItem de la
// limpieza podía fallar en silencio (try/catch de "mejor esfuerzo"), sin
// liberar nada. Bajado a 2.000.000 (~4 MB) para dejar más margen real.
function _liberarEspacioLocalStorage() {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      total += (k || '').length + (localStorage.getItem(k) || '').length;
    }
    if (total < 2000000) return;
    localStorage.removeItem('planificadorRA_cal_backups_v1');
    const blogRaw = localStorage.getItem('planificadorRA_blog_v1');
    if (blogRaw) {
      const blog = JSON.parse(blogRaw);
      if (blog && blog.postsArchivados && Object.keys(blog.postsArchivados).length) {
        blog.postsArchivados = {};
        localStorage.setItem('planificadorRA_blog_v1', JSON.stringify(blog));
      }
    }
  } catch (e) { /* mejor esfuerzo -- si esto falla, enablePersistence sigue su curso normal */ }
}
_liberarEspacioLocalStorage();

// ── Recuperación automática si Firestore igual queda en estado roto ─────
// Aun con la limpieza preventiva de arriba, un dispositivo con cuota
// especialmente chica puede quedarse sin espacio de todos modos -- ahí
// Firestore entra en "INTERNAL ASSERTION FAILED: Unexpected state" y NINGUNA
// lectura/escritura vuelve a funcionar hasta recargar la página (visto en
// producción más de una vez, reportado como "se cayó todo el sistema" /
// pantallas enteras con "Error al cargar: FIRESTORE... Unexpected state").
// En vez de dejar a la persona atascada sin saber qué hacer, se detecta ese
// error específico, se libera espacio de nuevo, y se fuerza UNA sola
// recarga automática -- con una bandera en sessionStorage para no entrar en
// bucle de recargas si el problema no se puede resolver liberando espacio.
function _recuperarDeFirestoreRoto() {
  if (sessionStorage.getItem('tinclass_fs_recovery_attempted')) return;
  try { sessionStorage.setItem('tinclass_fs_recovery_attempted', '1'); } catch (e) {}
  _liberarEspacioLocalStorage();
  setTimeout(() => location.reload(), 300);
}
window.addEventListener('error', function(e) {
  const msg = String(e?.message || e?.error?.message || '');
  if (msg.includes('INTERNAL ASSERTION FAILED')) _recuperarDeFirestoreRoto();
});
window.addEventListener('unhandledrejection', function(e) {
  const msg = String(e?.reason?.message || e?.reason || '');
  if (msg.includes('INTERNAL ASSERTION FAILED')) _recuperarDeFirestoreRoto();
});

db.enablePersistence({ synchronizeTabs: true }).catch(e => {
  // 'failed-precondition': ya hay otra pestaña con persistencia de una sola
  // pestaña activa (no debería pasar con synchronizeTabs, pero por si acaso).
  // 'unimplemented': el navegador no soporta IndexedDB (ej. algunos modos
  // de navegación privada) -- la app sigue funcionando igual, solo sin la
  // cola offline.
  console.warn('[TinClass] No se pudo activar el modo sin conexión de Firestore (' + (e.code || e.message || e) + ') -- la app sigue funcionando normal, solo sin cola de sincronización offline.');
});

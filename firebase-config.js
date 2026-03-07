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
//        // Historial de sesiones (privado — solo el propio docente)
//        match /users/{userId}/sessions/{sessionId} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//      }
//    }
// ================================================================

// ── Código de invitación por defecto (cámbialo desde Configuración dentro de la app)
const METABOT_INVITE_CODE_DEFAULT = 'METABOT2026';

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
//    → Asunto: "Codigo de verificacion - Metabot"
//    → La plantilla usa las variables {{passcode}} (código) y {{email}} (destinatario)
//    → Guarda y copia el Template ID (ej: template_xyz789)
// 4. En "Account" → copia tu Public Key (ej: user_AbCdEfGhIj)
// 5. Pega los tres valores aquí abajo:
// ================================================================
const EMAILJS_SERVICE_ID  = 'service_bvrdwji';   // Reemplaza con tu Service ID
const EMAILJS_TEMPLATE_ID = 'template_9wj88ub';  // Reemplaza con tu Template ID
const EMAILJS_PUBLIC_KEY  = 'lxnRazLrE3DNoOV99';   // Reemplaza con tu Public Key

const firebaseConfig = {
  apiKey:            "AIzaSyA7-ES4dg5_2E9jpFMYqDIygN15GSpOnj0",
  authDomain:        "metabot-7af4d.firebaseapp.com",
  projectId:         "metabot-7af4d",
  storageBucket:     "metabot-7af4d.firebasestorage.app",
  messagingSenderId: "872698787040",
  appId:             "1:872698787040:web:9f8914b0601996d1f68c85"
};

firebase.initializeApp(firebaseConfig);

const db   = firebase.firestore();
const auth = firebase.auth();

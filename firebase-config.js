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
//        match /users/{userId}/data/{doc} {
//          allow read, write: if request.auth != null
//                             && request.auth.uid == userId;
//        }
//      }
//    }
// ================================================================

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

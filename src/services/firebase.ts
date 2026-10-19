import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

// Pull config from app.json -> expo.extra.firebase (set via .env at build time).
// See README.md for how to populate this for your own Firebase project.
const firebaseConfig = (Constants.expoConfig?.extra as any)?.firebase ?? {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// NOTE: this intentionally does NOT use AsyncStorage-backed persistence
// right now. On this project's current dependency versions, running under
// Expo Go's New Architecture, @react-native-async-storage/async-storage's
// native module is present but its legacy storage bridge doesn't actually
// work — it throws "Native module is null, cannot access legacy storage"
// from inside firebase/auth's persistence manager. That failure happens
// deep inside a promise chain firebase/auth owns, not in code we control,
// and in practice it was leaving every auth call (sign up, log in) hanging
// forever rather than rejecting with a catchable error, which is why the
// Create Shop / Log In buttons appeared to do nothing at all.
//
// Using plain getAuth(app) here falls back to in-memory session persistence:
// login will NOT survive a full app restart, but sign up and login actually
// complete and resolve/reject normally.
//
// To get real persistence back: run
//   npx expo install @react-native-async-storage/async-storage
// on your own machine (this resolves the exact version Expo SDK 57's Go
// client expects, which we can't do from a generic `npm install`), then
// swap this back to initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }).
let _auth: ReturnType<typeof getAuth>;
try {
  _auth = initializeAuth(app);
} catch {
  // Fast refresh in dev calls this module more than once — fall back to the existing instance.
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
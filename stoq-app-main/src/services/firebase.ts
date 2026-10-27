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


let _auth: ReturnType<typeof getAuth>;
try {
  _auth = initializeAuth(app);
} catch {
  // Fast refresh in dev calls this module more than once — fall back to the existing instance.
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
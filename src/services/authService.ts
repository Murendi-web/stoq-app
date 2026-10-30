import { initializeApp, deleteApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  getAuth,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getFirestore,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, app as primaryApp } from "./firebase";
import { AppUser, Shop, UserRole } from "../types";

/** Turns Firebase Auth error codes into friendly messages. */
export function getAuthErrorMessage(code?: string, fallback?: string): string {
  switch (code) {
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/user-not-found":
      return "No account exists with this email address.";
    case "auth/invalid-credential":
      // Firebase returns this for BOTH cases when "email enumeration
      // protection" is ON. Turn it off in the console to get the
      // two separate messages above.
      return "Incorrect email or password. Please try again.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Invalid password. It must be at least 6 characters.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    default:
      return fallback || "Something went wrong. Please try again.";
  }
}

export async function registerOwner(params: {
  name: string;
  email: string;
  password: string;
  shopName: string;
  address?: string;
}): Promise<AppUser> {
  const { name, email, password, shopName, address } = params;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  const shopData: Record<string, any> = {
    shopId: uid,
    shopName,
    ownerId: uid,
    createdAt: serverTimestamp(),
  };
  if (address && address.trim() !== "") {
    shopData.address = address;
  }

  await setDoc(doc(db, "shops", uid), shopData);

  const user: AppUser = { userId: uid, shopId: uid, name, email, role: "owner" };
  await setDoc(doc(db, "users", uid), user);

  return user;
}

export async function registerStaff(params: {
  name: string;
  email: string;
  password: string;
  shopId: string;
}): Promise<AppUser> {
  const { name, email, password, shopId } = params;

  const secondaryApp = initializeApp(primaryApp.options, `staff-creation-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  const secondaryDb = getFirestore(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = credential.user.uid;

    const user: AppUser = { userId: uid, shopId, name, email, role: "staff" };
    await setDoc(doc(secondaryDb, "users", uid), user);

    await firebaseSignOut(secondaryAuth);
    return user;
  } finally {
    await deleteApp(secondaryApp);
  }
}

/**
 * Removes a staff member's access to the shop by deleting their Firestore
 * profile. login() throws "No profile found for this account" when that
 * doc is missing, so this revokes app access immediately even though their
 * underlying Firebase Auth account still technically exists (deleting that
 * fully requires Admin SDK, i.e. a Cloud Function).
 */
export async function removeStaff(userId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId));
}

export async function login(email: string, password: string): Promise<AppUser> {
  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    throw new Error(getAuthErrorMessage(err?.code));
  }

  const snap = await getDoc(doc(db, "users", credential.user.uid));
  if (!snap.exists()) {
    await firebaseSignOut(auth);
    throw new Error("No profile found for this account. Contact your shop owner.");
  }
  return snap.data() as AppUser;
}

export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Sends Firebase's built-in password reset email. No Cloud Function needed, works on the free Spark plan. */
export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export function hasPermission(
  role: UserRole,
  action: "manageSuppliers" | "manageThresholds" | "viewReports" | "manageStaff"
): boolean {
  if (role === "owner") return true;
  return false;
}

export function subscribeToStaff(shopId: string, onChange: (staff: AppUser[]) => void) {
  const q = query(
    collection(db, "users"),
    where("shopId", "==", shopId),
    where("role", "==", "staff")
  );
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => d.data() as AppUser));
  });
}
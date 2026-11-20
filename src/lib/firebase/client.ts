import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedFunctions: Functions | null = null;
let emulatorsConnected = false;

export function getFirebaseClients(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
} | null {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return null;
  }

  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  if (!cachedAuth) cachedAuth = getAuth(cachedApp);
  if (!cachedDb) cachedDb = getFirestore(cachedApp);
  if (!cachedFunctions) cachedFunctions = getFunctions(cachedApp);

  if (!emulatorsConnected && process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true") {
    try {
      connectAuthEmulator(cachedAuth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(cachedDb, "127.0.0.1", 8080);
      connectFunctionsEmulator(cachedFunctions, "127.0.0.1", 5001);
      emulatorsConnected = true;
    } catch {
      // Ignore already-connected warnings in Fast Refresh
    }
  }

  return {
    app: cachedApp,
    auth: cachedAuth,
    db: cachedDb,
    functions: cachedFunctions,
  };
}

export async function syncUserProfileToFirestore(user: User): Promise<void> {
  if (user.isAnonymous) return;
  const clients = getFirebaseClients();
  if (!clients) return;
  try {
    await setDoc(
      doc(clients.db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        project: firebaseConfig.projectId || "truth-desire",
        lastSeenAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Non-blocking fallback when Firestore isn't provisioned yet or device is offline
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const clients = getFirebaseClients();
  if (!clients) return null;
  const cred = await signInWithEmailAndPassword(clients.auth, email, password);
  await syncUserProfileToFirestore(cred.user);
  return cred.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User | null> {
  const clients = getFirebaseClients();
  if (!clients) return null;
  const cred = await createUserWithEmailAndPassword(clients.auth, email, password);
  if (displayName?.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
  await syncUserProfileToFirestore(cred.user);
  return cred.user;
}

export async function signInWithGoogle(): Promise<User | null> {
  const clients = getFirebaseClients();
  if (!clients) return null;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const cred = await signInWithPopup(clients.auth, provider);
    await syncUserProfileToFirestore(cred.user);
    return cred.user;
  } catch (err) {
    const code = (err as { code?: string })?.code || "";
    if (code === "auth/popup-blocked") {
      await signInWithRedirect(clients.auth, provider);
      return null;
    }
    throw err;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  const clients = getFirebaseClients();
  if (!clients) return;
  await sendPasswordResetEmail(clients.auth, email.trim());
}

export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const clients = getFirebaseClients();
  if (!clients?.auth.currentUser) return null;
  return clients.auth.currentUser.getIdToken(forceRefresh);
}

export async function ensureAnonymousFirebaseSession(): Promise<User | null> {
  const clients = getFirebaseClients();
  if (!clients) return null;
  if (clients.auth.currentUser) return clients.auth.currentUser;
  const cred = await signInAnonymously(clients.auth);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  const clients = getFirebaseClients();
  if (!clients) return;
  await signOut(clients.auth);
}

export function subscribeFirebaseAuth(callback: (user: User | null) => void): () => void {
  const clients = getFirebaseClients();
  if (!clients) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(clients.auth, callback);
}

export const firebaseConfig = {
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
      firebaseConfig.appId,
  );
}

// Account identity and private app results do not require a Firestore profile copy.
export function isFirebaseProfileSyncEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROFILE_SYNC_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true"
  );
}

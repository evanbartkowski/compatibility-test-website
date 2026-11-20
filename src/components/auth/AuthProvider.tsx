"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import {
  isFirebaseConfigured,
  signOutFirebase,
  subscribeFirebaseAuth,
  syncUserProfileToFirestore,
} from "@/lib/firebase/client";
import { SignInModal, type AuthModalMode } from "./SignInModal";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  firebaseEnabled: boolean;
  modalOpen: boolean;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  firebaseEnabled: false,
  modalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const firebaseEnabled = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(firebaseEnabled);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthModalMode>("signin");
  const syncedUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeFirebaseAuth(async (nextUser) => {
      const effectiveUser = nextUser && !nextUser.isAnonymous ? nextUser : null;
      setUser(effectiveUser);
      setLoading(false);

      if (effectiveUser && syncedUidRef.current !== effectiveUser.uid) {
        try {
          const idToken = await effectiveUser.getIdToken();
          const res = await fetch("/api/account/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          if (res.ok) {
            syncedUidRef.current = effectiveUser.uid;
            void syncUserProfileToFirestore(effectiveUser);
            router.refresh();
          }
        } catch {
          // Non-fatal: local guest session still functions seamlessly
        }
      } else if (!effectiveUser && syncedUidRef.current !== null) {
        syncedUidRef.current = null;
        try {
          await fetch("/api/account/session", { method: "DELETE" });
          router.refresh();
        } catch {
          // ignore
        }
      }
    });

    return () => unsubscribe();
  }, [firebaseEnabled, router]);

  const openAuthModal = useCallback((mode: AuthModalMode = "signin") => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    syncedUidRef.current = null;
    await signOutFirebase();
    await fetch("/api/account/session", { method: "DELETE" }).catch(() => {});
    setUser(null);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseEnabled,
        modalOpen,
        openAuthModal,
        closeAuthModal,
        signOut: handleSignOut,
      }}
    >
      {children}
      <SignInModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialMode={modalMode}
      />
    </AuthContext.Provider>
  );
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}

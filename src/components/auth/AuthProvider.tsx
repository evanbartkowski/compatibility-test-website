"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { User } from "firebase/auth";
import type { AuthModalMode } from "./SignInModal";
import { isFirebaseConfigured } from "@/lib/firebase/config";
const SignInModal = dynamic(
  () => import("./SignInModal").then((module) => module.SignInModal),
  { ssr: false },
);
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  firebaseEnabled: boolean;
  sessionReady: boolean;
  sessionError: string | null;
  modalOpen: boolean;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  firebaseEnabled: false,
  sessionReady: false,
  sessionError: null,
  modalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter(),
    firebaseEnabled = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(firebaseEnabled),
    [sessionReady, setSessionReady] = useState(false),
    [sessionError, setSessionError] = useState<string | null>(null),
    [modalOpen, setModalOpen] = useState(false),
    [modalMode, setModalMode] = useState<AuthModalMode>("signin");
  const synced = useRef<string | null>(null),
    pending = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!firebaseEnabled) return;
    let disposed = false,
      unsubscribe = () => {};
    import("@/lib/firebase/client")
      .then((firebase) => {
        if (disposed) return;
        unsubscribe = firebase.subscribeFirebaseAuth(async (next) => {
          if (disposed) return;
          pending.current?.abort();
          const active = next && !next.isAnonymous ? next : null;
          setUser(active);
          if (active && synced.current !== active.uid) {
            const controller = new AbortController();
            pending.current = controller;
            try {
              const idToken = await active.getIdToken();
              const response = await fetch("/api/account/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
                signal: controller.signal,
              });
              if (!response.ok)
                throw new Error(
                  "Account connection is unavailable. Your browser's guest results remain private.",
                );
              if (disposed || controller.signal.aborted) return;
              synced.current = active.uid;
              setSessionReady(true);
              setSessionError(null);
              router.refresh();
            } catch (error) {
              if (!disposed && !controller.signal.aborted) {
                setSessionReady(false);
                setSessionError(
                  error instanceof Error
                    ? error.message
                    : "Unable to connect your account. Try signing in again.",
                );
              }
            } finally {
              if (!disposed) setLoading(false);
            }
          } else if (!active) {
            setSessionReady(false);
            setLoading(false);
            if (synced.current) {
              synced.current = null;
              await fetch("/api/account/session", { method: "DELETE" });
              router.refresh();
            }
          } else {
            setSessionReady(true);
            setLoading(false);
          }
        });
      })
      .catch(() => {
        setLoading(false);
        setSessionError(
          "Sign-in is temporarily unavailable. You can continue as a guest.",
        );
      });
    return () => {
      disposed = true;
      pending.current?.abort();
      unsubscribe();
    };
  }, [firebaseEnabled, router]);
  const openAuthModal = useCallback((mode: AuthModalMode = "signin") => {
      setModalMode(mode);
      setModalOpen(true);
    }, []),
    closeAuthModal = useCallback(() => setModalOpen(false), []);
  const signOut = useCallback(async () => {
    pending.current?.abort();
    const response = await fetch("/api/account/session", { method: "DELETE" });
    if (!response.ok) throw new Error("Sign-out could not finish. Try again.");
    const firebase = await import("@/lib/firebase/client");
    await firebase.signOutFirebase();
    synced.current = null;
    setUser(null);
    setSessionReady(false);
    setSessionError(null);
    router.refresh();
  }, [router]);
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseEnabled,
        sessionReady,
        sessionError,
        modalOpen,
        openAuthModal,
        closeAuthModal,
        signOut,
      }}
    >
      {sessionError && (
        <p role="alert" className="account-connection-notice">
          {sessionError}
        </p>
      )}
      {children}
      {modalOpen && (
        <SignInModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          initialMode={modalMode}
        />
      )}
    </AuthContext.Provider>
  );
}
export function useOptionalAuth() {
  return useContext(AuthContext);
}

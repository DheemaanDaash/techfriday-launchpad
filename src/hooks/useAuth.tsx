import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    try {
      const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1) Set up listener FIRST (synchronous callback only — no awaits)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // fire-and-forget — never await inside this callback
        setTimeout(() => {
          if (mounted) checkAdmin(newSession.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
      }

      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" && !newSession) {
        setIsAdmin(false);
      }
    });

    // 2) Then check existing session
    supabase.auth.getSession()
      .then(({ data: { session: existing } }) => {
        if (!mounted) return;
        setSession(existing);
        setUser(existing?.user ?? null);
        if (existing?.user) {
          setTimeout(() => {
            if (mounted) checkAdmin(existing.user.id);
          }, 0);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // 3) Safety timeout — never hang forever
    const timeoutId = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      setSession(data.session);
      setUser(data.user);
      checkAdmin(data.user.id);
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

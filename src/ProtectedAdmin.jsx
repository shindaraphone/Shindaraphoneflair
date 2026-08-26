import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
function ProtectedAdmin({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  async function checkAdmin() {
    try {
      setChecking(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setIsAdmin(false);
        window.location.replace("/admin-login");
        return;
      }
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, email, is_admin")
          .eq("id", user.id)
          .maybeSingle();
      if (profileError) {
        console.error(
          "Admin profile check error:",
          profileError
        );
        await supabase.auth.signOut();
        setIsAdmin(false);
        window.location.replace("/admin-login");
        return;
      }
      if (!profile) {
        console.error(
          "No profile found for admin user."
        );
        await supabase.auth.signOut();
        setIsAdmin(false);
        window.location.replace("/admin-login");
        return;
      }
      if (profile.is_admin !== true) {
        console.error(
          "User is authenticated but is not an admin."
        );
        await supabase.auth.signOut();
        setIsAdmin(false);
        window.location.replace("/admin-login");
        return;
      }
      setIsAdmin(true);
    } catch (error) {
      console.error(
        "Admin authentication error:",
        error
      );
      setIsAdmin(false);
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error(
          "Sign out error:",
          signOutError
        );
      }
      window.location.replace("/admin-login");
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    let mounted = true;
    async function verify() {
      if (!mounted) return;
      await checkAdmin();
    }
    verify();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (
          event === "SIGNED_OUT" ||
          !session
        ) {
          setIsAdmin(false);
          if (
            window.location.pathname === "/admin"
          ) {
            window.location.replace(
              "/admin-login"
            );
          }
          return;
        }
        if (event === "SIGNED_IN") {
          checkAdmin();
        }
      }
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  /*
  ========================================
  LOADING
  ========================================
  */
  if (checking) {
    return (
      <div className="protected-admin-loading">
        <style>{`
          * {
            box-sizing: border-box;
          }
          html,
          body {
            margin: 0;
            padding: 0;
          }
          .protected-admin-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background:
              radial-gradient(
                circle at 20% 10%,
                rgba(124,58,237,.15),
                transparent 35%
              ),
              #f5f5f7;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "SF Pro Display",
              "Segoe UI",
              sans-serif;
            color: #111;
          }
          .protected-admin-loading-box {
            width: min(360px, 100%);
            text-align: center;
          }
          .protected-admin-spinner {
            width: 44px;
            height: 44px;
            border: 4px solid
              rgba(0,0,0,.08);
            border-top-color: #111;
            border-radius: 50%;
            animation:
              protectedSpin
              .8s
              linear
              infinite;
            margin:
              0 auto 20px;
          }
          .protected-admin-loading-box strong {
            display: block;
            font-size: 16px;
            font-weight: 800;
          }
          .protected-admin-loading-box p {
            margin: 8px 0 0;
            font-size: 13px;
            opacity: .5;
          }
          @keyframes protectedSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
        <div className="protected-admin-loading-box">
          <div
            className="protected-admin-spinner"
          />
          <strong>
            Checking admin access...
          </strong>
          <p>
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }
  /*
  ========================================
  NOT ADMIN
  ========================================
  */
  if (!isAdmin) {
    return null;
  }
  /*
  ========================================
  VERIFIED ADMIN
  ========================================
  */
  return children;
}
export default ProtectedAdmin;
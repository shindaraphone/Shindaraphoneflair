import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseAdminClient";
import Admin from "./Admin";
import AdminLogin from "./AdminLogin";

function ProtectedAdmin() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  // Tracks whether we've ever successfully verified an admin in this
  // browser tab. Once true, later re-checks (triggered by Supabase's
  // automatic token refresh on tab focus) run silently in the
  // background instead of flashing the spinner and remounting Admin.
  const hasVerifiedRef = useRef(false);

  async function checkAdmin() {
    try {
      if (!hasVerifiedRef.current) {
        setChecking(true);
      }

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setUser(null);
        hasVerifiedRef.current = false;
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, is_admin")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("PROFILE CHECK ERROR:", profileError);
        await supabase.auth.signOut();
        setUser(null);
        hasVerifiedRef.current = false;
        return;
      }

      if (!profile) {
        console.error("No profile found for this user.");
        await supabase.auth.signOut();
        setUser(null);
        hasVerifiedRef.current = false;
        return;
      }

      if (profile.is_admin !== true) {
        console.error("User is not an administrator.");
        await supabase.auth.signOut();
        setUser(null);
        hasVerifiedRef.current = false;
        return;
      }

      setUser(currentUser);
      hasVerifiedRef.current = true;
    } catch (error) {
      console.error("ADMIN AUTH ERROR:", error);
      setUser(null);
      hasVerifiedRef.current = false;
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setChecking(false);
        hasVerifiedRef.current = false;
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setTimeout(() => {
          if (mounted) {
            checkAdmin();
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * CHECKING ADMIN ACCESS
   * Only shown on the very first check in this tab. Background
   * re-verification (from token refreshes when you switch back to
   * this tab) happens silently — you stay on whatever page you were
   * on instead of getting bounced back to a loading screen.
   */

  if (checking) {
    return (
      <div className="protected-admin-loading">
        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
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
          }

          .protected-admin-loading-box {
            text-align: center;
          }

          .protected-admin-spinner {
            width: 42px;
            height: 42px;
            border: 4px solid rgba(0,0,0,.08);
            border-top-color: #111;
            border-radius: 50%;
            animation:
              protectedSpin .8s linear infinite;
            margin: 0 auto 18px;
          }

          .protected-admin-loading-box strong {
            display: block;
            font-size: 15px;
          }

          .protected-admin-loading-box p {
            margin-top: 7px;
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
          <div className="protected-admin-spinner"></div>

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
   * NOT LOGGED IN
   */

  if (!user) {
    return (
      <AdminLogin
        onLogin={() => {
          window.location.href = "/admin";
        }}
      />
    );
  }

  /*
   * ADMIN VERIFIED
   */

  return <Admin />;
}

export default ProtectedAdmin;
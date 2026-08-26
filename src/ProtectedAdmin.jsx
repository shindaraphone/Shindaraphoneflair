import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Admin from "./Admin";
import AdminLogin from "./AdminLogin";

function ProtectedAdmin() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  async function checkAdmin() {
    try {
      setChecking(true);

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, email, is_admin")
          .eq("id", currentUser.id)
          .maybeSingle();

      if (profileError) {
        console.error("Profile check error:", profileError);

        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      if (!profile) {
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      if (profile.is_admin !== true) {
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error("Admin authentication error:", error);
      setUser(null);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      await checkAdmin();

      if (!mounted) return;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        /*
         * IMPORTANT:
         * Do NOT make Supabase async calls directly
         * inside onAuthStateChange.
         */

        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setChecking(false);
          return;
        }

        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          /*
           * Run outside the Supabase auth callback.
           */
          setTimeout(() => {
            if (mounted) {
              checkAdmin();
            }
          }, 0);
        }
      });

      return subscription;
    }

    let subscription;

    initialize().then((result) => {
      subscription = result;
    });

    return () => {
      mounted = false;

      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

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

  if (!user) {
    return (
      <AdminLogin
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />
    );
  }

  return <Admin />;
}

export default ProtectedAdmin;
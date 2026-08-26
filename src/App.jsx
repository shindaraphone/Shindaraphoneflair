import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { loadNigeriaLocations } from "./nigeriaLocations";

const WHATSAPP = "2348118294548";
const TIKTOK = "https://www.tiktok.com/@shindara.communication";
const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);

    const src = "https://js.paystack.co/v2/inline.js";
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      existing.addEventListener("load", () =>
        window.PaystackPop
          ? resolve(window.PaystackPop)
          : reject(new Error("Paystack could not be loaded."))
      );
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () =>
      window.PaystackPop
        ? resolve(window.PaystackPop)
        : reject(new Error("Paystack could not be loaded."));
    script.onerror = () =>
      reject(new Error("Unable to load Paystack."));
    document.body.appendChild(script);
  });
}

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState("profile");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  /* NIGERIAN LOCATIONS */

  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");

  useEffect(() => {
    async function getLocations() {
      try {
        setLocationsLoading(true);
        setLocationsError("");

        const data = await loadNigeriaLocations();

        if (!Array.isArray(data) || !data.length) {
          throw new Error("No Nigerian locations found.");
        }

        setLocations(data);
      } catch (error) {
        console.error("Location loading error:", error);
        setLocationsError(
          "Unable to load Nigerian states and cities. Please refresh and try again."
        );
      } finally {
        setLocationsLoading(false);
      }
    }

    getLocations();
  }, []);

  const states = useMemo(
    () => locations.map((item) => item.name).filter(Boolean),
    [locations]
  );

  const cities = useMemo(() => {
    const selected = locations.find(
      (item) =>
        item.name?.toLowerCase() === deliveryState.toLowerCase()
    );

    return selected?.cities || [];
  }, [locations, deliveryState]);

  function handleStateChange(value) {
    setDeliveryState(value);
    setDeliveryCity("");
  }

  /* USER */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const currentUser = data?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser.id);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser.id);
      } else {
        setProfile(null);
        setOrders([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* PRODUCTS */

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel("store-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        loadProducts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setProducts([]);
      setProductsError("We couldn't load our products right now.");
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  /* PROFILE */

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile error:", error);
      return;
    }

    setProfile(data || null);

    if (data) {
      setProfileName(data.name || "");
      setProfilePhone(data.phone || "");
      setCustomerName(data.name || "");
      setCustomerPhone(data.phone || "");
    }
  }

  /* ORDERS */

  async function loadOrders() {
    if (!user) return;

    setOrdersLoading(true);
    setOrdersError("");

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          price,
          quantity,
          image_url
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setOrders([]);
      setOrdersError("We couldn't load your orders right now.");
    } else {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  }

  async function openAccount() {
    setAuthMessage("");
    setSettingsMessage("");
    setPasswordMessage("");
    setAccountOpen(true);

    if (user) {
      await loadProfile(user.id);
      await loadOrders();
    }
  }

  /* AUTH */

  async function handleAuth(event) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "signup") {
        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim();

        if (!cleanName)
          return setAuthMessage("Please enter your full name.");
        if (!cleanPhone)
          return setAuthMessage("Please enter your phone number.");
        if (!cleanEmail)
          return setAuthMessage("Please enter your email address.");

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone,
            },
          },
        });

        if (error) throw error;

        if (data?.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              name: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
            });

          if (profileError) {
            console.error("Profile save:", profileError);
          }
        }

        setPassword("");

        if (!data.session) {
          setAuthMessage(
            "Account created successfully! Please check your email to confirm your account."
          );
        } else {
          setCustomerName(cleanName);
          setCustomerPhone(cleanPhone);
          setFullName("");
          setEmail("");
          setPhone("");
          setAccountOpen(false);
        }

        return;
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      if (data?.user) await loadProfile(data.user.id);

      setEmail("");
      setPassword("");
      setAccountOpen(false);
    } catch (error) {
      console.error(error);
      setAuthMessage(
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function signInWithProvider(provider) {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      setAuthMessage(
        error?.message || `Unable to continue with ${provider}.`
      );
      setAuthLoading(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setResetLoading(true);
    setResetMessage("");

    try {
      const cleanEmail = resetEmail.trim();

      if (!cleanEmail) {
        setResetMessage("Please enter your email address.");
        return;
      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin,
        });

      if (error) throw error;

      setResetMessage(
        "Password reset link sent. Please check your email."
      );
    } catch (error) {
      setResetMessage(
        error?.message || "Unable to send password reset email."
      );
    } finally {
      setResetLoading(false);
    }
  }

  /* PROFILE SETTINGS */

  async function saveProfileSettings(event) {
    event.preventDefault();

    if (!user) return;

    setSettingsLoading(true);
    setSettingsMessage("");

    try {
      const cleanName = profileName.trim();
      const cleanPhone = profilePhone.trim();

      if (!cleanName) {
        setSettingsMessage("Please enter your name.");
        return;
      }

      if (!cleanPhone) {
        setSettingsMessage("Please enter your phone number.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: cleanName,
          phone: cleanPhone,
          email: user.email || "",
        });

      if (error) throw error;

      await loadProfile(user.id);

      setCustomerName(cleanName);
      setCustomerPhone(cleanPhone);

      setSettingsMessage("Your account details have been updated.");
    } catch (error) {
      console.error(error);
      setSettingsMessage(
        error?.message || "Unable to update your details."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

  /* PASSWORD */

  async function changePassword(event) {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      if (!newPassword || newPassword.length < 6) {
        setPasswordMessage(
          "Password must be at least 6 characters."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setPasswordMessage("Your password has been changed successfully.");
    } catch (error) {
      setPasswordMessage(
        error?.message || "Unable to change your password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrders([]);
    setAccountOpen(false);
  }

  /* CART */

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });
  }

  function increaseQuantity(id) {
    setCart((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((items) => items.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  /* CHECKOUT */

  function openCheckout() {
    if (!cart.length) return;

    setCartOpen(false);
    setOrderMessage("");
    setOrderSuccess(false);

    if (!user) {
      setAccountOpen(true);
      setAuthMessage(
        "Please sign in or create an account before checkout."
      );
      return;
    }

    setCheckoutOpen(true);
  }

  async function saveOrder(reference) {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_address: deliveryAddress.trim(),
        delivery_city: deliveryCity.trim(),
        delivery_state: deliveryState.trim(),
        total: cartTotal,
        status: "paid",
        payment_reference: reference,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const items = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image_url: item.image_url || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return order;
  }

  async function placeOrder(event) {
    event.preventDefault();

    if (!user) {
      setOrderMessage("Please sign in before placing your order.");
      return;
    }

    if (!customerName.trim()) {
      setOrderMessage("Please enter your full name.");
      return;
    }

    if (!customerPhone.trim()) {
      setOrderMessage("Please enter your phone number.");
      return;
    }

    if (!deliveryAddress.trim()) {
      setOrderMessage("Please enter your delivery address.");
      return;
    }

    if (!deliveryState) {
      setOrderMessage("Please select your state.");
      return;
    }

    if (!deliveryCity) {
      setOrderMessage("Please select your city/LGA.");
      return;
    }

    if (!cart.length) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    setOrderLoading(true);
    setOrderMessage("");

    try {
      const PaystackPop = await loadPaystackScript();
      const popup = new PaystackPop();

      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(cartTotal * 100),
        currency: "NGN",

        metadata: {
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          delivery_city: deliveryCity.trim(),
          delivery_state: deliveryState.trim(),
          user_id: user.id,
        },

        onSuccess: async (transaction) => {
          try {
            setOrderMessage(
              "Payment successful. Verifying your payment..."
            );

            const reference = transaction.reference;

            if (!reference) {
              throw new Error(
                "Paystack did not return a payment reference."
              );
            }

            const { data, error } =
              await supabase.functions.invoke(
                "verify-paystack-payment",
                {
                  body: { reference },
                }
              );

            if (error) throw error;

            if (!data?.success) {
              throw new Error(
                data?.error || "Payment could not be verified."
              );
            }

            const order = await saveOrder(reference);

            setOrderSuccess(true);
            setOrderMessage(
              `Order placed successfully! Your order number is ${String(
                order.id
              )
                .slice(0, 8)
                .toUpperCase()}.`
            );

            setCart([]);
            setCustomerName("");
            setCustomerPhone("");
            setDeliveryAddress("");
            setDeliveryState("");
            setDeliveryCity("");
          } catch (error) {
            console.error(error);
            setOrderMessage(
              error?.message ||
                "Payment was received, but we couldn't complete the order. Please contact Shindara Phoneflair."
            );
          } finally {
            setOrderLoading(false);
          }
        },

        onCancel: () => {
          setOrderLoading(false);
          setOrderMessage(
            "Payment was cancelled. Your order has not been placed."
          );
        },
      });
    } catch (error) {
      console.error(error);
      setOrderMessage(
        error?.message ||
          "Unable to open Paystack. Please try again."
      );
      setOrderLoading(false);
    }
  }

  /* HELPERS */

  function whatsapp() {
    const message = encodeURIComponent(
      "Hello Shindara Phoneflair, I would like to make an enquiry."
    );

    window.open(
      `https://wa.me/${WHATSAPP}?text=${message}`,
      "_blank"
    );
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function statusLabel(status) {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  return (
    <div className="app">
      <style>{`
        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:#f7f7f8;color:#111}
        button,input,select,textarea{font:inherit}
        button,a{-webkit-tap-highlight-color:transparent}
        button{cursor:pointer}
        .app{min-height:100vh;background:radial-gradient(circle at 15% 10%,rgba(124,58,237,.08),transparent 28%),radial-gradient(circle at 85% 20%,rgba(59,130,246,.08),transparent 25%),#f7f7f8}
        .announcement-bar{width:100%;overflow:hidden;background:#111;color:#fff;padding:11px 0;white-space:nowrap}
        .announcement-track{display:flex;width:max-content;animation:marquee 22s linear infinite}
        .announcement-group{display:flex;flex-shrink:0}
        .announcement-group span{margin-right:80px;font-size:13px;font-weight:700;letter-spacing:.4px}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .header{position:sticky;top:0;z-index:900;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 5%;background:rgba(255,255,255,.86);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,.06)}
        .logo{text-decoration:none;color:#111;font-weight:800;font-size:21px;letter-spacing:-1px}
        .logo span{display:block;font-size:11px;font-weight:500;letter-spacing:1.8px;text-transform:uppercase;opacity:.55}
        .nav{display:flex;gap:28px}
        .nav a{color:#222;text-decoration:none;font-size:14px;font-weight:600;opacity:.75}
        .header-actions{display:flex;gap:8px}
        .account-button,.cart-button{border:1px solid rgba(0,0,0,.08);border-radius:999px;padding:10px 14px;background:#fff;font-weight:700;font-size:13px}
        .cart-button{background:#111;color:#fff}
        .hero{min-height:650px;display:flex;align-items:center;padding:80px 7%;background:radial-gradient(circle at 70% 40%,rgba(124,58,237,.16),transparent 35%),radial-gradient(circle at 90% 80%,rgba(37,99,235,.13),transparent 30%)}
        .hero-content{max-width:720px}
        .eyebrow{font-size:11px;font-weight:800;letter-spacing:2px;opacity:.55;margin:0 0 14px}
        .hero h1{font-size:clamp(48px,7vw,88px);line-height:.94;letter-spacing:-5px;margin:0 0 28px}
        .hero-text{max-width:550px;font-size:18px;line-height:1.65;opacity:.68;margin-bottom:32px}
        .shop-button{display:inline-block;background:#111;color:#fff;text-decoration:none;padding:15px 22px;border-radius:999px;font-weight:700}
        .section{padding:90px 7%}
        .section h2{margin:0 0 35px;font-size:46px;letter-spacing:-2.5px}
        .category-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
        .category-card{min-height:150px;display:flex;flex-direction:column;justify-content:space-between;padding:20px;text-decoration:none;color:inherit;background:rgba(255,255,255,.8);border:1px solid rgba(0,0,0,.06);border-radius:22px}
        .category-card span{font-size:30px}
        .category-card strong{font-size:14px}
        .product-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
        .product-card{background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:24px;overflow:hidden;box-shadow:0 10px 35px rgba(0,0,0,.04)}
        .product-image{height:270px;background:#f0f0f2;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .product-image img{width:100%;height:100%;object-fit:cover}
        .product-info{padding:18px}
        .product-category{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;opacity:.45}
        .product-info h3{margin:0 0 10px;font-size:17px}
        .price{font-size:20px;font-weight:800;margin:14px 0}
        .add-button,.modal-action,.checkout-button{width:100%;border:0;border-radius:13px;background:#111;color:#fff;padding:13px;font-weight:700}
        .add-button:disabled,.modal-action:disabled{opacity:.5}
        .trust-section{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;padding:50px 7%;background:#111;color:#fff}
        .trust-section>div{padding:25px;border-radius:20px;background:rgba(255,255,255,.05)}
        .trust-section span{font-size:28px}
        .trust-section p{opacity:.6}
        footer{padding:60px 7%;background:#090909;color:#fff;display:flex;justify-content:space-between;gap:30px;flex-wrap:wrap}
        .social-links{display:flex;gap:10px;margin-top:20px}
        .social-button{display:inline-block;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;padding:10px 13px;border-radius:999px;text-decoration:none}
        .whatsapp-floating{position:fixed;right:22px;bottom:22px;z-index:950;width:58px;height:58px;border:0;border-radius:50%;background:#111;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.2);font-size:22px}
        .modal-backdrop,.cart-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:18px}
        .account-modal{position:relative;width:min(620px,100%);max-height:92vh;overflow-y:auto;background:#fff;border-radius:28px;padding:30px;box-shadow:0 30px 100px rgba(0,0,0,.3)}
        .modal-close{position:absolute;right:18px;top:18px;width:36px;height:36px;border:0;border-radius:50%;background:#eee;font-size:24px}
        .auth-form{display:grid;gap:12px}
        .auth-form input,.auth-form select,.auth-form textarea{width:100%;padding:14px 15px;border:1px solid rgba(0,0,0,.12);border-radius:13px;background:#fafafa;outline:none}
        .auth-form input:focus,.auth-form select:focus,.auth-form textarea:focus{border-color:#111;background:#fff}
        .modal-secondary{width:100%;border:1px solid rgba(0,0,0,.1);background:#fff;color:#111;padding:13px;border-radius:13px;font-weight:700}
        .auth-message{padding:12px;border-radius:12px;background:rgba(124,58,237,.08);font-size:13px;line-height:1.5}
        .auth-divider{display:flex;align-items:center;gap:12px;margin:18px 0;font-size:12px;opacity:.5}
        .auth-divider:before,.auth-divider:after{content:"";height:1px;flex:1;background:currentColor}
        .social-auth-buttons{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .social-auth-button{border:1px solid rgba(0,0,0,.1);background:#fff;border-radius:13px;padding:13px;font-weight:700}
        .forgot-password{border:0;background:none;text-align:right;font-size:12px;opacity:.65}
        .cart-overlay{align-items:stretch;justify-content:flex-end;padding:0}
        .cart-drawer{width:min(470px,100%);height:100%;background:#fff;padding:25px;overflow-y:auto}
        .cart-header{display:flex;justify-content:space-between}
        .cart-item{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid rgba(0,0,0,.07)}
        .cart-item-image{width:80px;height:80px;flex-shrink:0;border-radius:14px;overflow:hidden;background:#f1f1f1;display:flex;align-items:center;justify-content:center}
        .cart-item-image img{width:100%;height:100%;object-fit:cover}
        .cart-item-info{flex:1;min-width:0}
        .cart-item-info h3{margin:0 0 5px;font-size:14px}
        .quantity-controls{display:flex;align-items:center;gap:10px;margin-top:10px}
        .quantity-controls button{width:30px;height:30px;border:1px solid #ddd;background:#fff;border-radius:8px}
        .remove-cart-item,.clear-cart-button{border:0;background:none;font-size:12px;opacity:.55}
        .cart-footer{padding-top:20px}
        .cart-total{display:flex;justify-content:space-between;font-size:20px;margin-bottom:15px}
        .location-loading{font-size:12px;opacity:.55}
        .field-label{font-size:12px;font-weight:700;opacity:.65;margin:3px 0 -5px}
        @media(max-width:768px){
          .header{padding:12px;gap:8px}
          .logo{font-size:17px}
          .nav{display:none}
          .header-actions{margin-left:auto;gap:5px}
          .account-button,.cart-button{padding:9px 10px;font-size:11px}
          .hero{min-height:550px;padding:65px 20px}
          .hero h1{font-size:clamp(42px,13vw,62px);letter-spacing:-3px}
          .hero-text{font-size:15px}
          .section{padding:55px 16px}
          .section h2{font-size:32px}
          .category-grid{grid-template-columns:repeat(2,1fr)}
          .product-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
          .product-image{height:170px}
          .product-info{padding:13px}
          .product-info h3{font-size:14px}
          .price{font-size:16px}
          .add-button{font-size:12px;padding:10px 7px}
          .trust-section{grid-template-columns:1fr;padding:35px 16px}
          footer{padding:40px 16px}
          .account-modal{width:calc(100% - 16px);padding:23px 17px;border-radius:22px}
          .social-auth-buttons{grid-template-columns:1fr}
          .cart-drawer{width:100%;border-radius:22px 22px 0 0}
          .cart-overlay{align-items:flex-end}
        }
        @media(max-width:380px){
          .product-grid{grid-template-columns:1fr}
          .product-image{height:220px}
        }
      `}</style>

      {/* ANNOUNCEMENT */}

      <div className="announcement-bar">
        <div className="announcement-track">
          {[1, 2].map((group) => (
            <div className="announcement-group" key={group}>
              <span>✨ Premium phone accessories, are screaming here!!! ✨</span>
              <span>📱 Premium phone accessories, are screaming here!!! 📱</span>
              <span>⚡ Premium phone accessories, are screaming here!!! ⚡</span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER */}

      <header className="header">
        <a href="#home" className="logo">
          Shindara
          <span>Phoneflair</span>
        </a>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <button className="account-button" onClick={openAccount}>
            👤 {user ? "Account" : "Sign in"}
          </button>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart ({cartCount})
          </button>
        </div>
      </header>

      {/* HERO */}

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">SHINDARA PHONEFLAIR</p>

            <h1>
              Technology,
              <br />
              beautifully selected.
            </h1>

            <p className="hero-text">
              Phones, accessories, chargers, audio products,
              power banks and everyday gadgets.
            </p>

            <a href="#shop" className="shop-button">
              Shop now →
            </a>
          </div>
        </section>

        {/* CATEGORIES */}

        <section className="section" id="categories">
          <p className="eyebrow">EXPLORE</p>
          <h2>Shop by category</h2>

          <div className="category-grid">
            {[
              ["📱", "Smartphones"],
              ["🛡️", "Phone Cases"],
              ["⚡", "Chargers"],
              ["🎧", "Audio"],
              ["🔋", "Power Banks"],
              ["✨", "Gadgets"],
            ].map(([icon, name]) => (
              <a href="#shop" className="category-card" key={name}>
                <span>{icon}</span>
                <strong>{name}</strong>
              </a>
            ))}
          </div>
        </section>

        {/* SHOP */}

        <section className="section" id="shop">
          <p className="eyebrow">SHINDARA STORE</p>
          <h2>Popular picks</h2>

          {productsLoading ? (
            <div style={{ padding: 50, textAlign: "center" }}>
              Loading products...
            </div>
          ) : productsError ? (
            <div style={{ padding: 50, textAlign: "center" }}>
              <p>{productsError}</p>
              <button className="add-button" onClick={loadProducts}>
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: 50, textAlign: "center" }}>
              Products are coming soon.
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <span style={{ fontSize: 45 }}>📦</span>
                    )}
                  </div>

                  <div className="product-info">
                    <p className="product-category">
                      {product.category || "Electronics"}
                    </p>

                    <h3>{product.name}</h3>

                    {product.description && (
                      <p style={{ opacity: 0.65, fontSize: 13 }}>
                        {product.description}
                      </p>
                    )}

                    <p className="price">{money(product.price)}</p>

                    {Number(product.stock || 0) > 0 ? (
                      <button
                        className="add-button"
                        onClick={() => addToCart(product)}
                      >
                        Add to cart
                      </button>
                    ) : (
                      <button className="add-button" disabled>
                        Out of stock
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="trust-section">
          <div>
            <span>🚚</span>
            <h3>Reliable delivery</h3>
            <p>Get your order delivered safely.</p>
          </div>

          <div>
            <span>🔒</span>
            <h3>Secure shopping</h3>
            <p>Shop with confidence.</p>
          </div>

          <div>
            <span>💬</span>
            <h3>Customer support</h3>
            <p>We're here whenever you need us.</p>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer id="contact">
        <div>
          <strong>Shindara Phoneflair</strong>
          <p>Phones • Accessories • Gadgets • Electronics</p>

          <div className="social-links">
            <button className="social-button" onClick={whatsapp}>
              📲 WhatsApp
            </button>

            <a
              className="social-button"
              href={TIKTOK}
              target="_blank"
              rel="noreferrer"
            >
              🎵 TikTok
            </a>
          </div>
        </div>

        <p>© 2026 Shindara Phoneflair</p>
      </footer>

      {/* WHATSAPP */}

      <button className="whatsapp-floating" onClick={whatsapp}>
        💬
      </button>

      {/* CART */}

      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <p className="eyebrow">SHINDARA</p>
                <h2>Your Cart</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </div>

            {!cart.length ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div style={{ fontSize: 55 }}>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add something you love from our store.</p>

                <button
                  className="modal-action"
                  onClick={() => setCartOpen(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} />
                      ) : (
                        "📦"
                      )}
                    </div>

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>{money(item.price)}</p>

                      <div className="quantity-controls">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="remove-cart-item"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <strong>{money(cartTotal)}</strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={openCheckout}
                  >
                    Continue to checkout →
                  </button>

                  <button
                    className="clear-cart-button"
                    onClick={clearCart}
                  >
                    Clear cart
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* CHECKOUT */}

      {checkoutOpen && (
        <div
          className="modal-backdrop"
          onClick={() => !orderLoading && setCheckoutOpen(false)}
        >
          <div
            className="account-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() =>
                !orderLoading && setCheckoutOpen(false)
              }
            >
              ×
            </button>

            {orderSuccess ? (
              <div style={{ textAlign: "center", padding: 25 }}>
                <div style={{ fontSize: 60 }}>✅</div>
                <p className="eyebrow">ORDER RECEIVED</p>
                <h2>Thank you!</h2>
                <p className="auth-message">{orderMessage}</p>

                <button
                  className="modal-action"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">SHINDARA CHECKOUT</p>
                <h2>Delivery details</h2>

                <form className="auth-form" onSubmit={placeOrder}>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value)
                    }
                    required
                  />

                  <textarea
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={(e) =>
                      setDeliveryAddress(e.target.value)
                    }
                    rows="3"
                    required
                  />

                  <label className="field-label">
                    State
                  </label>

                  {locationsLoading ? (
                    <div className="location-loading">
                      Loading Nigerian states...
                    </div>
                  ) : (
                    <select
                      value={deliveryState}
                      onChange={(e) =>
                        handleStateChange(e.target.value)
                      }
                      required
                    >
                      <option value="">Select state</option>

                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  )}

                  <label className="field-label">
                    City / LGA
                  </label>

                  <select
                    value={deliveryCity}
                    onChange={(e) =>
                      setDeliveryCity(e.target.value)
                    }
                    disabled={!deliveryState || locationsLoading}
                    required
                  >
                    <option value="">
                      {!deliveryState
                        ? "Select state first"
                        : "Select city / LGA"}
                    </option>

                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>

                  {locationsError && (
                    <p className="auth-message">
                      {locationsError}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "15px 0",
                    }}
                  >
                    <strong>Order total</strong>
                    <strong>{money(cartTotal)}</strong>
                  </div>

                  {orderMessage && (
                    <p className="auth-message">
                      {orderMessage}
                    </p>
                  )}

                  <button
                    className="modal-action"
                    type="submit"
                    disabled={orderLoading}
                  >
                    {orderLoading
                      ? "Opening Paystack..."
                      : `Pay ${money(cartTotal)}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ACCOUNT */}

      {accountOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setAccountOpen(false)}
        >
          <div
            className="account-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setAccountOpen(false)}
            >
              ×
            </button>

            {user ? (
              <>
                <p className="eyebrow">SHINDARA ACCOUNT</p>

                <h2>
                  {profile?.name
                    ? `Hello, ${profile.name.split(" ")[0]} 👋`
                    : "My Account"}
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 8,
                    margin: "25px 0",
                  }}
                >
                  {[
                    ["profile", "👤 Profile"],
                    ["orders", "📦 Orders"],
                    ["settings", "⚙️ Settings"],
                  ].map(([tab, label]) => (
                    <button
                      key={tab}
                      className={
                        accountTab === tab
                          ? "modal-action"
                          : "modal-secondary"
                      }
                      onClick={() => {
                        setAccountTab(tab);

                        if (tab === "orders") {
                          loadOrders();
                        }

                        if (tab === "settings") {
                          setSettingsMessage("");
                          setPasswordMessage("");
                        }
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* PROFILE */}

                {accountTab === "profile" && (
                  <div>
                    <div
                      style={{
                        padding: 20,
                        borderRadius: 18,
                        background: "rgba(128,128,128,.08)",
                        marginBottom: 15,
                      }}
                    >
                      <p className="eyebrow">
                        PERSONAL INFORMATION
                      </p>

                      <h3>{profile?.name || "Customer"}</h3>

                      <p>📧 {user.email}</p>

                      <p>
                        📱{" "}
                        {profile?.phone ||
                          "Phone number not added"}
                      </p>
                    </div>

                    <button
                      className="modal-action"
                      onClick={() => setAccountTab("settings")}
                    >
                      Edit profile
                    </button>
                  </div>
                )}

                {/* ORDERS */}

                {accountTab === "orders" && (
                  <div>
                    <p className="eyebrow">ORDER HISTORY</p>
                    <h3>My Orders</h3>

                    {ordersLoading ? (
                      <div style={{ padding: 35, textAlign: "center" }}>
                        Loading your orders...
                      </div>
                    ) : ordersError ? (
                      <>
                        <p>{ordersError}</p>
                        <button
                          className="modal-action"
                          onClick={loadOrders}
                        >
                          Try again
                        </button>
                      </>
                    ) : !orders.length ? (
                      <div style={{ textAlign: "center", padding: 35 }}>
                        <div style={{ fontSize: 50 }}>📦</div>
                        <h3>No orders yet</h3>
                        <p>Your completed orders will appear here.</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order.id}
                          style={{
                            padding: 18,
                            border: "1px solid rgba(128,128,128,.2)",
                            borderRadius: 18,
                            marginBottom: 12,
                          }}
                        >
                          <strong>
                            Order #
                            {String(order.id)
                              .slice(0, 8)
                              .toUpperCase()}
                          </strong>

                          <p style={{ opacity: 0.6, fontSize: 13 }}>
                            {formatDate(order.created_at)}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <strong>{money(order.total)}</strong>

                            <button
                              className="modal-secondary"
                              style={{ width: "auto" }}
                              onClick={() =>
                                setExpandedOrder(
                                  expandedOrder === order.id
                                    ? null
                                    : order.id
                                )
                              }
                            >
                              {expandedOrder === order.id
                                ? "Hide items"
                                : "View items"}
                            </button>
                          </div>

                          <p>
                            Status:{" "}
                            <strong>
                              {statusLabel(order.status)}
                            </strong>
                          </p>

                          {expandedOrder === order.id && (
                            <div
                              style={{
                                marginTop: 15,
                                paddingTop: 15,
                                borderTop:
                                  "1px solid rgba(128,128,128,.15)",
                              }}
                            >
                              {order.order_items?.map((item) => (
                                <div
                                  key={item.id}
                                  style={{
                                    display: "flex",
                                    justifyContent:
                                      "space-between",
                                    padding: "8px 0",
                                  }}
                                >
                                  <div>
                                    <strong>
                                      {item.product_name}
                                    </strong>
                                    <div
                                      style={{
                                        opacity: 0.6,
                                        fontSize: 13,
                                      }}
                                    >
                                      Qty: {item.quantity}
                                    </div>
                                  </div>

                                  <strong>
                                    {money(
                                      Number(item.price) *
                                        Number(item.quantity)
                                    )}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SETTINGS */}

                {accountTab === "settings" && (
                  <div>
                    <p className="eyebrow">ACCOUNT SETTINGS</p>
                    <h3>Personal details</h3>

                    <form
                      className="auth-form"
                      onSubmit={saveProfileSettings}
                    >
                      <input
                        type="text"
                        placeholder="Full name"
                        value={profileName}
                        onChange={(e) =>
                          setProfileName(e.target.value)
                        }
                        required
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={profilePhone}
                        onChange={(e) =>
                          setProfilePhone(e.target.value)
                        }
                        required
                      />

                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                      />

                      <button
                        className="modal-action"
                        type="submit"
                        disabled={settingsLoading}
                      >
                        {settingsLoading
                          ? "Saving..."
                          : "Save changes"}
                      </button>
                    </form>

                    {settingsMessage && (
                      <p className="auth-message">
                        {settingsMessage}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: 30,
                        paddingTop: 25,
                        borderTop:
                          "1px solid rgba(128,128,128,.15)",
                      }}
                    >
                      <p className="eyebrow">SECURITY</p>
                      <h3>Change password</h3>

                      <form
                        className="auth-form"
                        onSubmit={changePassword}
                      >
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(e.target.value)
                          }
                          minLength={6}
                          required
                        />

                        <button
                          className="modal-action"
                          type="submit"
                          disabled={passwordLoading}
                        >
                          {passwordLoading
                            ? "Changing..."
                            : "Change password"}
                        </button>
                      </form>

                      {passwordMessage && (
                        <p className="auth-message">
                          {passwordMessage}
                        </p>
                      )}
                    </div>

                    <button
                      className="modal-secondary"
                      style={{ marginTop: 25 }}
                      onClick={logout}
                    >
                      🚪 Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="eyebrow">SHINDARA ACCOUNT</p>

                <h2>
                  {authMode === "signup"
                    ? "Create your account"
                    : "Welcome back"}
                </h2>

                <form className="auth-form" onSubmit={handleAuth}>
                  {authMode === "signup" && (
                    <>
                      <input
                        type="text"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
                        required
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        required
                      />
                    </>
                  )}

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    minLength={6}
                    required
                  />

                  {authMode === "login" && (
                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() => {
                        setForgotPassword(true);
                        setResetEmail(email);
                        setResetMessage("");
                      }}
                    >
                      Forgot password?
                    </button>
                  )}

                  <button
                    className="modal-action"
                    type="submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? "Please wait..."
                      : authMode === "signup"
                      ? "Create account"
                      : "Sign in"}
                  </button>
                </form>

                {authMessage && (
                  <p className="auth-message">{authMessage}</p>
                )}

                {authMode === "login" && (
                  <>
                    <div className="auth-divider">
                      <span>or continue with</span>
                    </div>

                    <div className="social-auth-buttons">
                      <button
                        className="social-auth-button"
                        onClick={() =>
                          signInWithProvider("google")
                        }
                      >
                        Google
                      </button>

                      <button
                        className="social-auth-button"
                        onClick={() =>
                          signInWithProvider("apple")
                        }
                      >
                        Apple
                      </button>
                    </div>
                  </>
                )}

                <button
                  className="modal-secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setAuthMessage("");
                    setAuthMode(
                      authMode === "login" ? "signup" : "login"
                    );
                  }}
                >
                  {authMode === "login"
                    ? "Create a new account"
                    : "Already have an account? Sign in"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD */}

      {forgotPassword && (
        <div
          className="modal-backdrop"
          onClick={() => setForgotPassword(false)}
        >
          <div
            className="account-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setForgotPassword(false)}
            >
              ×
            </button>

            <p className="eyebrow">SHINDARA ACCOUNT</p>
            <h2>Reset your password</h2>

            <p style={{ opacity: 0.65 }}>
              Enter your email and we'll send you a password reset link.
            </p>

            <form
              className="auth-form"
              onSubmit={handleForgotPassword}
            >
              <input
                type="email"
                placeholder="Email address"
                value={resetEmail}
                onChange={(e) =>
                  setResetEmail(e.target.value)
                }
                required
              />

              <button
                className="modal-action"
                type="submit"
                disabled={resetLoading}
              >
                {resetLoading
                  ? "Sending..."
                  : "Send reset link"}
              </button>
            </form>

            {resetMessage && (
              <p className="auth-message">{resetMessage}</p>
            )}

            <button
              className="modal-secondary"
              onClick={() => setForgotPassword(false)}
            >
              Back to sign in
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
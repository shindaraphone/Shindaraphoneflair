import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP = "2348118294548";

const TIKTOK =
  "https://www.tiktok.com/@shindara.communication";

const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop);
        } else {
          reject(new Error("Paystack could not be loaded."));
        }
      });

      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;

    script.onload = () => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
      } else {
        reject(new Error("Paystack could not be loaded."));
      }
    };

    script.onerror = () => {
      reject(new Error("Unable to load Paystack."));
    };

    document.body.appendChild(script);
  });
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.7-3.7 3-5.5 7-5.5s6.3 1.8 7 5.5" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="18" cy="18" r="1.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z" />
        <path d="m8.5 12 2.3 2.3 4.7-5" />
      </>
    ),
    message: (
      <>
        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-4-.9L4 20l1.3-3.5A7.4 7.4 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7z" />
      </>
    ),
    package: (
      <>
        <path d="m4 7 8-4 8 4-8 4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
        <path d="m8 5 8 4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.5 1.5-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.1v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.5-1.5.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H7v-2.1h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.5-1.5.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4H15v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.5 1.5-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V12h-.2a1.7 1.7 0 0 0-1.3 1z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M8 12h10" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    phone: (
      <>
        <path d="M7 3h3l1 5-2 1.5a16 16 0 0 0 5.5 5.5L16 13l5 1v3a3 3 0 0 1-3 3C10.8 20 4 13.2 4 6a3 3 0 0 1 3-3z" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: (
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z" />
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
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
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");

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

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("shindara-theme") || "system";
  });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      const currentUser = data?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser.id);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id);
        } else {
          setProfile(null);
          setOrders([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("shindara-theme", theme);

    const root = document.documentElement;

    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

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
        () => {
          loadProducts();
        }
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
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setProductsError(
        "We couldn't load our products right now."
      );
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile loading error:", error);
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
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Orders loading error:", error);

      setOrdersError(
        "We couldn't load your orders right now."
      );

      setOrders([]);
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

  async function handleAuth(event) {
    event.preventDefault();

    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "signup") {
        const cleanEmail = email.trim();
        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();

        if (!cleanName) {
          setAuthMessage("Please enter your full name.");
          return;
        }

        if (!cleanPhone) {
          setAuthMessage("Please enter your phone number.");
          return;
        }

        if (!cleanEmail) {
          setAuthMessage("Please enter your email address.");
          return;
        }

        if (password.length < 6) {
          setAuthMessage(
            "Password must be at least 6 characters."
          );
          return;
        }

        const { data, error } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
                phone: cleanPhone,
              },
            },
          });

        if (error) {
          setAuthMessage(error.message);
          return;
        }

        if (data?.user) {
          const { error: profileError } =
            await supabase
              .from("profiles")
              .upsert({
                id: data.user.id,
                name: cleanName,
                phone: cleanPhone,
                email: cleanEmail,
              });

          if (profileError) {
            console.error(
              "Profile save error:",
              profileError
            );
          }
        }

        if (data?.user && !data.session) {
          setAuthMessage(
            "Account created successfully. Please check your email to confirm your account."
          );
        } else {
          setAuthMessage(
            "Account created successfully."
          );
        }

        setPassword("");

        if (data?.session) {
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

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      if (data?.user) {
        await loadProfile(data.user.id);
      }

      setEmail("");
      setPassword("");
      setAuthMessage("");
      setAccountOpen(false);
    } catch (error) {
      console.error("Authentication error:", error);

      setAuthMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function signInWithProvider(provider) {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin,
          },
        });

      if (error) throw error;
    } catch (error) {
      console.error(error);

      setAuthMessage(
        error?.message ||
          `Unable to continue with ${provider}.`
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
        setResetMessage(
          "Please enter your email address."
        );
        return;
      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: window.location.origin,
          }
        );

      if (error) throw error;

      setResetMessage(
        "Password reset link sent. Please check your email."
      );
    } catch (error) {
      console.error(error);

      setResetMessage(
        error?.message ||
          "Unable to send password reset email."
      );
    } finally {
      setResetLoading(false);
    }
  }

  async function saveProfileSettings(event) {
    event.preventDefault();

    if (!user) return;

    setSettingsLoading(true);
    setSettingsMessage("");

    try {
      const cleanName = profileName.trim();
      const cleanPhone = profilePhone.trim();

      if (!cleanName) {
        setSettingsMessage(
          "Please enter your name."
        );
        return;
      }

      if (!cleanPhone) {
        setSettingsMessage(
          "Please enter your phone number."
        );
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

      setSettingsMessage(
        "Your account details have been updated successfully."
      );
    } catch (error) {
      console.error("Settings error:", error);

      setSettingsMessage(
        error?.message ||
          "Unable to update your details."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

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

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) throw error;

      setNewPassword("");

      setPasswordMessage(
        "Your password has been changed successfully."
      );
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordMessage(
        error?.message ||
          "Unable to change your password."
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

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...items,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(id) {
    setCart((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((items) =>
      items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  function removeFromCart(id) {
    setCart((items) =>
      items.filter(
        (item) => item.id !== id
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      return [
        product.name,
        product.category,
        product.description,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(term)
        );
    });
  }, [products, search]);

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
    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address:
            deliveryAddress.trim(),
          delivery_city:
            deliveryCity.trim(),
          delivery_state:
            deliveryState.trim(),
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

    const { error: itemsError } =
      await supabase
        .from("order_items")
        .insert(items);

    if (itemsError) {
      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      throw itemsError;
    }

    return order;
  }

  async function placeOrder(event) {
    event.preventDefault();

    if (!user) {
      setOrderMessage(
        "Please sign in before placing your order."
      );
      return;
    }

    if (!cart.length) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !deliveryAddress.trim() ||
      !deliveryCity.trim() ||
      !deliveryState.trim()
    ) {
      setOrderMessage(
        "Please complete all delivery details."
      );
      return;
    }

    setOrderLoading(true);
    setOrderMessage("");

    try {
      const PaystackPop =
        await loadPaystackScript();

      const amountInKobo =
        Math.round(cartTotal * 100);

      const popup = new PaystackPop();

      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: amountInKobo,
        currency: "NGN",

        metadata: {
          customer_name:
            customerName.trim(),

          customer_phone:
            customerPhone.trim(),

          delivery_address:
            deliveryAddress.trim(),

          delivery_city:
            deliveryCity.trim(),

          delivery_state:
            deliveryState.trim(),

          user_id: user.id,
        },

        onSuccess: async (transaction) => {
          try {
            setOrderMessage(
              "Payment successful. Verifying your payment..."
            );

            const reference =
              transaction.reference;

            if (!reference) {
              throw new Error(
                "Paystack did not return a payment reference."
              );
            }

            const {
              data: verificationData,
              error: verificationError,
            } =
              await supabase.functions.invoke(
                "verify-paystack-payment",
                {
                  body: {
                    reference,
                  },
                }
              );

            if (verificationError) {
              throw new Error(
                verificationError.message ||
                  "Failed to verify Paystack payment."
              );
            }

            if (!verificationData?.success) {
              throw new Error(
                verificationData?.error ||
                  "Payment could not be verified."
              );
            }

            const order =
              await saveOrder(reference);

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
            setDeliveryCity("");
            setDeliveryState("");
          } catch (error) {
            console.error(
              "Payment/order error:",
              error
            );

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

        onError: (error) => {
          console.error(
            "Paystack transaction error:",
            error
          );

          setOrderLoading(false);

          setOrderMessage(
            error?.message ||
              "Paystack encountered an error. Please try again."
          );
        },
      });
    } catch (error) {
      console.error(
        "Paystack error:",
        error
      );

      setOrderMessage(
        error?.message ||
          "Unable to open Paystack. Please try again."
      );

      setOrderLoading(false);
    }
  }

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

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function statusLabel(status) {
    if (!status) return "Pending";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  function cycleTheme() {
    setTheme((current) => {
      if (current === "system") return "light";
      if (current === "light") return "dark";
      return "system";
    });
  }

  function themeLabel() {
    if (theme === "system") return "System";
    if (theme === "light") return "Light";
    return "Dark";
  }

  return (
    <div className="app">

      <style>{`

        :root {
          --bg: #f5f5f7;
          --surface: rgba(255,255,255,.78);
          --surface-solid: #ffffff;
          --surface-soft: rgba(118,118,128,.08);
          --text: #111111;
          --muted: #6e6e73;
          --border: rgba(0,0,0,.09);
          --shadow: 0 25px 80px rgba(0,0,0,.08);
          --black: #111111;
          --accent: #6d28d9;
          --accent-soft: rgba(109,40,217,.1);
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --bg: #09090b;
            --surface: rgba(28,28,30,.82);
            --surface-solid: #1c1c1e;
            --surface-soft: rgba(255,255,255,.07);
            --text: #f5f5f7;
            --muted: #a1a1a6;
            --border: rgba(255,255,255,.1);
            --shadow: 0 25px 80px rgba(0,0,0,.35);
            --black: #f5f5f7;
            --accent: #a78bfa;
            --accent-soft: rgba(167,139,250,.13);
          }
        }

        :root[data-theme="dark"] {
          --bg: #09090b;
          --surface: rgba(28,28,30,.82);
          --surface-solid: #1c1c1e;
          --surface-soft: rgba(255,255,255,.07);
          --text: #f5f5f7;
          --muted: #a1a1a6;
          --border: rgba(255,255,255,.1);
          --shadow: 0 25px 80px rgba(0,0,0,.35);
          --black: #f5f5f7;
          --accent: #a78bfa;
          --accent-soft: rgba(167,139,250,.13);
        }

        :root[data-theme="light"] {
          --bg: #f5f5f7;
          --surface: rgba(255,255,255,.78);
          --surface-solid: #ffffff;
          --surface-soft: rgba(118,118,128,.08);
          --text: #111111;
          --muted: #6e6e73;
          --border: rgba(0,0,0,.09);
          --shadow: 0 25px 80px rgba(0,0,0,.08);
          --black: #111111;
          --accent: #6d28d9;
          --accent-soft: rgba(109,40,217,.1);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          background: var(--bg);
        }

        body {
          margin: 0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "SF Pro Display",
            "SF Pro Text",
            "Segoe UI",
            sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          transition:
            background .35s ease,
            color .35s ease;
        }

        button,
        input {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        button {
          color: inherit;
        }

        .app {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 10% 8%,
              var(--accent-soft),
              transparent 25%
            ),
            radial-gradient(
              circle at 90% 20%,
              rgba(59,130,246,.07),
              transparent 25%
            ),
            var(--bg);
          transition: background .35s ease;
        }

        .announcement-bar {
          width: 100%;
          overflow: hidden;
          background: var(--text);
          color: var(--bg);
          padding: 9px 0;
          white-space: nowrap;
          position: relative;
          z-index: 1000;
        }

        .announcement-track {
          display: flex;
          width: max-content;
          animation: marquee 26s linear infinite;
        }

        .announcement-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .announcement-group span {
          display: inline-block;
          margin-right: 75px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .6px;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 900;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 15px 5%;
          background: var(--surface);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
        }

        .logo {
          text-decoration: none;
          color: var(--text);
          font-weight: 850;
          font-size: 20px;
          letter-spacing: -1.2px;
          line-height: .95;
          white-space: nowrap;
        }

        .logo span {
          display: block;
          margin-top: 4px;
          font-size: 9px;
          font-weight: 650;
          letter-spacing: 2.2px;
          text-transform: uppercase;
          opacity: .48;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 27px;
        }

        .nav a {
          color: var(--text);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          opacity: .68;
          transition: opacity .2s ease;
        }

        .nav a:hover {
          opacity: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .icon-button,
        .account-button,
        .cart-button {
          border: 1px solid var(--border);
          background: var(--surface-solid);
          color: var(--text);
          border-radius: 999px;
          min-height: 40px;
          padding: 9px 13px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition:
            transform .18s ease,
            background .18s ease,
            border-color .18s ease;
        }

        .icon-button {
          width: 40px;
          padding: 0;
        }

        .account-button:hover,
        .cart-button:hover,
        .icon-button:hover,
        .add-button:hover,
        .shop-button:hover,
        .checkout-button:hover {
          transform: translateY(-1px);
        }

        .cart-button,
        .shop-button,
        .add-button,
        .checkout-button,
        .modal-action {
          background: var(--text);
          color: var(--bg);
        }

        .cart-count {
          min-width: 19px;
          height: 19px;
          padding: 0 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(255,255,255,.16);
          font-size: 10px;
        }

        .hero {
          min-height: 680px;
          display: flex;
          align-items: center;
          padding: 100px 7%;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          right: 4%;
          top: 15%;
          background:
            radial-gradient(
              circle,
              var(--accent-soft),
              transparent 67%
            );
          filter: blur(4px);
          pointer-events: none;
        }

        .hero-content {
          max-width: 780px;
          position: relative;
          z-index: 2;
          animation: heroIn .8s ease both;
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .eyebrow {
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 2.2px;
          opacity: .48;
          margin: 0 0 15px;
          text-transform: uppercase;
        }

        .hero h1 {
          font-size: clamp(52px, 8vw, 96px);
          line-height: .91;
          letter-spacing: -6px;
          margin: 0 0 30px;
          max-width: 850px;
        }

        .hero-text {
          max-width: 555px;
          font-size: 18px;
          line-height: 1.7;
          color: var(--muted);
          margin-bottom: 34px;
        }

        .shop-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--bg);
          text-decoration: none;
          padding: 15px 21px;
          border-radius: 999px;
          font-weight: 750;
          font-size: 13px;
          transition: transform .2s ease;
        }

        .section {
          padding: 95px 7%;
        }

        .section h2 {
          margin: 0 0 35px;
          font-size: clamp(34px, 5vw, 52px);
          letter-spacing: -3px;
          line-height: 1;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          margin-bottom: 35px;
        }

        .section-heading h2 {
          margin-bottom: 0;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface-solid);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 7px 12px;
          width: min(300px, 100%);
        }

        .search-wrapper input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text);
          font-size: 13px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .category-card {
          min-height: 155px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          text-decoration: none;
          color: var(--text);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 22px;
          transition:
            transform .25s ease,
            background .25s ease;
          backdrop-filter: blur(15px);
        }

        .category-card:hover {
          transform: translateY(-5px);
          background: var(--surface-solid);
        }

        .category-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: var(--surface-soft);
          font-size: 21px;
        }

        .category-card strong {
          font-size: 13px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .product-card {
          background: var(--surface-solid);
          border: 1px solid var(--border);
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 12px 45px rgba(0,0,0,.035);
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow);
        }

        .product-image {
          height: 280px;
          background: var(--surface-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .45s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.035);
        }

        .product-info {
          padding: 18px;
        }

        .product-category {
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--muted);
          margin: 0 0 8px;
        }

        .product-info h3 {
          margin: 0 0 9px;
          font-size: 16px;
          letter-spacing: -.4px;
        }

        .product-description {
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
          margin: 0;
          min-height: 37px;
        }

        .price {
          font-size: 19px;
          font-weight: 850;
          margin: 16px 0 13px;
        }

        .add-button {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 13px;
          cursor: pointer;
          font-weight: 750;
          font-size: 12px;
          transition: transform .18s ease;
        }

        .add-button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .trust-section {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 15px;
          padding: 70px 7%;
          background: var(--text);
          color: var(--bg);
        }

        .trust-section > div {
          padding: 25px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 22px;
          background: rgba(255,255,255,.04);
        }

        .trust-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255,255,255,.08);
        }

        .trust-section h3 {
          margin: 17px 0 6px;
          font-size: 15px;
        }

        .trust-section p {
          opacity: .55;
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
        }

        footer {
          padding: 65px 7%;
          background: var(--text);
          color: var(--bg);
          display: flex;
          justify-content: space-between;
          gap: 30px;
          flex-wrap: wrap;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .footer-logo {
          font-size: 20px;
          letter-spacing: -.7px;
        }

        .footer-description {
          color: var(--bg);
          opacity: .55;
          font-size: 13px;
        }

        .social-links {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .social-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(255,255,255,.13);
          background: rgba(255,255,255,.06);
          color: var(--bg);
          padding: 10px 13px;
          border-radius: 999px;
          text-decoration: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .whatsapp-floating {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 950;
          width: 55px;
          height: 55px;
          border: 1px solid var(--border);
          border-radius: 50%;
          background: var(--text);
          color: var(--bg);
          box-shadow: var(--shadow);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform .2s ease;
        }

        .whatsapp-floating:hover {
          transform: translateY(-4px);
        }

        .modal-backdrop,
        .cart-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          animation: fadeIn .2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .account-modal {
          position: relative;
          width: min(620px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: var(--surface-solid);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 30px;
          box-shadow: 0 30px 100px rgba(0,0,0,.3);
          animation: modalIn .25s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(15px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-close {
          position: absolute;
          right: 17px;
          top: 17px;
          width: 36px;
          height: 36px;
          border: 1px solid var(--border);
          border-radius: 50%;
          background: var(--surface-soft);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .auth-form {
          display: grid;
          gap: 11px;
        }

        .auth-form input {
          width: 100%;
          padding: 14px 15px;
          border: 1px solid var(--border);
          border-radius: 13px;
          outline: none;
          background: var(--surface-soft);
          color: var(--text);
        }

        .auth-form input::placeholder {
          color: var(--muted);
        }

        .auth-form input:focus {
          border-color: var(--text);
          background: var(--surface-solid);
        }

        .modal-action,
        .modal-secondary {
          width: 100%;
          padding: 14px;
          border-radius: 13px;
          font-weight: 750;
          cursor: pointer;
          border: 1px solid var(--border);
          font-size: 13px;
        }

        .modal-action {
          border-color: transparent;
        }

        .modal-secondary {
          background: var(--surface-solid);
          color: var(--text);
        }

        .auth-message {
          padding: 12px;
          border-radius: 12px;
          background: var(--accent-soft);
          color: var(--text);
          font-size: 12px;
          line-height: 1.5;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0;
          font-size: 11px;
          color: var(--muted);
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: var(--border);
        }

        .social-auth-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .social-auth-button {
          border: 1px solid var(--border);
          background: var(--surface-solid);
          color: var(--text);
          border-radius: 13px;
          padding: 13px;
          cursor: pointer;
          font-weight: 700;
        }

        .forgot-password {
          border: 0;
          background: none;
          color: var(--muted);
          padding: 0;
          text-align: right;
          cursor: pointer;
          font-size: 11px;
        }

        .account-tabs {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 7px;
          margin: 25px 0;
        }

        .account-tab {
          min-height: 42px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface-solid);
          color: var(--text);
          cursor: pointer;
          font-size: 11px;
          font-weight: 750;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .account-tab.active {
          background: var(--text);
          color: var(--bg);
          border-color: transparent;
        }

        .profile-card {
          padding: 20px;
          border-radius: 19px;
          background: var(--surface-soft);
          margin-bottom: 15px;
          border: 1px solid var(--border);
        }

        .profile-line {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 10px 0;
          color: var(--muted);
          font-size: 13px;
        }

        .cart-overlay {
          align-items: stretch;
          justify-content: flex-end;
          padding: 0;
        }

        .cart-drawer {
          width: min(480px, 100%);
          height: 100%;
          background: var(--surface-solid);
          color: var(--text);
          padding: 25px;
          overflow-y: auto;
          box-shadow: -20px 0 60px rgba(0,0,0,.25);
          animation: drawerIn .25s ease;
        }

        @keyframes drawerIn {
          from {
            transform: translateX(30px);
            opacity: .5;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .cart-header h2 {
          margin: 0;
          font-size: 31px;
          letter-spacing: -1.5px;
        }

        .cart-item {
          display: flex;
          gap: 13px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
        }

        .cart-item-image {
          width: 76px;
          height: 76px;
          flex-shrink: 0;
          border-radius: 15px;
          overflow: hidden;
          background: var(--surface-soft);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .cart-item-info h3 {
          margin: 0 0 5px;
          font-size: 13px;
        }

        .cart-item-info p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .quantity-controls button {
          width: 29px;
          height: 29px;
          border: 1px solid var(--border);
          background: var(--surface-solid);
          color: var(--text);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-cart-item,
        .clear-cart-button {
          border: 0;
          background: none;
          color: var(--muted);
          cursor: pointer;
          font-size: 11px;
          margin-top: 8px;
        }

        .cart-footer {
          padding-top: 20px;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          font-size: 19px;
          margin-bottom: 15px;
        }

        .checkout-button {
          width: 100%;
          border: 0;
          padding: 15px;
          border-radius: 13px;
          font-weight: 750;
          cursor: pointer;
          transition: transform .18s ease;
        }

        .clear-cart-button {
          display: block;
          margin: 15px auto 0;
        }

        .order-card {
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 18px;
          margin-bottom: 12px;
          background: var(--surface-soft);
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .order-date {
          color: var(--muted);
          font-size: 12px;
          margin-top: 6px;
        }

        .status-pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--surface-solid);
          border: 1px solid var(--border);
          font-size: 10px;
          height: fit-content;
        }

        .order-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 13px;
        }

        .view-items {
          width: auto;
          padding: 9px 12px;
        }

        .order-items {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border);
        }

        .order-item-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 0;
          font-size: 12px;
        }

        .order-item-row small {
          display: block;
          color: var(--muted);
          margin-top: 3px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          background: var(--surface-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }

        .empty-state h3 {
          margin-bottom: 8px;
        }

        .empty-state p {
          color: var(--muted);
          font-size: 13px;
        }

        .loading-state,
        .error-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--muted);
        }

        .error-state .add-button {
          width: auto;
          padding: 11px 18px;
        }

        @media (max-width: 1050px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 11px 13px;
            gap: 7px;
          }

          .logo {
            font-size: 17px;
          }

          .nav {
            display: none;
          }

          .header-actions {
            margin-left: auto;
          }

          .account-button,
          .cart-button {
            min-height: 37px;
            padding: 8px 10px;
            font-size: 10px;
          }

          .account-button svg,
          .cart-button svg {
            width: 15px;
            height: 15px;
          }

          .icon-button {
            width: 37px;
            min-height: 37px;
          }

          .hero {
            min-height: 570px;
            padding: 75px 20px;
          }

          .hero h1 {
            font-size: clamp(45px, 13vw, 65px);
            letter-spacing: -4px;
          }

          .hero-text {
            font-size: 15px;
            line-height: 1.6;
          }

          .section {
            padding: 65px 16px;
          }

          .section h2 {
            font-size: 34px;
            letter-spacing: -2px;
          }

          .section-heading {
            display: block;
          }

          .search-wrapper {
            margin-top: 15px;
            width: 100%;
          }

          .category-grid {
            grid-template-columns: repeat(2,1fr);
            gap: 9px;
          }

          .category-card {
            min-height: 135px;
            padding: 16px;
            border-radius: 18px;
          }

          .product-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 10px;
          }

          .product-image {
            height: 175px;
          }

          .product-info {
            padding: 13px;
          }

          .product-info h3 {
            font-size: 13px;
          }

          .product-description {
            font-size: 11px;
          }

          .price {
            font-size: 16px;
            margin: 13px 0;
          }

          .add-button {
            font-size: 11px;
            padding: 11px 7px;
          }

          .trust-section {
            grid-template-columns: 1fr;
            padding: 45px 16px;
          }

          footer {
            padding: 45px 16px;
          }

          .account-modal {
            width: calc(100% - 8px);
            padding: 23px 17px;
            border-radius: 23px;
          }

          .social-auth-buttons {
            grid-template-columns: 1fr;
          }

          .cart-drawer {
            width: 100%;
            border-radius: 22px 22px 0 0;
          }

          .cart-overlay {
            align-items: flex-end;
          }

          .announcement-track {
            animation-duration: 18s;
          }

          .announcement-group span {
            font-size: 10px;
            margin-right: 42px;
          }

          .whatsapp-floating {
            width: 51px;
            height: 51px;
            right: 14px;
            bottom: 14px;
          }
        }

        @media (max-width: 390px) {
          .product-grid {
            grid-template-columns: 1fr;
          }

          .product-image {
            height: 220px;
          }

          .header-actions {
            gap: 3px;
          }

          .account-button {
            max-width: 74px;
          }

          .cart-button {
            max-width: 74px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }

      `}</style>

      {/* ANNOUNCEMENT */}

      <div className="announcement-bar">
        <div className="announcement-track">

          <div className="announcement-group">
            <span>
              SHINDARA PHONEFLAIR • PREMIUM TECH FOR EVERYDAY LIFE
            </span>

            <span>
              FREE TO BROWSE • SECURE PAYMENTS • QUALITY PRODUCTS
            </span>

            <span>
              PHONES • ACCESSORIES • GADGETS • ELECTRONICS
            </span>

            <span>
              SHINDARA PHONEFLAIR • PREMIUM TECH FOR EVERYDAY LIFE
            </span>
          </div>

          <div className="announcement-group">
            <span>
              SHINDARA PHONEFLAIR • PREMIUM TECH FOR EVERYDAY LIFE
            </span>

            <span>
              FREE TO BROWSE • SECURE PAYMENTS • QUALITY PRODUCTS
            </span>

            <span>
              PHONES • ACCESSORIES • GADGETS • ELECTRONICS
            </span>

            <span>
              SHINDARA PHONEFLAIR • PREMIUM TECH FOR EVERYDAY LIFE
            </span>
          </div>

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

          <button
            className="icon-button"
            title={`Theme: ${themeLabel()}`}
            onClick={cycleTheme}
          >
            {theme === "dark" ? (
              <Icon name="moon" size={17} />
            ) : (
              <Icon name="sun" size={17} />
            )}
          </button>

          <button
            className="icon-button"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search"
          >
            <Icon name="search" size={17} />
          </button>

          <button
            className="account-button"
            onClick={openAccount}
          >
            <Icon name="user" size={16} />
            <span>
              {user ? "Account" : "Sign in"}
            </span>
          </button>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
          >
            <Icon name="cart" size={16} />

            <span>Cart</span>

            <span className="cart-count">
              {cartCount}
            </span>
          </button>

        </div>

      </header>

      <main>

        {/* HERO */}

        <section className="hero" id="home">

          <div className="hero-content">

            <p className="eyebrow">
              SHINDARA PHONEFLAIR
            </p>

            <h1>
              Technology,
              <br />
              beautifully selected.
            </h1>

            <p className="hero-text">
              Phones, accessories, chargers,
              audio products, power banks and
              everyday gadgets — selected for
              the way you live.
            </p>

            <a href="#shop" className="shop-button">
              Shop now
              <Icon name="arrow" size={16} />
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
              ["✦", "Gadgets"],
            ].map(([icon, name]) => (

              <a
                href="#shop"
                className="category-card"
                key={name}
              >

                <div className="category-icon">
                  {icon}
                </div>

                <strong>{name}</strong>

              </a>

            ))}

          </div>

        </section>

        {/* SHOP */}

        <section className="section" id="shop">

          <div className="section-heading">

            <div>
              <p className="eyebrow">
                SHINDARA STORE
              </p>

              <h2>Popular picks</h2>
            </div>

            {searchOpen && (
              <div className="search-wrapper">

                <Icon name="search" size={16} />

                <input
                  autoFocus
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search products..."
                />

              </div>
            )}

          </div>

          {productsLoading ? (

            <div className="loading-state">
              Loading products...
            </div>

          ) : productsError ? (

            <div className="error-state">

              <p>{productsError}</p>

              <button
                className="add-button"
                onClick={loadProducts}
              >
                Try again
              </button>

            </div>

          ) : filteredProducts.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <Icon name="search" size={25} />
              </div>

              <h3>
                {search
                  ? "No products found"
                  : "Products are coming soon"}
              </h3>

              <p>
                {search
                  ? "Try searching for another product."
                  : "Check back soon for new products."}
              </p>

            </div>

          ) : (

            <div className="product-grid">

              {filteredProducts.map((product) => (

                <article
                  className="product-card"
                  key={product.id}
                >

                  <div className="product-image">

                    {product.image_url ? (

                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                      />

                    ) : (

                      <Icon
                        name="package"
                        size={45}
                      />

                    )}

                  </div>

                  <div className="product-info">

                    <p className="product-category">
                      {product.category ||
                        "Electronics"}
                    </p>

                    <h3>{product.name}</h3>

                    {product.description && (
                      <p className="product-description">
                        {product.description}
                      </p>
                    )}

                    <p className="price">
                      {money(product.price)}
                    </p>

                    {Number(product.stock || 0) > 0 ? (

                      <button
                        className="add-button"
                        onClick={() =>
                          addToCart(product)
                        }
                      >
                        Add to cart
                      </button>

                    ) : (

                      <button
                        className="add-button"
                        disabled
                      >
                        Out of stock
                      </button>

                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* TRUST */}

        <section className="trust-section">

          <div>

            <div className="trust-icon">
              <Icon name="truck" size={21} />
            </div>

            <h3>Reliable delivery</h3>

            <p>
              Your order is handled carefully
              from checkout to delivery.
            </p>

          </div>

          <div>

            <div className="trust-icon">
              <Icon name="shield" size={21} />
            </div>

            <h3>Secure shopping</h3>

            <p>
              Secure authentication and
              Paystack-powered payments.
            </p>

          </div>

          <div>

            <div className="trust-icon">
              <Icon name="message" size={21} />
            </div>

            <h3>Customer support</h3>

            <p>
              Need help? Reach Shindara
              Phoneflair directly.
            </p>

          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer id="contact">

        <div>

          <strong className="footer-logo">
            Shindara Phoneflair
          </strong>

          <p className="footer-description">
            Phones • Accessories • Gadgets • Electronics
          </p>

          <div className="social-links">

            <button
              className="social-button"
              onClick={whatsapp}
            >
              <Icon name="message" size={15} />
              WhatsApp
            </button>

            <a
              className="social-button"
              href={TIKTOK}
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>

          </div>

        </div>

        <p className="footer-description">
          © 2026 Shindara Phoneflair
        </p>

      </footer>

      {/* WHATSAPP */}

      <button
        className="whatsapp-floating"
        onClick={whatsapp}
        title="Chat on WhatsApp"
      >
        <Icon name="message" size={22} />
      </button>

      {/* CART */}

      {cartOpen && (

        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >

          <aside
            className="cart-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="cart-header">

              <div>
                <p className="eyebrow">
                  SHINDARA
                </p>

                <h2>Your Cart</h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                <Icon name="close" size={17} />
              </button>

            </div>

            {cart.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  <Icon name="cart" size={25} />
                </div>

                <h3>Your cart is empty</h3>

                <p>
                  Add something you love from
                  our store.
                </p>

                <button
                  className="modal-action"
                  onClick={() =>
                    setCartOpen(false)
                  }
                >
                  Continue shopping
                </button>

              </div>

            ) : (

              <>

                <div>

                  {cart.map((item) => (

                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      <div className="cart-item-image">

                        {item.image_url ? (

                          <img
                            src={item.image_url}
                            alt={item.name}
                          />

                        ) : (

                          <Icon
                            name="package"
                            size={28}
                          />

                        )}

                      </div>

                      <div className="cart-item-info">

                        <h3>{item.name}</h3>

                        <p>
                          {money(item.price)}
                        </p>

                        <div className="quantity-controls">

                          <button
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                          >
                            <Icon
                              name="minus"
                              size={14}
                            />
                          </button>

                          <strong>
                            {item.quantity}
                          </strong>

                          <button
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                          >
                            <Icon
                              name="plus"
                              size={14}
                            />
                          </button>

                        </div>

                        <button
                          className="remove-cart-item"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

                <div className="cart-footer">

                  <div className="cart-total">
                    <span>Total</span>

                    <strong>
                      {money(cartTotal)}
                    </strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={openCheckout}
                  >
                    Continue to checkout
                    <Icon
                      name="arrow"
                      size={16}
                    />
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
          onClick={() =>
            !orderLoading &&
            setCheckoutOpen(false)
          }
        >

          <div
            className="account-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                !orderLoading &&
                setCheckoutOpen(false)
              }
            >
              <Icon name="close" size={17} />
            </button>

            {orderSuccess ? (

              <div className="empty-state">

                <div className="empty-icon">
                  <Icon
                    name="check"
                    size={28}
                  />
                </div>

                <p className="eyebrow">
                  ORDER RECEIVED
                </p>

                <h2>Thank you!</h2>

                <p className="auth-message">
                  {orderMessage}
                </p>

                <button
                  className="modal-action"
                  onClick={() =>
                    setCheckoutOpen(false)
                  }
                >
                  Continue shopping
                </button>

              </div>

            ) : (

              <>

                <p className="eyebrow">
                  SHINDARA CHECKOUT
                </p>

                <h2>
                  Delivery details
                </h2>

                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  Tell us where to deliver
                  your order.
                </p>

                <form
                  className="auth-form"
                  onSubmit={placeOrder}
                >

                  <input
                    type="text"
                    placeholder="Full name"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={(event) =>
                      setDeliveryAddress(
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="City"
                    value={deliveryCity}
                    onChange={(event) =>
                      setDeliveryCity(
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="State"
                    value={deliveryState}
                    onChange={(event) =>
                      setDeliveryState(
                        event.target.value
                      )
                    }
                    required
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "15px 0",
                    }}
                  >
                    <strong>
                      Order total
                    </strong>

                    <strong>
                      {money(cartTotal)}
                    </strong>
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
                      ? "Processing..."
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
          onClick={() =>
            setAccountOpen(false)
          }
        >

          <div
            className="account-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setAccountOpen(false)
              }
            >
              <Icon name="close" size={17} />
            </button>

            {user ? (

              <>

                <p className="eyebrow">
                  SHINDARA ACCOUNT
                </p>

                <h2>
                  {profile?.name
                    ? `Hello, ${
                        profile.name.split(" ")[0]
                      }`
                    : "My Account"}
                </h2>

                <div className="account-tabs">

                  <button
                    className={`account-tab ${
                      accountTab === "profile"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setAccountTab("profile")
                    }
                  >
                    <Icon
                      name="user"
                      size={15}
                    />
                    Profile
                  </button>

                  <button
                    className={`account-tab ${
                      accountTab === "orders"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setAccountTab("orders");
                      loadOrders();
                    }}
                  >
                    <Icon
                      name="package"
                      size={15}
                    />
                    Orders
                  </button>

                  <button
                    className={`account-tab ${
                      accountTab === "settings"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setAccountTab("settings");
                      setSettingsMessage("");
                      setPasswordMessage("");
                    }}
                  >
                    <Icon
                      name="settings"
                      size={15}
                    />
                    Settings
                  </button>

                </div>

                {/* PROFILE */}

                {accountTab === "profile" && (

                  <div>

                    <div className="profile-card">

                      <p className="eyebrow">
                        PERSONAL INFORMATION
                      </p>

                      <h3>
                        {profile?.name ||
                          "Customer"}
                      </h3>

                      <div className="profile-line">
                        <Icon
                          name="mail"
                          size={15}
                        />
                        {user.email}
                      </div>

                      <div className="profile-line">
                        <Icon
                          name="phone"
                          size={15}
                        />
                        {profile?.phone ||
                          "Phone number not added"}
                      </div>

                    </div>

                    <button
                      className="modal-action"
                      onClick={() =>
                        setAccountTab("settings")
                      }
                    >
                      Edit profile
                    </button>

                    <button
                      className="modal-secondary"
                      style={{ marginTop: 9 }}
                      onClick={() => {
                        setAccountTab("orders");
                        loadOrders();
                      }}
                    >
                      View my orders
                    </button>

                  </div>

                )}

                {/* ORDERS */}

                {accountTab === "orders" && (

                  <div>

                    <p className="eyebrow">
                      ORDER HISTORY
                    </p>

                    <h3>My Orders</h3>

                    {ordersLoading ? (

                      <div className="loading-state">
                        Loading your orders...
                      </div>

                    ) : ordersError ? (

                      <div className="error-state">

                        <p>{ordersError}</p>

                        <button
                          className="modal-action"
                          onClick={loadOrders}
                        >
                          Try again
                        </button>

                      </div>

                    ) : orders.length === 0 ? (

                      <div className="empty-state">

                        <div className="empty-icon">
                          <Icon
                            name="package"
                            size={27}
                          />
                        </div>

                        <h3>No orders yet</h3>

                        <p>
                          Your completed orders
                          will appear here.
                        </p>

                        <button
                          className="modal-action"
                          onClick={() => {
                            setAccountOpen(false);
                            window.location.hash =
                              "shop";
                          }}
                        >
                          Start shopping
                        </button>

                      </div>

                    ) : (

                      <div>

                        {orders.map((order) => (

                          <div
                            className="order-card"
                            key={order.id}
                          >

                            <div className="order-top">

                              <div>

                                <strong>
                                  Order #
                                  {String(order.id)
                                    .slice(0, 8)
                                    .toUpperCase()}
                                </strong>

                                <div className="order-date">
                                  {formatDate(
                                    order.created_at
                                  )}
                                </div>

                              </div>

                              <span className="status-pill">
                                {statusLabel(
                                  order.status
                                )}
                              </span>

                            </div>

                            <div className="order-bottom">

                              <strong>
                                {money(order.total)}
                              </strong>

                              <button
                                className="modal-secondary view-items"
                                onClick={() =>
                                  setExpandedOrder(
                                    expandedOrder ===
                                      order.id
                                      ? null
                                      : order.id
                                  )
                                }
                              >
                                {expandedOrder ===
                                order.id
                                  ? "Hide items"
                                  : "View items"}
                              </button>

                            </div>

                            {expandedOrder ===
                              order.id && (

                              <div className="order-items">

                                {order.order_items?.map(
                                  (item) => (

                                    <div
                                      className="order-item-row"
                                      key={item.id}
                                    >

                                      <div>

                                        <strong>
                                          {
                                            item.product_name
                                          }
                                        </strong>

                                        <small>
                                          Qty:{" "}
                                          {
                                            item.quantity
                                          }
                                        </small>

                                      </div>

                                      <strong>
                                        {money(
                                          Number(
                                            item.price
                                          ) *
                                            Number(
                                              item.quantity
                                            )
                                        )}
                                      </strong>

                                    </div>

                                  )
                                )}

                              </div>

                            )}

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                )}

                {/* SETTINGS */}

                {accountTab === "settings" && (

                  <div>

                    <p className="eyebrow">
                      ACCOUNT SETTINGS
                    </p>

                    <h3>
                      Personal details
                    </h3>

                    <form
                      className="auth-form"
                      onSubmit={
                        saveProfileSettings
                      }
                    >

                      <input
                        type="text"
                        placeholder="Full name"
                        value={profileName}
                        onChange={(event) =>
                          setProfileName(
                            event.target.value
                          )
                        }
                        required
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={profilePhone}
                        onChange={(event) =>
                          setProfilePhone(
                            event.target.value
                          )
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
                          "1px solid var(--border)",
                      }}
                    >

                      <p className="eyebrow">
                        APPEARANCE
                      </p>

                      <h3>
                        Theme
                      </h3>

                      <button
                        className="modal-secondary"
                        onClick={cycleTheme}
                      >
                        {theme === "dark" ? (
                          <Icon
                            name="moon"
                            size={16}
                          />
                        ) : (
                          <Icon
                            name="sun"
                            size={16}
                          />
                        )}
                        {" "}
                        {themeLabel()} mode
                      </button>

                      <p
                        style={{
                          color: "var(--muted)",
                          fontSize: 11,
                          lineHeight: 1.5,
                        }}
                      >
                        System follows your
                        device appearance.
                      </p>

                    </div>

                    <div
                      style={{
                        marginTop: 30,
                        paddingTop: 25,
                        borderTop:
                          "1px solid var(--border)",
                      }}
                    >

                      <p className="eyebrow">
                        SECURITY
                      </p>

                      <h3>
                        Change password
                      </h3>

                      <form
                        className="auth-form"
                        onSubmit={changePassword}
                      >

                        <input
                          type="password"
                          placeholder="New password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(
                              event.target.value
                            )
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
                      <Icon
                        name="logout"
                        size={16}
                      />
                      {" "}
                      Log out
                    </button>

                  </div>

                )}

              </>

            ) : (

              /* LOGIN / SIGNUP */

              <>

                <p className="eyebrow">
                  SHINDARA ACCOUNT
                </p>

                <h2>
                  {authMode === "signup"
                    ? "Create your account"
                    : "Welcome back"}
                </h2>

                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {authMode === "signup"
                    ? "Create an account to make checkout and order tracking easier."
                    : "Sign in to access your account and orders."}
                </p>

                <form
                  className="auth-form"
                  onSubmit={handleAuth}
                >

                  {authMode === "signup" && (
                    <>

                      <input
                        type="text"
                        placeholder="Full name"
                        value={fullName}
                        onChange={(event) =>
                          setFullName(
                            event.target.value
                          )
                        }
                        required
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(event) =>
                          setPhone(
                            event.target.value
                          )
                        }
                        required
                      />

                    </>
                  )}

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
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
                  <p className="auth-message">
                    {authMessage}
                  </p>
                )}

                {authMode === "login" && (

                  <>
                    <div className="auth-divider">
                      <span>
                        or continue with
                      </span>
                    </div>

                    <div className="social-auth-buttons">

                      <button
                        type="button"
                        className="social-auth-button"
                        onClick={() =>
                          signInWithProvider(
                            "google"
                          )
                        }
                        disabled={authLoading}
                      >
                        Google
                      </button>

                      <button
                        type="button"
                        className="social-auth-button"
                        onClick={() =>
                          signInWithProvider(
                            "apple"
                          )
                        }
                        disabled={authLoading}
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
                      authMode === "login"
                        ? "signup"
                        : "login"
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
          onClick={() =>
            setForgotPassword(false)
          }
        >

          <div
            className="account-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setForgotPassword(false)
              }
            >
              <Icon name="close" size={17} />
            </button>

            <p className="eyebrow">
              SHINDARA ACCOUNT
            </p>

            <h2>
              Reset your password
            </h2>

            <p
              style={{
                color: "var(--muted)",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Enter your email and we'll send
              you a password reset link.
            </p>

            <form
              className="auth-form"
              onSubmit={handleForgotPassword}
            >

              <input
                type="email"
                placeholder="Email address"
                value={resetEmail}
                onChange={(event) =>
                  setResetEmail(
                    event.target.value
                  )
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
              <p className="auth-message">
                {resetMessage}
              </p>
            )}

            <button
              className="modal-secondary"
              onClick={() =>
                setForgotPassword(false)
              }
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
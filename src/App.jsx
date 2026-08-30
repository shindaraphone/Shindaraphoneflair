// App.js - Redesigned
import React, { useEffect, useMemo, useState, useCallback, useReducer } from "react";
import { supabase } from "./supabaseClient.js";
import "./shindara-redesign.css";

/* =========================================================
   CONFIGURATION
   ========================================================= */
const CONFIG = {
  PAYSTACK_KEY: "pk_live_d7a7a78de15d84169736f5786afb59709b639905",
  STORE_NAME: "SHINDARA",
  STORE_TAGLINE: "PHONEFLAIR",
  CURRENCY: "₦",
  CURRENCY_LOCALE: "en-NG",
};

const money = (value) => 
  `${CONFIG.CURRENCY}${Number(value || 0).toLocaleString(CONFIG.CURRENCY_LOCALE)}`;

const generateTrackingNumber = () =>
  `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

/* =========================================================
   LOCATION DATA
   ========================================================= */
const NIGERIA_LOCATIONS = {
  // ... (keep your existing location data)
};

/* =========================================================
   CATEGORIES
   ========================================================= */
const CATEGORIES = [
  "All",
  "Phones",
  "Phone Cases",
  "Chargers",
  "Cables",
  "Power Banks",
  "Audio",
  "Smart Watches",
  "Screen Protectors",
];

/* =========================================================
   REDUCER - Centralized State Management
   ========================================================= */
const initialState = {
  user: null,
  profile: null,
  products: [],
  cart: [],
  orders: [],
  
  ui: {
    loading: true,
    cartLoading: false,
    authLoading: false,
    placingOrder: false,
    savingProfile: false,
  },
  
  modals: {
    cart: false,
    account: false,
    checkout: false,
    orders: false,
    tracking: false,
    product: false,
    settings: false,
  },
  
  filters: {
    search: "",
    category: "All",
  },
  
  auth: {
    mode: "login",
    message: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
  },
  
  checkout: {
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    delivery_state: "",
    delivery_city: "",
  },
  
  selected: {
    product: null,
    order: null,
  },
  
  theme: localStorage.getItem("shindara-theme") || "device",
  notice: "",
};

function appReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_PROFILE":
      return { ...state, profile: action.payload };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_CART":
      return { ...state, cart: action.payload };
    case "SET_ORDERS":
      return { ...state, orders: action.payload };
    case "SET_LOADING":
      return { ...state, ui: { ...state.ui, loading: action.payload } };
    case "SET_CART_LOADING":
      return { ...state, ui: { ...state.ui, cartLoading: action.payload } };
    case "TOGGLE_MODAL":
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: !state.modals[action.payload] },
      };
    case "OPEN_MODAL":
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: true },
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: false },
      };
    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value },
      };
    case "SET_AUTH":
      return {
        ...state,
        auth: { ...state.auth, [action.payload.key]: action.payload.value },
      };
    case "SET_AUTH_MODE":
      return { ...state, auth: { ...state.auth, mode: action.payload } };
    case "SET_CHECKOUT":
      return {
        ...state,
        checkout: { ...state.checkout, [action.payload.key]: action.payload.value },
      };
    case "SET_SELECTED":
      return {
        ...state,
        selected: { ...state.selected, [action.payload.key]: action.payload.value },
      };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_NOTICE":
      return { ...state, notice: action.payload };
    case "SET_AUTH_LOADING":
      return { ...state, ui: { ...state.ui, authLoading: action.payload } };
    case "SET_PLACING_ORDER":
      return { ...state, ui: { ...state.ui, placingOrder: action.payload } };
    default:
      return state;
  }
}

/* =========================================================
   MAIN APP
   ========================================================= */
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Destructure state for cleaner access
  const {
    user,
    profile,
    products,
    cart,
    orders,
    ui,
    modals,
    filters,
    auth,
    checkout,
    selected,
    theme,
    notice,
  } = state;

  const { search, category } = filters;
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart]
  );

  /* =========================================================
     NOTIFICATIONS
     ========================================================= */
  const showNotice = useCallback((message) => {
    dispatch({ type: "SET_NOTICE", payload: message });
    clearTimeout(window.__noticeTimer);
    window.__noticeTimer = setTimeout(() => {
      dispatch({ type: "SET_NOTICE", payload: "" });
    }, 3500);
  }, []);

  /* =========================================================
     THEME MANAGEMENT
     ========================================================= */
  useEffect(() => {
    localStorage.setItem("shindara-theme", theme);
    const applyTheme = () => {
      const isDark =
        theme === "dark" ||
        (theme === "device" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
    };
    applyTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  /* =========================================================
     DATA LOADING HELPERS
     ========================================================= */
  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) dispatch({ type: "SET_PRODUCTS", payload: data || [] });
  }, []);

  const loadProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) {
      dispatch({ type: "SET_PROFILE", payload: data });
      dispatch({
        type: "SET_CHECKOUT",
        payload: { key: "customer_name", value: data.full_name || "" },
      });
      dispatch({
        type: "SET_CHECKOUT",
        payload: { key: "customer_phone", value: data.phone || "" },
      });
    }
  }, []);

  const loadCart = useCallback(async (userId) => {
    dispatch({ type: "SET_CART_LOADING", payload: true });
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id, user_id, product_id, quantity,
        products:product_id (id, name, price, image_url, description, category, stock)
      `)
      .eq("user_id", userId)
      .order("id");
    if (!error) {
      const formatted = (data || [])
        .filter(item => item.products)
        .map(item => ({
          ...item,
          product: item.products,
          subtotal: Number(item.products.price || 0) * Number(item.quantity || 0),
        }));
      dispatch({ type: "SET_CART", payload: formatted });
    }
    dispatch({ type: "SET_CART_LOADING", payload: false });
  }, []);

  const loadOrders = useCallback(async (userId) => {
    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) {
      const completeOrders = await Promise.all(
        (orderData || []).map(async (order) => {
          const { data: items } = await supabase
            .from("order_items")
            .select(`
              id, order_id, product_id, quantity, price,
              products:product_id (id, name, image_url, category, description)
            `)
            .eq("order_id", order.id);
          return {
            ...order,
            items: (items || []).map(item => ({
              ...item,
              product: item.products,
            })),
          };
        })
      );
      dispatch({ type: "SET_ORDERS", payload: completeOrders });
    }
  }, []);

  const loadCustomerData = useCallback(
    async (user) => {
      if (!user) return;
      await Promise.all([
        loadProfile(user.id),
        loadCart(user.id),
        loadOrders(user.id),
      ]);
    },
    [loadProfile, loadCart, loadOrders]
  );

  /* =========================================================
     INITIALIZATION
     ========================================================= */
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        if (mounted) {
          dispatch({ type: "SET_USER", payload: currentUser });
          await loadProducts();
          if (currentUser) await loadCustomerData(currentUser);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        if (mounted) dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const user = session?.user || null;
        dispatch({ type: "SET_USER", payload: user });
        if (user) {
          await loadCustomerData(user);
        } else {
          dispatch({ type: "SET_PROFILE", payload: null });
          dispatch({ type: "SET_CART", payload: [] });
          dispatch({ type: "SET_ORDERS", payload: [] });
        }
      }
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProducts, loadCustomerData]);

  /* =========================================================
     CART OPERATIONS
     ========================================================= */
  const addToCart = useCallback(
    async (product) => {
      if (!user) {
        dispatch({ type: "OPEN_MODAL", payload: "account" });
        dispatch({ type: "SET_AUTH_MODE", payload: "login" });
        showNotice("Please sign in to add items to your cart.");
        return;
      }
      if (Number(product.stock || 0) <= 0) {
        showNotice("This product is out of stock.");
        return;
      }

      const existing = cart.find(item => item.product_id === product.id);
      if (existing) {
        const nextQty = Number(existing.quantity) + 1;
        if (nextQty > Number(product.stock)) {
          showNotice("Cannot exceed available stock.");
          return;
        }
        await supabase
          .from("cart_items")
          .update({ quantity: nextQty })
          .eq("id", existing.id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });
      }
      await loadCart(user.id);
      showNotice(`${product.name} added to cart.`);
    },
    [user, cart, loadCart, showNotice]
  );

  const updateQuantity = useCallback(
    async (item, change) => {
      if (!user) return;
      const nextQty = Number(item.quantity) + change;
      if (nextQty <= 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("id", item.id)
          .eq("user_id", user.id);
        await loadCart(user.id);
        showNotice("Item removed from cart.");
        return;
      }
      if (item.product && Number(item.product.stock || 0) < nextQty) {
        showNotice("Cannot exceed available stock.");
        return;
      }
      await supabase
        .from("cart_items")
        .update({ quantity: nextQty })
        .eq("id", item.id)
        .eq("user_id", user.id);
      await loadCart(user.id);
    },
    [user, loadCart, showNotice]
  );

  const removeFromCart = useCallback(
    async (item) => {
      if (!user) return;
      await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.id)
        .eq("user_id", user.id);
      await loadCart(user.id);
      showNotice("Item removed from cart.");
    },
    [user, loadCart, showNotice]
  );

  const clearCart = useCallback(async () => {
    if (!user) return false;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    dispatch({ type: "SET_CART", payload: [] });
    return true;
  }, [user]);

  /* =========================================================
     AUTH OPERATIONS
     ========================================================= */
  const handleAuth = useCallback(
    async (e) => {
      e.preventDefault();
      dispatch({ type: "SET_AUTH_LOADING", payload: true });
      try {
        const { email, password, fullName, phone, mode } = auth;
        if (!email.trim() || !password) {
          dispatch({ type: "SET_AUTH", payload: { key: "message", value: "Please enter email and password." } });
          return;
        }
        if (password.length < 6) {
          dispatch({ type: "SET_AUTH", payload: { key: "message", value: "Password must be at least 6 characters." } });
          return;
        }

        if (mode === "signup") {
          if (!fullName.trim() || !phone.trim()) {
            dispatch({ type: "SET_AUTH", payload: { key: "message", value: "Please enter your full name and phone number." } });
            return;
          }
          const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: { data: { full_name: fullName.trim(), phone: phone.trim() } },
          });
          if (error) throw new Error(error.message);
          if (data?.user) {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: data.user.email || email.trim().toLowerCase(),
              full_name: fullName.trim(),
              phone: phone.trim(),
            });
          }
          if (data?.session) {
            dispatch({ type: "CLOSE_MODAL", payload: "account" });
            showNotice("Account created successfully.");
          } else {
            dispatch({ type: "SET_AUTH", payload: { key: "message", value: "Account created. Check your email for verification." } });
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (error) throw new Error(error.message);
          if (data?.user) {
            await loadCustomerData(data.user);
            dispatch({ type: "CLOSE_MODAL", payload: "account" });
            showNotice("Welcome back!");
          }
        }
      } catch (error) {
        dispatch({ type: "SET_AUTH", payload: { key: "message", value: error.message } });
      } finally {
        dispatch({ type: "SET_AUTH_LOADING", payload: false });
      }
    },
    [auth, loadCustomerData, showNotice]
  );

  const handleGoogleLogin = useCallback(async () => {
    dispatch({ type: "SET_AUTH_LOADING", payload: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw new Error(error.message);
    } catch (error) {
      dispatch({ type: "SET_AUTH", payload: { key: "message", value: error.message } });
    } finally {
      dispatch({ type: "SET_AUTH_LOADING", payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch({ type: "SET_USER", payload: null });
    dispatch({ type: "SET_PROFILE", payload: null });
    dispatch({ type: "SET_CART", payload: [] });
    dispatch({ type: "SET_ORDERS", payload: [] });
    Object.keys(modals).forEach(key => dispatch({ type: "CLOSE_MODAL", payload: key }));
    showNotice("Signed out.");
  }, [showNotice]);

  /* =========================================================
     CHECKOUT & PAYMENT
     ========================================================= */
  const loadPaystack = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => window.PaystackPop ? resolve(true) : reject(new Error("Paystack failed to load"));
      script.onerror = () => reject(new Error("Could not load Paystack"));
      document.head.appendChild(script);
    });
  }, []);

  const handlePayment = useCallback(
    async (e) => {
      e.preventDefault();
      if (ui.placingOrder) return;
      if (!user) {
        dispatch({ type: "SET_CHECKOUT", payload: { key: "message", value: "Please sign in again." } });
        return;
      }
      if (!cart.length) {
        dispatch({ type: "SET_CHECKOUT", payload: { key: "message", value: "Your cart is empty." } });
        return;
      }

      const requiredFields = [
        ["customer_name", "full name"],
        ["customer_phone", "phone number"],
        ["customer_email", "email"],
        ["delivery_address", "delivery address"],
        ["delivery_state", "state"],
        ["delivery_city", "city"],
      ];
      for (const [field, label] of requiredFields) {
        if (!String(checkout[field] || "").trim()) {
          dispatch({ type: "SET_CHECKOUT", payload: { key: "message", value: `Please enter your ${label}.` } });
          return;
        }
      }

      // Check stock
      for (const item of cart) {
        if (Number(item.product?.stock || 0) < Number(item.quantity || 0)) {
          dispatch({
            type: "SET_CHECKOUT",
            payload: { key: "message", value: `${item.product?.name || "Product"} is out of stock.` },
          });
          await loadCart(user.id);
          return;
        }
      }

      dispatch({ type: "SET_PLACING_ORDER", payload: true });
      try {
        await loadPaystack();
        if (!window.PaystackPop) throw new Error("Paystack unavailable.");

        const reference = `SHP-${user.id.slice(0,8)}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
        const handler = window.PaystackPop.setup({
          key: CONFIG.PAYSTACK_KEY,
          email: checkout.customer_email.trim(),
          amount: Math.round(Number(cartTotal) * 100),
          currency: "NGN",
          ref: reference,
          metadata: {
            custom_fields: [
              { display_name: "Customer Name", variable_name: "customer_name", value: checkout.customer_name.trim() },
              { display_name: "Customer Phone", variable_name: "customer_phone", value: checkout.customer_phone.trim() },
              { display_name: "User ID", variable_name: "user_id", value: user.id },
            ],
          },
          callback: async (response) => {
            await completePayment(response);
          },
          onClose: () => {
            dispatch({ type: "SET_PLACING_ORDER", payload: false });
            dispatch({ type: "SET_CHECKOUT", payload: { key: "message", value: "Payment closed. Your cart is saved." } });
          },
        });
        handler.openIframe();
      } catch (error) {
        console.error("Payment error:", error);
        dispatch({ type: "SET_CHECKOUT", payload: { key: "message", value: "Payment could not be started." } });
        dispatch({ type: "SET_PLACING_ORDER", payload: false });
      }
    },
    [user, cart, checkout, cartTotal, ui.placingOrder, loadCart, loadPaystack]
  );

  const completePayment = useCallback(
    async (paymentResponse) => {
      const ref = paymentResponse?.reference || "";
      if (!ref) {
        dispatch({ type: "SET_CHECKOUT", payload: { key: "message", value: "No payment reference received." } });
        dispatch({ type: "SET_PLACING_ORDER", payload: false });
        return;
      }

      try {
        // Check for duplicate
        const { data: existing } = await supabase
          .from("orders")
          .select("*")
          .eq("payment_reference", ref)
          .maybeSingle();
        if (existing) {
          await loadOrders(user.id);
          await clearCart();
          dispatch({ type: "CLOSE_MODAL", payload: "checkout" });
          dispatch({ type: "SET_PLACING_ORDER", payload: false });
          showNotice("Payment already recorded.");
          return;
        }

        // Create order
        const trackingNumber = generateTrackingNumber();
        const orderPayload = {
          user_id: user.id,
          customer_name: checkout.customer_name.trim(),
          customer_phone: checkout.customer_phone.trim(),
          customer_email: checkout.customer_email.trim(),
          delivery_address: checkout.delivery_address.trim(),
          delivery_state: checkout.delivery_state,
          delivery_city: checkout.delivery_city,
          total: Number(cartTotal),
          payment_status: "paid",
          payment_reference: ref,
          status: "processing",
          tracking_number: trackingNumber,
        };

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert(orderPayload)
          .select()
          .single();

        if (orderError || !order) {
          console.error("Order save error:", orderError);
          dispatch({ type: "SET_CHECKOUT", payload: { key: "message", value: `Payment received but order not saved. Reference: ${ref}` } });
          dispatch({ type: "SET_PLACING_ORDER", payload: false });
          return;
        }

        // Save order items
        const orderItems = cart.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: Number(item.quantity),
          price: Number(item.product?.price || 0),
        }));
        await supabase.from("order_items").insert(orderItems);

        // Update stock
        for (const item of cart) {
          try {
            const currentStock = Number(item.product?.stock || 0);
            const qty = Number(item.quantity || 0);
            if (currentStock >= qty) {
              await supabase
                .from("products")
                .update({ stock: currentStock - qty })
                .eq("id", item.product_id);
            }
          } catch (e) { console.warn("Stock update skipped:", e); }
        }

        await clearCart();
        await loadOrders(user.id);
        await loadProducts();

        const freshOrder = await supabase
          .from("orders")
          .select("*")
          .eq("id", order.id)
          .single();

        dispatch({ type: "SET_SELECTED", payload: { key: "order", value: freshOrder.data } });
        dispatch({ type: "CLOSE_MODAL", payload: "checkout" });
        dispatch({ type: "SET_PLACING_ORDER", payload: false });
        dispatch({ type: "OPEN_MODAL", payload: "tracking" });
        showNotice("Payment successful! Order confirmed.");
      } catch (error) {
        console.error("Complete payment error:", error);
        dispatch({ type: "SET_PLACING_ORDER", payload: false });
      }
    },
    [user, cart, checkout, cartTotal, clearCart, loadOrders, loadProducts, showNotice]
  );

  /* =========================================================
     FILTER PRODUCTS
     ========================================================= */
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(product => {
      const matchesCategory = category === "All" || 
        product.category?.toLowerCase().includes(category.toLowerCase()) ||
        (category === "Audio" && /(airpod|earbud|headphone|speaker)/i.test(product.category || ""));
      
      const searchable = [product.name, product.description, product.category]
        .map(v => String(v || "").toLowerCase())
        .join(" ");
      return matchesCategory && (!q || searchable.includes(q));
    });
  }, [products, category, search]);

  /* =========================================================
     HELPERS
     ========================================================= */
  const getProductImage = useCallback((product) => 
    product?.image_url || product?.image || product?.imageUrl || "", []);

  const formatDate = useCallback((date) => {
    if (!date) return "—";
    try { return new Date(date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return String(date); }
  }, []);

  const getTrackingStep = useCallback((order) => {
    const status = String(order?.status || "pending").toLowerCase();
    const payment = String(order?.payment_status || "pending").toLowerCase();
    if (payment !== "paid") return 0;
    if (["pending", "paid", "confirmed"].includes(status)) return 1;
    if (status === "processing") return 2;
    if (status === "shipped") return 3;
    if (status === "in_transit") return 4;
    if (status === "out_for_delivery") return 5;
    if (status === "delivered") return 6;
    return 2;
  }, []);

  /* =========================================================
     RENDER HELPERS
     ========================================================= */
  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const openProductPreview = useCallback((product) => {
    dispatch({ type: "SET_SELECTED", payload: { key: "product", value: product } });
    dispatch({ type: "OPEN_MODAL", payload: "product" });
  }, []);

  const openOrderTracking = useCallback((order) => {
    dispatch({ type: "SET_SELECTED", payload: { key: "order", value: order } });
    dispatch({ type: "CLOSE_MODAL", payload: "orders" });
    dispatch({ type: "OPEN_MODAL", payload: "tracking" });
  }, []);

  /* =========================================================
     LOADING SCREEN
     ========================================================= */
  if (ui.loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">S</div>
        <strong>SHINDARA PHONEFLAIR</strong>
        <span>Loading store...</span>
      </div>
    );
  }

  /* =========================================================
     MAIN RENDER
     ========================================================= */
  return (
    <div className="app-shell">
      {/* Announcement Bar */}
      <div className="announcement">
        <div className="announcement-track">
          <span>
            SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS • 
            QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE DELIVERY •
          </span>
          <span aria-hidden="true">
            SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS • 
            QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE DELIVERY •
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <button className="logo-button" onClick={() => scrollTo("top")}>
          <b>SHINDARA</b>
          <span className="logo-tagline">PHONEFLAIR</span>
        </button>

        <nav className="desktop-nav">
          <button onClick={() => scrollTo("categories")}>Categories</button>
          <button onClick={() => scrollTo("shop")}>Shop</button>
          {user && <button onClick={() => dispatch({ type: "OPEN_MODAL", payload: "orders" })}>Orders</button>}
        </nav>

        <div className="header-actions">
          <button
            className="account-button"
            onClick={() => {
              if (user) {
                dispatch({ type: "OPEN_MODAL", payload: "settings" });
              } else {
                dispatch({ type: "SET_AUTH_MODE", payload: "login" });
                dispatch({ type: "OPEN_MODAL", payload: "account" });
              }
            }}
          >
            {user ? "Profile" : "Sign in"}
          </button>
          <button
            className="cart-button"
            onClick={() => {
              if (!user) {
                dispatch({ type: "OPEN_MODAL", payload: "account" });
                showNotice("Sign in to access your cart.");
              } else {
                dispatch({ type: "OPEN_MODAL", payload: "cart" });
              }
            }}
          >
            🛒 {cartCount}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="top">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">SHINDARA PHONEFLAIR</div>
            <h1>Tech essentials. <br /><em>Done better.</em></h1>
            <p>Premium phones, accessories and everyday technology selected for people who want quality without the unnecessary noise.</p>
            <button className="primary-button" onClick={() => scrollTo("shop")}>
              Shop now →
            </button>
          </div>
          <div className="hero-card">
            <span>THE SHINDARA EDIT</span>
            <strong>Better accessories.</strong>
            <strong>Better everyday.</strong>
            <div className="hero-line" />
            <p>Discover phone essentials, power, audio and accessories built around your everyday life.</p>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section" id="categories">
          <div className="section-heading">
            <small>SHOP BY CATEGORY</small>
            <h2>Find your essentials.</h2>
          </div>
          <div className="category-scroll">
            {CATEGORIES.map(item => (
              <button
                key={item}
                className={`category ${category === item ? "active" : ""}`}
                onClick={() => {
                  dispatch({ type: "SET_FILTER", payload: { key: "category", value: item } });
                  scrollTo("shop");
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Shop Section */}
        <section className="shop-section" id="shop">
          <div className="shop-top">
            <div>
              <small>THE COLLECTION</small>
              <h2>Shop Shindara.</h2>
            </div>
            <input
              className="search"
              value={search}
              onChange={(e) => dispatch({ type: "SET_FILTER", payload: { key: "search", value: e.target.value } })}
              placeholder="Search products..."
              type="search"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-products">
              <div style={{ fontSize: 40 }}>⌕</div>
              <h3>No products found</h3>
              <p>Try another search or choose a different category.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <article className="product-card" key={product.id}>
                  <button
                    type="button"
                    onClick={() => openProductPreview(product)}
                    className="product-clickable"
                  >
                    <div className="product-image">
                      {getProductImage(product) ? (
                        <img src={getProductImage(product)} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="image-placeholder">S</div>
                      )}
                      {Number(product.stock || 0) <= 0 && <div className="sold-out">SOLD OUT</div>}
                    </div>
                  </button>
                  <div className="product-info">
                    <small>{product.category || "SHINDARA"}</small>
                    <h3>{product.name}</h3>
                    <p>{product.description || "Premium everyday tech essential."}</p>
                    <div className="product-bottom">
                      <strong>{money(product.price)}</strong>
                      <button
                        disabled={Number(product.stock || 0) <= 0}
                        onClick={() => addToCart(product)}
                      >
                        {Number(product.stock || 0) <= 0 ? "Sold out" : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <b>SHINDARA</b>
        <span>PHONEFLAIR</span>
        <p>Premium phone accessories and everyday technology.</p>
        <small>© {new Date().getFullYear()} Shindara Phoneflair. All rights reserved.</small>
      </footer>

      {/* ====================================================
          MODALS
          ==================================================== */}

      {/* Product Preview Modal */}
      {modals.product && selected.product && (
        <Modal onClose={() => dispatch({ type: "CLOSE_MODAL", payload: "product" })}>
          <div className="product-preview-image">
            {getProductImage(selected.product) ? (
              <img src={getProductImage(selected.product)} alt={selected.product.name} />
            ) : (
              <div className="image-placeholder">S</div>
            )}
          </div>
          <div className="modal-heading">
            <small>{selected.product.category || "PRODUCT"}</small>
            <h2>{selected.product.name}</h2>
            <p>{selected.product.description || "Premium Shindara Phoneflair product."}</p>
          </div>
          <div className="checkout-summary">
            <span>Price</span>
            <strong>{money(selected.product.price)}</strong>
            <span>Availability</span>
            <span>{Number(selected.product.stock || 0) > 0 ? `${selected.product.stock} available` : "Sold out"}</span>
          </div>
          <button
            className="primary-button full"
            disabled={Number(selected.product.stock || 0) <= 0}
            onClick={() => {
              addToCart(selected.product);
              dispatch({ type: "CLOSE_MODAL", payload: "product" });
            }}
          >
            {Number(selected.product.stock || 0) > 0 ? "Add to cart" : "Sold out"}
          </button>
        </Modal>
      )}

      {/* Auth Modal */}
      {modals.account && (
        <Modal onClose={() => dispatch({ type: "CLOSE_MODAL", payload: "account" })}>
          <div className="modal-heading">
            <small>SHINDARA ACCOUNT</small>
            <h2>{auth.mode === "login" ? "Welcome back." : "Create your account."}</h2>
            <p>Save your cart, manage your profile and track every order from one place.</p>
          </div>

          {auth.message && <div className="form-message">{auth.message}</div>}

          <button className="google-button" disabled={ui.authLoading} onClick={handleGoogleLogin}>
            Continue with Google
          </button>

          <div className="divider">OR CONTINUE WITH EMAIL</div>

          <form onSubmit={handleAuth}>
            {auth.mode === "signup" && (
              <>
                <label>
                  Full name
                  <input
                    value={auth.fullName}
                    onChange={(e) => dispatch({ type: "SET_AUTH", payload: { key: "fullName", value: e.target.value } })}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </label>
                <label>
                  Phone number
                  <input
                    value={auth.phone}
                    onChange={(e) => dispatch({ type: "SET_AUTH", payload: { key: "phone", value: e.target.value } })}
                    placeholder="08012345678"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
              </>
            )}
            <label>
              Email
              <input
                type="email"
                value={auth.email}
                onChange={(e) => dispatch({ type: "SET_AUTH", payload: { key: "email", value: e.target.value } })}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={auth.password}
                onChange={(e) => dispatch({ type: "SET_AUTH", payload: { key: "password", value: e.target.value } })}
                placeholder="At least 6 characters"
                autoComplete={auth.mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
            <button className="primary-button full" disabled={ui.authLoading} type="submit">
              {ui.authLoading ? "Please wait..." : auth.mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            className="switch-auth"
            onClick={() => {
              dispatch({ type: "SET_AUTH_MODE", payload: auth.mode === "login" ? "signup" : "login" });
              dispatch({ type: "SET_AUTH", payload: { key: "message", value: "" } });
            }}
          >
            {auth.mode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </Modal>
      )}

      {/* Cart Modal */}
      {modals.cart && (
        <Modal onClose={() => dispatch({ type: "CLOSE_MODAL", payload: "cart" })}>
          <div className="modal-heading">
            <small>YOUR BAG</small>
            <h2>Your cart.</h2>
            <p>Your cart is saved to your account, so you can leave and come back without losing your items.</p>
          </div>

          {ui.cartLoading ? (
            <div className="empty-cart"><p>Loading your cart...</p></div>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <div>🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add something you love and it will stay here until you remove it or complete your order.</p>
              <button
                className="primary-button"
                onClick={() => {
                  dispatch({ type: "CLOSE_MODAL", payload: "cart" });
                  scrollTo("shop");
                }}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      {getProductImage(item.product) ? (
                        <img src={getProductImage(item.product)} alt={item.product?.name || ""} />
                      ) : "S"}
                    </div>
                    <div className="cart-item-details">
                      <b>{item.product?.name}</b>
                      <span>{money(item.product?.price)}</span>
                      <div className="quantity">
                        <button onClick={() => updateQuantity(item, -1)}>−</button>
                        <strong>{item.quantity}</strong>
                        <button onClick={() => updateQuantity(item, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-right">
                      <b>{money(item.subtotal)}</b>
                      <button className="remove" onClick={() => removeFromCart(item)}>REMOVE</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <button
                className="primary-button full"
                onClick={() => {
                  dispatch({ type: "CLOSE_MODAL", payload: "cart" });
                  dispatch({ type: "OPEN_MODAL", payload: "checkout" });
                }}
              >
                Proceed to checkout →
              </button>
            </>
          )}
        </Modal>
      )}

      {/* Checkout Modal */}
      {modals.checkout && (
        <Modal onClose={() => !ui.placingOrder && dispatch({ type: "CLOSE_MODAL", payload: "checkout" })}>
          <div className="modal-heading">
            <small>SECURE CHECKOUT</small>
            <h2>Almost there.</h2>
            <p>Enter your delivery details, then continue to secure payment with Paystack.</p>
          </div>

          {checkout.message && <div className="form-message">{checkout.message}</div>}

          <form onSubmit={handlePayment}>
            <div className="checkout-grid">
              <label>
                Full name
                <input
                  value={checkout.customer_name}
                  onChange={(e) => dispatch({ type: "SET_CHECKOUT", payload: { key: "customer_name", value: e.target.value } })}
                  placeholder="Full name"
                  autoComplete="name"
                />
              </label>
              <label>
                Phone number
                <input
                  value={checkout.customer_phone}
                  onChange={(e) => dispatch({ type: "SET_CHECKOUT", payload: { key: "customer_phone", value: e.target.value } })}
                  placeholder="08012345678"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={checkout.customer_email}
                  onChange={(e) => dispatch({ type: "SET_CHECKOUT", payload: { key: "customer_email", value: e.target.value } })}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label>
                State
                <select
                  value={checkout.delivery_state}
                  onChange={(e) => {
                    dispatch({ type: "SET_CHECKOUT", payload: { key: "delivery_state", value: e.target.value } });
                    dispatch({ type: "SET_CHECKOUT", payload: { key: "delivery_city", value: "" } });
                  }}
                >
                  <option value="">Select your state</option>
                  {Object.keys(NIGERIA_LOCATIONS).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>
              <label>
                City / locality
                <select
                  value={checkout.delivery_city}
                  disabled={!checkout.delivery_state}
                  onChange={(e) => dispatch({ type: "SET_CHECKOUT", payload: { key: "delivery_city", value: e.target.value } })}
                >
                  <option value="">{checkout.delivery_state ? "Select city" : "Select state first"}</option>
                  {(NIGERIA_LOCATIONS[checkout.delivery_state] || []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Delivery address
              <textarea
                value={checkout.delivery_address}
                onChange={(e) => dispatch({ type: "SET_CHECKOUT", payload: { key: "delivery_address", value: e.target.value } })}
                placeholder="House number, street, estate, landmark..."
                rows="3"
              />
            </label>

            <div className="checkout-summary">
              <span>Items</span>
              <span>{cartCount}</span>
              <span>Total</span>
              <strong>{money(cartTotal)}</strong>
            </div>

            <button className="primary-button pay-button" disabled={ui.placingOrder} type="submit">
              {ui.placingOrder ? "Opening secure payment..." : `Pay ${money(cartTotal)} with Paystack`}
            </button>
            <span className="secure-note">🔒 Secure payment powered by Paystack</span>
          </form>
        </Modal>
      )}

      {/* Orders Modal */}
      {modals.orders && (
        <Modal onClose={() => dispatch({ type: "CLOSE_MODAL", payload: "orders" })}>
          <div className="modal-heading">
            <small>MY ORDERS</small>
            <h2>Your orders.</h2>
            <p>View your purchases and track delivery progress.</p>
          </div>

          {orders.length === 0 ? (
            <div className="empty-cart">
              <div>📦</div>
              <h3>No orders yet</h3>
              <p>Your completed purchases will appear here.</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <button className="order-card" key={order.id} onClick={() => openOrderTracking(order)}>
                  <div>
                    <small>{formatDate(order.created_at)}</small>
                    <b>{order.tracking_number || `Order #${String(order.id).slice(0, 8)}`}</b>
                    <small>{order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"} • {money(order.total)}</small>
                  </div>
                  <span className={`status ${String(order.payment_status).toLowerCase() === "paid" ? "paid" : "pending"}`}>
                    {order.payment_status}
                  </span>
                  <span className="order-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Tracking Modal */}
      {modals.tracking && selected.order && (
        <Modal onClose={() => dispatch({ type: "CLOSE_MODAL", payload: "tracking" })}>
          <div className="modal-heading">
            <small>ORDER TRACKING</small>
            <h2>{selected.order.tracking_number || "Order tracking"}</h2>
            <p>Keep this tracking number for your delivery.</p>
          </div>

          <div className="tracking-status-box">
            <div>
              <span>Payment</span>
              <strong>{String(selected.order.payment_status || "pending").toUpperCase()}</strong>
            </div>
            <div>
              <span>Order status</span>
              <strong>{String(selected.order.status || "pending").replace(/_/g, " ").toUpperCase()}</strong>
            </div>
            <div>
              <span>Payment reference</span>
              <strong>{selected.order.payment_reference || "—"}</strong>
            </div>
            <div>
              <span>Order date</span>
              <strong>{formatDate(selected.order.created_at)}</strong>
            </div>
          </div>

          <div className="timeline">
            {[
              ["Order placed", "Your order has been received."],
              ["Payment confirmed", "Your payment has been successfully confirmed."],
              ["Processing", "Your items are being prepared."],
              ["Shipped", "Your order has left our store."],
              ["In transit", "Your package is on its way."],
              ["Out for delivery", "Your package is with the delivery team."],
              ["Delivered", "Your order has been delivered."],
            ].map(([title, description], index) => {
              const currentStep = getTrackingStep(selected.order);
              const completed = index <= currentStep;
              return (
                <div className={`timeline-item ${completed ? "completed" : ""}`} key={title}>
                  <div className="timeline-dot">{completed ? "✓" : index + 1}</div>
                  <div>
                    <b>{title}</b>
                    <p>{description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-details">
            <h3>Items purchased</h3>
            {(selected.order.items || []).length === 0 ? (
              <p style={{ color: "#888", fontSize: 11 }}>Order item details are not available yet.</p>
            ) : (
              selected.order.items.map((item) => (
                <div className="detail-item" key={item.id || `${item.product_id}-${item.quantity}`}>
                  <div>
                    <b>{item.product?.name || "Product"}</b>
                    <span>Qty: {item.quantity} × {money(item.price)}</span>
                  </div>
                  <strong>{money(Number(item.price || 0) * Number(item.quantity || 0))}</strong>
                </div>
              ))
            )}
          </div>

          <div className="tracking-total">
            <span>Total</span>
            <strong>{money(selected.order.total)}</strong>
          </div>

          <div className="delivery-box">
            <h3>Delivery address</h3>
            <p><b>{selected.order.customer_name || "—"}</b></p>
            <p>{selected.order.customer_phone || "—"}</p>
            <p>{selected.order.delivery_address || "—"}</p>
            <p>{selected.order.delivery_city || "—"}, {selected.order.delivery_state || "—"}</p>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {modals.settings && user && (
        <Modal onClose={() => dispatch({ type: "CLOSE_MODAL", payload: "settings" })}>
          <div className="modal-heading">
            <small>ACCOUNT SETTINGS</small>
            <h2>Your profile.</h2>
            <p>Manage your customer information and display preferences.</p>
          </div>

          <label>
            Email
            <input value={user.email || ""} readOnly />
          </label>
          <label>
            Full name
            <input
              value={profile?.full_name || ""}
              onChange={(e) => dispatch({ type: "SET_PROFILE", payload: { ...profile, full_name: e.target.value } })}
              placeholder="Your full name"
            />
          </label>
          <label>
            Phone number
            <input
              value={profile?.phone || ""}
              onChange={(e) => dispatch({ type: "SET_PROFILE", payload: { ...profile, phone: e.target.value } })}
              placeholder="08012345678"
              inputMode="tel"
            />
          </label>

          <button
            className="primary-button full"
            disabled={ui.savingProfile}
            onClick={async () => {
              if (!profile?.full_name || !profile?.phone) {
                showNotice("Please fill in all fields.");
                return;
              }
              dispatch({ type: "SET_SAVING_PROFILE", payload: true });
              try {
                await supabase
                  .from("profiles")
                  .upsert({ id: user.id, email: user.email, full_name: profile.full_name, phone: profile.phone })
                  .eq("id", user.id);
                await supabase.auth.updateUser({ data: { full_name: profile.full_name, phone: profile.phone } });
                showNotice("Profile updated.");
              } finally {
                dispatch({ type: "SET_SAVING_PROFILE", payload: false });
              }
            }}
          >
            {ui.savingProfile ? "Saving..." : "Save profile"}
          </button>

          <div className="settings-divider">
            <label>
              Appearance
              <select
                value={theme}
                onChange={(e) => dispatch({ type: "SET_THEME", payload: e.target.value })}
              >
                <option value="device">Use device setting</option>
                <option value="light">Light mode</option>
                <option value="dark">Dark mode</option>
              </select>
            </label>
          </div>

          <button
            className="secondary-button full"
            onClick={() => {
              dispatch({ type: "CLOSE_MODAL", payload: "settings" });
              dispatch({ type: "OPEN_MODAL", payload: "orders" });
            }}
          >
            View my orders
          </button>

          <button className="logout-button" onClick={logout}>
            Sign out
          </button>
        </Modal>
      )}

      {/* Notice */}
      {notice && <div className="notice">{notice}</div>}
    </div>
  );
}

/* =========================================================
   MODAL COMPONENT
   ========================================================= */
function Modal({ children, onClose }) {
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
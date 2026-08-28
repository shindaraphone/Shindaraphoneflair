import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { loadNigeriaLocations } from "./nigeriaLocations";

/* =========================================================
   SHINDARA PHONEFLAIR
   - NO PAYSTACK
   - NO PAYMENT ON DELIVERY
   - MANUAL BANK TRANSFER
   - CART STAYS SAVED UNTIL PAYMENT IS VERIFIED
   - ADMIN APPROVAL/TRACKING NUMBER SUPPORTED
   ========================================================= */

const WHATSAPP = "2348118294548";
const TIKTOK = "https://www.tiktok.com/@shindara.communication";
const INSTAGRAM =
  "https://www.instagram.com/shindara.communication/";

const PAYMENT_MESSAGE =
  "Hello Shindara Phoneflair, I have submitted my order and need the bank transfer details.";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function App() {
  /* =========================================================
     AUTH
     ========================================================= */

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState("profile");

  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  /* =========================================================
     PROFILE
     ========================================================= */

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* =========================================================
     PRODUCTS
     ========================================================= */

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  /* =========================================================
     CART
     ========================================================= */

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  /* =========================================================
     CHECKOUT
     ========================================================= */

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

  /* =========================================================
     ORDERS
     ========================================================= */

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  /* =========================================================
     NIGERIA LOCATIONS
     ========================================================= */

  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");

  /* =========================================================
     THEME
     ========================================================= */

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("shindara-theme");

    if (saved === "dark") return true;
    if (saved === "light") return false;

    return window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
  });

  useEffect(() => {
    localStorage.setItem(
      "shindara-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const theme = darkMode
    ? {
        bg: "#09070d",
        surface: "#15101d",
        card: "#181220",
        input: "#21182b",
        text: "#fff",
        muted: "#b6aabd",
        border: "rgba(255,255,255,.1)",
        soft: "#241a30",
      }
    : {
        bg: "#faf9fc",
        surface: "#fff",
        card: "#fff",
        input: "#faf9fd",
        text: "#17131d",
        muted: "#777080",
        border: "rgba(54,29,78,.11)",
        soft: "#f3edff",
      };

  /* =========================================================
     AUTH INITIALIZATION
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      const currentUser = data?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser.id);
        await loadCart(currentUser.id);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user || null;

        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setCart([]);
          setOrders([]);
          setCartOpen(false);
          setCheckoutOpen(false);
          setAccountOpen(false);
          return;
        }

        setUser(currentUser);

        if (!currentUser) return;

        setTimeout(async () => {
          if (!mounted) return;

          await loadProfile(currentUser.id);
          await loadCart(currentUser.id);
        }, 0);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     PRODUCTS
     ========================================================= */

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel("shindara-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => loadProducts()
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
      setProducts([]);
      setProductsError(
        "We couldn't load the products right now."
      );
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  /* =========================================================
     LOCATIONS
     ========================================================= */

  useEffect(() => {
    async function loadLocations() {
      try {
        setLocationsLoading(true);

        const data = await loadNigeriaLocations();

        if (!Array.isArray(data) || !data.length) {
          throw new Error("No locations found.");
        }

        setLocations(data);
      } catch (error) {
        console.error(error);

        setLocationsError(
          "Unable to load Nigerian states and cities."
        );
      } finally {
        setLocationsLoading(false);
      }
    }

    loadLocations();
  }, []);

  const states = useMemo(
    () =>
      locations
        .map((item) => item.name)
        .filter(Boolean),
    [locations]
  );

  const cities = useMemo(() => {
    const state = locations.find(
      (item) =>
        String(item.name).toLowerCase() ===
        String(deliveryState).toLowerCase()
    );

    return state?.cities || [];
  }, [locations, deliveryState]);

  function changeState(value) {
    setDeliveryState(value);
    setDeliveryCity("");
  }

  /* =========================================================
     PROFILE
     ========================================================= */

  async function loadProfile(userId) {
    if (!userId) return;

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

  async function saveProfile(event) {
    event.preventDefault();

    if (!user) return;

    setSettingsLoading(true);
    setSettingsMessage("");

    try {
      const name = profileName.trim();
      const userPhone = profilePhone.trim();

      if (!name) {
        setSettingsMessage("Please enter your full name.");
        return;
      }

      if (!userPhone) {
        setSettingsMessage(
          "Please enter your phone number."
        );
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name,
          phone: userPhone,
          email: user.email || "",
        });

      if (error) throw error;

      await loadProfile(user.id);

      setCustomerName(name);
      setCustomerPhone(userPhone);

      setSettingsMessage(
        "Your account details have been saved."
      );
    } catch (error) {
      console.error(error);

      setSettingsMessage(
        error?.message ||
          "Unable to save your account details."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

  /* =========================================================
     CART
     ========================================================= */

  async function loadCart(userId) {
    if (!userId) {
      setCart([]);
      return;
    }

    setCartLoading(true);

    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          created_at,
          products (
            id,
            name,
            price,
            image,
            category,
            category_id,
            stock,
            description,
            featured
          )
        `)
        .eq("user_id", userId)
        .order("created_at", {
          ascending: true,
        });

      if (error) throw error;

      const saved = (data || [])
        .filter((item) => item.products)
        .map((item) => ({
          ...item.products,
          image_url: item.products.image || null,
          cart_item_id: item.id,
          quantity: Number(item.quantity || 1),
        }));

      setCart(saved);
    } catch (error) {
      console.error("Cart error:", error);
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  }

  async function addToCart(product) {
    if (!user) {
      setAccountOpen(true);
      setAuthMode("login");
      setAuthMessage(
        "Please sign in or create an account before adding items to your cart."
      );
      return;
    }

    if (Number(product.stock || 0) <= 0) return;

    try {
      const existing = cart.find(
        (item) =>
          String(item.id) === String(product.id)
      );

      if (existing) {
        const newQuantity =
          Number(existing.quantity || 0) + 1;

        if (
          product.stock &&
          newQuantity > Number(product.stock)
        ) {
          setAuthMessage(
            `Only ${product.stock} item(s) are available.`
          );
          return;
        }

        const { error } = await supabase
          .from("cart_items")
          .update({
            quantity: newQuantity,
          })
          .eq("id", existing.cart_item_id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (error) throw error;
      }

      await loadCart(user.id);

      /* IMPORTANT:
         Cart does NOT automatically open. */
    } catch (error) {
      console.error(error);

      setAuthMessage(
        error?.message ||
          "Unable to add this product to your cart."
      );
    }
  }

  async function increaseQuantity(productId) {
    if (!user) return;

    const item = cart.find(
      (x) => String(x.id) === String(productId)
    );

    if (!item) return;

    if (
      item.stock &&
      Number(item.quantity) >= Number(item.stock)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: Number(item.quantity || 0) + 1,
        })
        .eq("id", item.cart_item_id)
        .eq("user_id", user.id);

      if (error) throw error;

      await loadCart(user.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function decreaseQuantity(productId) {
    if (!user) return;

    const item = cart.find(
      (x) => String(x.id) === String(productId)
    );

    if (!item) return;

    try {
      const quantity =
        Number(item.quantity || 0) - 1;

      if (quantity <= 0) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("id", item.cart_item_id)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", item.cart_item_id)
          .eq("user_id", user.id);
      }

      await loadCart(user.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function removeFromCart(productId) {
    if (!user) return;

    const item = cart.find(
      (x) => String(x.id) === String(productId)
    );

    if (!item) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.cart_item_id)
        .eq("user_id", user.id);

      if (error) throw error;

      await loadCart(user.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function clearCart() {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    setCart([]);
  }

  const cartCount = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  /* =========================================================
     ORDERS
     ========================================================= */

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
      console.error(error);
      setOrders([]);
      setOrdersError(
        "We couldn't load your orders right now."
      );
    } else {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  }

  /* =========================================================
     CHECKOUT
     ========================================================= */

  function openCheckout() {
    if (!user) {
      setCartOpen(false);
      setAccountOpen(true);
      setAuthMessage(
        "Please sign in or create an account before checkout."
      );
      return;
    }

    if (!cart.length) return;

    setOrderSuccess(false);
    setOrderMessage("");

    setCustomerName(
      profile?.name || customerName || ""
    );

    setCustomerPhone(
      profile?.phone || customerPhone || ""
    );

    setCartOpen(false);
    setCheckoutOpen(true);
  }

  async function createOrder() {
    const reference =
      `MANUAL-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

    const { data: order, error } =
      await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          delivery_city: deliveryCity.trim(),
          delivery_state: deliveryState.trim(),
          total: cartTotal,

          /* NEVER mark manual transfer as paid. */
          status: "pending",

          payment_reference: reference,
        })
        .select()
        .single();

    if (error) throw error;

    const items = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image_url:
        item.image ||
        item.image_url ||
        null,
    }));

    const { error: itemError } =
      await supabase
        .from("order_items")
        .insert(items);

    if (itemError) {
      await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      throw itemError;
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

    if (!customerName.trim()) {
      setOrderMessage(
        "Please enter your full name."
      );
      return;
    }

    if (!customerPhone.trim()) {
      setOrderMessage(
        "Please enter your phone number."
      );
      return;
    }

    if (!deliveryAddress.trim()) {
      setOrderMessage(
        "Please enter your delivery address."
      );
      return;
    }

    if (!deliveryState) {
      setOrderMessage(
        "Please select your state."
      );
      return;
    }

    if (!deliveryCity) {
      setOrderMessage(
        "Please select your city/LGA."
      );
      return;
    }

    if (!cart.length) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    setOrderLoading(true);
    setOrderMessage("");

    try {
      /* Re-check stock before creating order. */
      const { data: latestProducts, error } =
        await supabase
          .from("products")
          .select("id,name,stock,price")
          .in(
            "id",
            cart.map((item) => item.id)
          );

      if (error) throw error;

      for (const item of cart) {
        const latest = latestProducts?.find(
          (p) =>
            String(p.id) === String(item.id)
        );

        if (!latest) {
          throw new Error(
            `${item.name} is no longer available.`
          );
        }

        if (
          Number(latest.stock || 0) <
          Number(item.quantity || 0)
        ) {
          throw new Error(
            `Only ${latest.stock || 0} of ${item.name} are available.`
          );
        }
      }

      const order = await createOrder();

      setOrderSuccess(true);

      setOrderMessage(
        `Order received successfully! Order #${String(
          order.id
        )
          .slice(0, 8)
          .toUpperCase()} is pending payment verification.`
      );

      /*
       * DO NOT CLEAR CART.
       *
       * The cart remains saved until admin verifies payment.
       */
      await loadOrders();
    } catch (error) {
      console.error("Order error:", error);

      setOrderMessage(
        error?.message ||
          "We couldn't create your order. Please try again."
      );
    } finally {
      setOrderLoading(false);
    }
  }

  /* =========================================================
     AUTH
     ========================================================= */

  async function handleAuth(event) {
    event.preventDefault();

    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "signup") {
        const name = fullName.trim();
        const userPhone = phone.trim();
        const userEmail = email.trim();

        if (!name) {
          setAuthMessage(
            "Please enter your full name."
          );
          return;
        }

        if (!userPhone) {
          setAuthMessage(
            "Please enter your phone number."
          );
          return;
        }

        if (!userEmail) {
          setAuthMessage(
            "Please enter your email address."
          );
          return;
        }

        if (
          !password ||
          password.length < 6
        ) {
          setAuthMessage(
            "Password must be at least 6 characters."
          );
          return;
        }

        const { data, error } =
          await supabase.auth.signUp({
            email: userEmail,
            password,
            options: {
              data: {
                full_name: name,
                phone: userPhone,
              },
            },
          });

        if (error) throw error;

        if (data?.user && data?.session) {
          await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              name,
              phone: userPhone,
              email: userEmail,
            });

          setCustomerName(name);
          setCustomerPhone(userPhone);

          setFullName("");
          setPhone("");
          setEmail("");
          setPassword("");
          setAccountOpen(false);
        } else {
          setAuthMessage(
            "Account created successfully! Please check your email to confirm your account."
          );

          setFullName("");
          setPhone("");
          setEmail("");
          setPassword("");
        }

        return;
      }

      const userEmail = email.trim();

      if (!userEmail || !password) {
        setAuthMessage(
          "Please enter your email and password."
        );
        return;
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: userEmail,
          password,
        });

      if (error) throw error;

      if (data?.user) {
        await loadProfile(data.user.id);
        await loadCart(data.user.id);
        await loadOrders();
      }

      setEmail("");
      setPassword("");
      setAccountOpen(false);
    } catch (error) {
      console.error(error);

      setAuthMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function socialLogin(provider) {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo:
              window.location.origin,
          },
        });

      if (error) throw error;
    } catch (error) {
      setAuthMessage(
        error?.message ||
          `Unable to continue with ${provider}.`
      );
      setAuthLoading(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();

    setResetLoading(true);
    setResetMessage("");

    try {
      const cleanEmail =
        resetEmail.trim();

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
            redirectTo:
              window.location.origin,
          }
        );

      if (error) throw error;

      setResetMessage(
        "Password reset link sent. Check your email."
      );
    } catch (error) {
      setResetMessage(
        error?.message ||
          "Unable to send the reset email."
      );
    } finally {
      setResetLoading(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();

    if (
      !newPassword ||
      newPassword.length < 6
    ) {
      setPasswordMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) throw error;

      setNewPassword("");

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
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
    setCart([]);
    setOrders([]);

    setCartOpen(false);
    setCheckoutOpen(false);
    setAccountOpen(false);
  }

  /* =========================================================
     HELPERS
     ========================================================= */

  function openAccount() {
    setAuthMessage("");
    setSettingsMessage("");
    setPasswordMessage("");

    setAccountTab(
      user ? "profile" : "profile"
    );

    setAccountOpen(true);

    if (user) {
      loadProfile(user.id);
      loadOrders();
    }
  }

  function whatsapp(message = PAYMENT_MESSAGE) {
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
        message
      )}`,
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

  function orderStatus(order) {
    if (
      String(order.payment_status).toLowerCase() ===
      "paid"
    ) {
      return "Paid";
    }

    return (
      order.status
        ? String(order.status)
            .charAt(0)
            .toUpperCase() +
          String(order.status).slice(1)
        : "Pending"
    );
  }

  /* =========================================================
     CATEGORIES + FILTER
     ========================================================= */

  const categoryNames = useMemo(() => {
    const values = products
      .map((product) =>
        String(product.category || "").trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "All" ||
        String(product.category || "")
          .toLowerCase() ===
          category.toLowerCase();

      const searchable = [
        product.name,
        product.description,
        product.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        (!term || searchable.includes(term))
      );
    });
  }, [products, search, category]);

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div
      style={{
        ...styles.app,
        background: theme.bg,
        color: theme.text,
      }}
    >
      <style>{`
        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{
          margin:0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "SF Pro Display",
            "Segoe UI",
            sans-serif;
          background:${theme.bg};
        }
        button,input,select,textarea{font:inherit}
        button{cursor:pointer}
        a{text-decoration:none}
        input::placeholder,
        textarea::placeholder{opacity:.5}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{
          background:#6d28d9;
          border-radius:999px
        }

        .shindara-app{
          min-height:100vh;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(124,58,237,.10),
              transparent 30%
            ),
            ${theme.bg};
        }

        .announcement{
          height:34px;
          overflow:hidden;
          display:flex;
          align-items:center;
          background:#32105f;
          color:#fff;
          white-space:nowrap;
          font-size:9px;
          font-weight:800;
          letter-spacing:1.7px;
        }

        .marquee{
          display:flex;
          width:max-content;
          animation:shindaraMarquee 24s linear infinite;
        }

        .marquee span{
          margin-right:70px;
        }

        @keyframes shindaraMarquee{
          from{transform:translateX(0)}
          to{transform:translateX(-50%)}
        }

        .header{
          position:sticky;
          top:0;
          z-index:100;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:18px;
          padding:14px 6%;
          background:${darkMode
            ? "rgba(13,9,19,.88)"
            : "rgba(255,255,255,.88)"};
          backdrop-filter:blur(20px);
          border-bottom:1px solid ${theme.border};
        }

        .logo{
          color:${theme.text};
          font-size:18px;
          font-weight:950;
          letter-spacing:-1px;
          line-height:.9;
        }

        .logo small{
          display:block;
          margin-top:5px;
          color:#7c3aed;
          font-size:8px;
          letter-spacing:2px;
        }

        .nav{
          display:flex;
          gap:24px;
        }

        .nav a{
          color:${theme.text};
          font-size:11px;
          font-weight:700;
          opacity:.7;
        }

        .header-actions{
          display:flex;
          gap:7px;
        }

        .header-btn{
          border:1px solid ${theme.border};
          background:${theme.surface};
          color:${theme.text};
          border-radius:999px;
          padding:9px 12px;
          font-size:10px;
          font-weight:800;
        }

        .cart-btn{
          border:0;
          background:#6d28d9;
          color:#fff;
          border-radius:999px;
          padding:10px 14px;
          font-size:10px;
          font-weight:850;
        }

        .hero{
          min-height:650px;
          padding:90px 7%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:50px;
          overflow:hidden;
        }

        .hero-content{
          max-width:750px;
        }

        .eyebrow{
          color:#7c3aed;
          font-size:9px;
          font-weight:900;
          letter-spacing:3px;
          margin-bottom:18px;
        }

        .hero h1{
          margin:0;
          font-size:clamp(48px,8vw,94px);
          line-height:.91;
          letter-spacing:-5px;
        }

        .hero p{
          max-width:570px;
          color:${theme.muted};
          font-size:16px;
          line-height:1.7;
          margin:28px 0;
        }

        .primary{
          border:0;
          background:#6d28d9;
          color:#fff;
          border-radius:12px;
          padding:14px 20px;
          font-weight:850;
        }

        .hero-card{
          width:310px;
          min-height:380px;
          flex-shrink:0;
          padding:30px;
          border-radius:32px;
          display:flex;
          flex-direction:column;
          justify-content:flex-end;
          color:#fff;
          background:
            linear-gradient(
              145deg,
              #7c3aed,
              #4c1d95 55%,
              #24123e
            );
          box-shadow:
            0 35px 80px
            rgba(76,29,149,.28);
        }

        .hero-card small{
          margin-bottom:auto;
          font-size:9px;
          font-weight:800;
          letter-spacing:2px;
          opacity:.7;
        }

        .hero-card strong{
          display:block;
          font-size:27px;
          line-height:1;
          margin-top:5px;
        }

        .hero-card hr{
          width:45px;
          margin:22px 0;
          margin-left:0;
          border:0;
          border-top:2px solid #d8b4fe;
        }

        .hero-card p{
          margin:0;
          color:#fff;
          font-size:12px;
          opacity:.7;
        }

        .section{
          padding:75px 7%;
        }

        .section-title{
          margin:8px 0 28px;
          font-size:clamp(32px,5vw,50px);
          line-height:1;
          letter-spacing:-2.5px;
        }

        .category-grid{
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(145px,1fr));
          gap:12px;
        }

        .category{
          min-height:135px;
          padding:18px;
          border:1px solid ${theme.border};
          background:${theme.card};
          color:${theme.text};
          border-radius:20px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          text-align:left;
          transition:.2s;
        }

        .category:hover{
          transform:translateY(-3px);
          border-color:#7c3aed;
        }

        .category-icon{
          width:42px;
          height:42px;
          display:grid;
          place-items:center;
          border-radius:13px;
          background:${theme.soft};
          color:#6d28d9;
          font-size:20px;
        }

        .shop-top{
          display:flex;
          justify-content:space-between;
          align-items:end;
          gap:20px;
        }

        .search{
          width:min(330px,100%);
          height:44px;
          display:flex;
          align-items:center;
          gap:8px;
          padding:0 14px;
          border:1px solid ${theme.border};
          background:${theme.input};
          border-radius:999px;
        }

        .search input{
          width:100%;
          border:0;
          outline:0;
          background:transparent;
          color:${theme.text};
          font-size:11px;
        }

        .filters{
          display:flex;
          gap:7px;
          overflow-x:auto;
          padding:5px 0 20px;
        }

        .filter{
          flex-shrink:0;
          border:1px solid ${theme.border};
          background:${theme.card};
          color:${theme.text};
          border-radius:999px;
          padding:9px 13px;
          font-size:9px;
          font-weight:800;
        }

        .filter.active{
          border-color:#6d28d9;
          background:#6d28d9;
          color:#fff;
        }

        .product-grid{
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(210px,1fr));
          gap:18px;
        }

        .product{
          overflow:hidden;
        }

        .product-image{
          height:255px;
          position:relative;
          display:grid;
          place-items:center;
          overflow:hidden;
          border-radius:20px;
          background:${theme.soft};
        }

        .product-image img{
          width:100%;
          height:100%;
          object-fit:contain;
          padding:14px;
        }

        .sold{
          position:absolute;
          top:10px;
          left:10px;
          background:#24123e;
          color:#fff;
          border-radius:999px;
          padding:6px 8px;
          font-size:8px;
          font-weight:800;
        }

        .product-info{
          padding:14px 3px;
        }

        .product-category{
          color:#7c3aed;
          font-size:8px;
          font-weight:900;
          letter-spacing:1.4px;
          text-transform:uppercase;
        }

        .product-name{
          color:${theme.text};
          margin:7px 0;
          font-size:15px;
        }

        .product-description{
          min-height:32px;
          color:${theme.muted};
          font-size:10px;
          line-height:1.5;
        }

        .product-bottom{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          margin-top:13px;
        }

        .price{
          color:#7c3aed;
          font-size:15px;
          font-weight:900;
        }

        .add{
          border:0;
          background:#6d28d9;
          color:#fff;
          border-radius:10px;
          padding:10px 11px;
          font-size:9px;
          font-weight:850;
        }

        .add:disabled{
          opacity:.45;
        }

        .empty{
          padding:60px 20px;
          text-align:center;
          border:1px solid ${theme.border};
          border-radius:25px;
          background:${theme.card};
        }

        .trust{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:14px;
          padding:65px 7%;
          background:#24123e;
        }

        .trust-card{
          padding:25px;
          border:1px solid rgba(255,255,255,.1);
          border-radius:20px;
          background:rgba(255,255,255,.06);
          color:#fff;
        }

        .trust-card div{
          font-size:24px;
        }

        .trust-card p{
          color:rgba(255,255,255,.58);
          font-size:11px;
          line-height:1.5;
        }

        footer{
          padding:55px 7% 25px;
          background:#160d24;
          color:#fff;
        }

        .footer-inner{
          display:flex;
          justify-content:space-between;
          gap:30px;
          flex-wrap:wrap;
        }

        .footer-title{
          font-size:17px;
          font-weight:900;
        }

        .footer-text{
          color:rgba(255,255,255,.55);
          font-size:11px;
          max-width:400px;
          line-height:1.6;
        }

        .socials{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          margin-top:18px;
        }

        .social{
          border:1px solid rgba(255,255,255,.13);
          background:rgba(255,255,255,.05);
          color:#fff;
          border-radius:999px;
          padding:9px 12px;
          font-size:10px;
          font-weight:700;
        }

        .footer-copy{
          margin-top:35px;
          padding-top:20px;
          border-top:1px solid rgba(255,255,255,.08);
          color:rgba(255,255,255,.35);
          font-size:9px;
        }

        .floating-whatsapp{
          position:fixed;
          right:20px;
          bottom:20px;
          z-index:1500;
          width:55px;
          height:55px;
          border:0;
          border-radius:50%;
          background:#6d28d9;
          color:#fff;
          font-size:22px;
          box-shadow:0 15px 35px rgba(0,0,0,.25);
        }

        .overlay{
          position:fixed;
          inset:0;
          z-index:2000;
          background:rgba(8,4,13,.68);
          backdrop-filter:blur(10px);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:15px;
        }

        .drawer-overlay{
          justify-content:flex-end;
          padding:0;
        }

        .modal{
          position:relative;
          width:min(550px,100%);
          max-height:92vh;
          overflow-y:auto;
          padding:27px;
          border-radius:25px;
          background:${theme.surface};
          color:${theme.text};
          box-shadow:0 30px 100px rgba(0,0,0,.3);
        }

        .drawer{
          width:min(510px,100%);
          height:100%;
          padding:25px;
          overflow-y:auto;
          background:${theme.surface};
          color:${theme.text};
        }

        .close{
          position:absolute;
          right:17px;
          top:17px;
          width:37px;
          height:37px;
          border:0;
          border-radius:50%;
          background:${theme.soft};
          color:${theme.text};
          font-size:23px;
        }

        .field{
          display:block;
          margin:13px 0 6px;
          color:${theme.muted};
          font-size:9px;
          font-weight:800;
        }

        .input,
        .textarea,
        .select{
          width:100%;
          border:1px solid ${theme.border};
          border-radius:11px;
          outline:0;
          background:${theme.input};
          color:${theme.text};
          padding:12px;
          font-size:11px;
        }

        .textarea{
          min-height:85px;
          resize:vertical;
        }

        .two{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:9px;
        }

        .message{
          margin-top:12px;
          padding:11px;
          border-radius:10px;
          background:rgba(124,58,237,.09);
          color:${theme.text};
          font-size:10px;
          line-height:1.5;
        }

        .secondary{
          width:100%;
          margin-top:10px;
          border:1px solid ${theme.border};
          border-radius:11px;
          background:${theme.card};
          color:${theme.text};
          padding:12px;
          font-size:10px;
          font-weight:800;
        }

        .auth-switch{
          border:0;
          background:transparent;
          color:#7c3aed;
          width:100%;
          margin-top:14px;
          font-size:10px;
          font-weight:800;
        }

        .account-tabs{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:7px;
          margin:22px 0;
        }

        .account-tab{
          border:1px solid ${theme.border};
          border-radius:10px;
          background:${theme.card};
          color:${theme.text};
          padding:10px 5px;
          font-size:9px;
          font-weight:800;
        }

        .account-tab.active{
          background:#6d28d9;
          color:#fff;
          border-color:#6d28d9;
        }

        .cart-item{
          display:grid;
          grid-template-columns:70px 1fr auto;
          gap:11px;
          padding:13px 0;
          border-bottom:1px solid ${theme.border};
        }

        .cart-image{
          width:70px;
          height:70px;
          border-radius:14px;
          overflow:hidden;
          background:${theme.soft};
          display:grid;
          place-items:center;
        }

        .cart-image img{
          width:100%;
          height:100%;
          object-fit:contain;
        }

        .cart-name{
          font-size:11px;
          font-weight:800;
        }

        .cart-price{
          color:${theme.muted};
          font-size:10px;
          margin-top:5px;
        }

        .quantity{
          display:flex;
          align-items:center;
          gap:7px;
          margin-top:8px;
        }

        .quantity button{
          width:28px;
          height:28px;
          border:1px solid ${theme.border};
          border-radius:8px;
          background:${theme.card};
          color:${theme.text};
        }

        .remove{
          border:0!important;
          background:transparent!important;
          color:#c02675!important;
          width:auto!important;
          font-size:8px;
        }

        .total{
          display:flex;
          justify-content:space-between;
          padding:20px 0;
          font-size:17px;
        }

        .order{
          padding:15px;
          margin-bottom:10px;
          border:1px solid ${theme.border};
          border-radius:15px;
          background:${theme.card};
        }

        .order-top{
          display:flex;
          justify-content:space-between;
          gap:10px;
        }

        .status{
          display:inline-block;
          margin-top:7px;
          padding:5px 8px;
          border-radius:999px;
          background:${theme.soft};
          color:#7c3aed;
          font-size:8px;
          font-weight:900;
        }

        .tracking{
          margin-top:9px;
          padding:10px;
          border-radius:10px;
          background:rgba(109,40,217,.1);
          font-size:10px;
        }

        @media(max-width:800px){
          .nav{display:none}
          .hero{
            min-height:600px;
            padding:65px 20px;
          }
          .hero-card{display:none}
          .section{padding:55px 16px}
          .shop-top{
            align-items:stretch;
            flex-direction:column;
          }
          .search{width:100%}
          .trust{
            grid-template-columns:1fr;
            padding:45px 16px;
          }
          footer{padding:45px 16px 20px}
        }

        @media(max-width:520px){
          .header{padding:11px 12px}
          .logo{font-size:15px}
          .header-btn,.cart-btn{
            padding:8px 9px;
            font-size:9px;
          }
          .hero h1{
            font-size:clamp(43px,14vw,65px);
            letter-spacing:-3px;
          }
          .product-grid{
            grid-template-columns:repeat(2,minmax(0,1fr));
            gap:10px;
          }
          .product-image{height:170px}
          .product-info{padding:10px 2px}
          .product-name{font-size:12px}
          .product-description{font-size:9px}
          .price{font-size:13px}
          .add{
            padding:8px 7px;
            font-size:8px;
          }
          .modal{
            padding:21px 16px;
            border-radius:20px;
          }
          .two{grid-template-columns:1fr}
        }

        @media(max-width:360px){
          .product-grid{
            grid-template-columns:1fr;
          }
          .product-image{height:220px}
        }
      `}</style>

      <div className="shindara-app">

        {/* =====================================================
            ANNOUNCEMENT
        ===================================================== */}

        <div className="announcement">
          <div className="marquee">
            <span>
              ✦ PREMIUM PHONE ACCESSORIES • BETTER EVERYDAY ✦
            </span>
            <span>
              ✦ SHOP SHINDARA PHONEFLAIR • QUALITY TECH ESSENTIALS ✦
            </span>
            <span>
              ✦ MANUAL BANK TRANSFER • VERIFIED PAYMENTS ONLY ✦
            </span>
            <span>
              ✦ PREMIUM PHONE ACCESSORIES • BETTER EVERYDAY ✦
            </span>
            <span>
              ✦ SHOP SHINDARA PHONEFLAIR • QUALITY TECH ESSENTIALS ✦
            </span>
          </div>
        </div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="header">
          <a href="#home" className="logo">
            SHINDARA
            <small>PHONEFLAIR</small>
          </a>

          <nav className="nav">
            <a href="#home">Home</a>
            <a href="#categories">Categories</a>
            <a href="#shop">Shop</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="header-actions">
            <button
              className="header-btn"
              onClick={() =>
                setDarkMode((value) => !value)
              }
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              className="header-btn"
              onClick={openAccount}
            >
              👤 {user ? "Account" : "Sign in"}
            </button>

            <button
              className="cart-btn"
              onClick={() => {
                if (!user) {
                  setAccountOpen(true);
                  setAuthMessage(
                    "Please sign in to access your saved cart."
                  );
                  return;
                }

                setCartOpen(true);
              }}
            >
              🛒 {cartCount}
            </button>
          </div>
        </header>

        {/* =====================================================
            HERO
        ===================================================== */}

        <main>
          <section className="hero" id="home">
            <div className="hero-content">
              <div className="eyebrow">
                SHINDARA PHONEFLAIR
              </div>

              <h1>
                Technology,
                <br />
                beautifully selected.
              </h1>

              <p>
                Curated phones, accessories,
                chargers, audio products,
                power banks and everyday
                technology for your lifestyle.
              </p>

              <a
                href="#shop"
                className="primary"
              >
                Shop now →
              </a>
            </div>

            <div className="hero-card">
              <small>
                THE SHINDARA EDIT
              </small>

              <strong>
                Better accessories.
              </strong>

              <strong>
                Better everyday.
              </strong>

              <hr />

              <p>
                Curated tech essentials
                for your phone and your
                lifestyle.
              </p>
            </div>
          </section>

          {/* ===================================================
              CATEGORIES
          =================================================== */}

          <section
            className="section"
            id="categories"
          >
            <div className="eyebrow">
              EXPLORE
            </div>

            <h2 className="section-title">
              Shop by category
            </h2>

            <div className="category-grid">
              {[
                ["📱", "Smartphones"],
                ["🛡️", "Phone Cases"],
                ["⚡", "Chargers"],
                ["🎧", "Audio"],
                ["🔋", "Power Banks"],
                ["⌚", "Smart Watches"],
                ["🔌", "Cables"],
                ["▣", "Screen Protectors"],
                ["✦", "Gadgets"],
              ].map(([icon, name]) => (
                <button
                  className="category"
                  key={name}
                  onClick={() => {
                    const found =
                      categoryNames.find(
                        (x) =>
                          x.toLowerCase() ===
                          name.toLowerCase()
                      );

                    if (found) {
                      setCategory(found);
                    } else {
                      const partial =
                        categoryNames.find(
                          (x) =>
                            x
                              .toLowerCase()
                              .includes(
                                name
                                  .toLowerCase()
                                  .split(" ")[0]
                              )
                        );

                      setCategory(
                        partial || "All"
                      );
                    }

                    document
                      .getElementById("shop")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                >
                  <span className="category-icon">
                    {icon}
                  </span>

                  <strong>{name}</strong>

                  <span>→</span>
                </button>
              ))}
            </div>
          </section>

          {/* ===================================================
              SHOP
          =================================================== */}

          <section
            className="section"
            id="shop"
          >
            <div className="shop-top">
              <div>
                <div className="eyebrow">
                  SHINDARA STORE
                </div>

                <h2 className="section-title">
                  Popular picks
                </h2>
              </div>

              <div className="search">
                <span>⌕</span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search accessories..."
                />
              </div>
            </div>

            <div className="filters">
              {categoryNames.map((name) => (
                <button
                  key={name}
                  className={`filter ${
                    category === name
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCategory(name)
                  }
                >
                  {name}
                </button>
              ))}
            </div>

            {productsLoading ? (
              <div className="empty">
                Loading products...
              </div>
            ) : productsError ? (
              <div className="empty">
                <p>{productsError}</p>

                <button
                  className="primary"
                  onClick={loadProducts}
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length ===
              0 ? (
              <div className="empty">
                <div style={{ fontSize: 35 }}>
                  ⌕
                </div>

                <h3>
                  No products found
                </h3>

                <p
                  style={{
                    color: theme.muted,
                    fontSize: 11,
                  }}
                >
                  Try another search or
                  category.
                </p>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts
                  .slice(0, 50)
                  .map((product) => {
                    const stock =
                      Number(
                        product.stock || 0
                      );

                    return (
                      <article
                        className="product"
                        key={product.id}
                      >
                        <div className="product-image">
                          {product.image ? (
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              loading="lazy"
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: 45,
                              }}
                            >
                              📦
                            </span>
                          )}

                          {stock <= 0 && (
                            <span className="sold">
                              OUT OF STOCK
                            </span>
                          )}
                        </div>

                        <div className="product-info">
                          <div className="product-category">
                            {product.category ||
                              "ACCESSORY"}
                          </div>

                          <h3 className="product-name">
                            {product.name}
                          </h3>

                          <p className="product-description">
                            {product.description ||
                              "Premium tech essential."}
                          </p>

                          <div className="product-bottom">
                            <strong className="price">
                              {money(
                                product.price
                              )}
                            </strong>

                            <button
                              className="add"
                              disabled={
                                stock <= 0
                              }
                              onClick={() =>
                                addToCart(
                                  product
                                )
                              }
                            >
                              {stock <= 0
                                ? "Sold out"
                                : "Add to cart"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
              </div>
            )}
          </section>

          {/* ===================================================
              TRUST
          =================================================== */}

          <section className="trust">
            <div className="trust-card">
              <div>✦</div>
              <h3>
                Reliable delivery
              </h3>
              <p>
                Your order is handled
                with care from store
                to doorstep.
              </p>
            </div>

            <div className="trust-card">
              <div>⌾</div>
              <h3>
                Secure shopping
              </h3>
              <p>
                Your account and
                shopping experience
                stay protected.
              </p>
            </div>

            <div className="trust-card">
              <div>◌</div>
              <h3>
                Customer support
              </h3>
              <p>
                We're here whenever
                you need help with
                your order.
              </p>
            </div>
          </section>
        </main>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer id="contact">
          <div className="footer-inner">
            <div>
              <div className="footer-title">
                SHINDARA PHONEFLAIR
              </div>

              <p className="footer-text">
                Premium phone accessories
                and everyday technology.
              </p>

              <div className="socials">
                <button
                  className="social"
                  onClick={() =>
                    whatsapp(
                      "Hello Shindara Phoneflair, I would like to make an enquiry."
                    )
                  }
                >
                  💬 WhatsApp
                </button>

                <a
                  className="social"
                  href={TIKTOK}
                  target="_blank"
                  rel="noreferrer"
                >
                  🎵 TikTok
                </a>

                <a
                  className="social"
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noreferrer"
                >
                  📸 Instagram
                </a>
              </div>
            </div>

            <div>
              <button
                className="social"
                onClick={openAccount}
              >
                My account
              </button>

              <button
                className="social"
                style={{ marginLeft: 7 }}
                onClick={() => {
                  if (!user) {
                    setAccountOpen(true);
                    setAuthMessage(
                      "Please sign in to access your cart."
                    );
                    return;
                  }

                  setCartOpen(true);
                }}
              >
                My cart
              </button>
            </div>
          </div>

          <div className="footer-copy">
            © 2026 Shindara Phoneflair
          </div>
        </footer>

        {/* =====================================================
            FLOATING WHATSAPP
        ===================================================== */}

        <button
          className="floating-whatsapp"
          onClick={() =>
            whatsapp(
              "Hello Shindara Phoneflair, I would like to make an enquiry."
            )
          }
        >
          💬
        </button>

        {/* =====================================================
            CART
        ===================================================== */}

        {cartOpen && user && (
          <div
            className="overlay drawer-overlay"
            onClick={() =>
              setCartOpen(false)
            }
          >
            <aside
              className="drawer"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="close"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                ×
              </button>

              <div
                className="eyebrow"
                style={{
                  marginTop: 5,
                }}
              >
                YOUR SHOPPING
              </div>

              <h2
                style={{
                  fontSize: 34,
                  marginTop: 5,
                }}
              >
                Cart
              </h2>

              {cartLoading ? (
                <div className="empty">
                  Loading cart...
                </div>
              ) : !cart.length ? (
                <div className="empty">
                  <div
                    style={{
                      fontSize: 45,
                    }}
                  >
                    🛒
                  </div>

                  <h3>
                    Your cart is empty
                  </h3>

                  <button
                    className="primary"
                    onClick={() =>
                      setCartOpen(false)
                    }
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      className="cart-item"
                      key={
                        item.cart_item_id
                      }
                    >
                      <div className="cart-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          "📦"
                        )}
                      </div>

                      <div>
                        <div className="cart-name">
                          {item.name}
                        </div>

                        <div className="cart-price">
                          {money(item.price)}
                        </div>

                        <div className="quantity">
                          <button
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                          >
                            −
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
                            +
                          </button>

                          <button
                            className="remove"
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

                      <strong>
                        {money(
                          Number(
                            item.price || 0
                          ) *
                            Number(
                              item.quantity ||
                                0
                            )
                        )}
                      </strong>
                    </div>
                  ))}

                  <div className="total">
                    <span>Total</span>
                    <strong>
                      {money(cartTotal)}
                    </strong>
                  </div>

                  <button
                    className="primary"
                    style={{
                      width: "100%",
                    }}
                    onClick={openCheckout}
                  >
                    Continue to checkout →
                  </button>

                  <button
                    className="secondary"
                    onClick={clearCart}
                  >
                    Clear cart
                  </button>
                </>
              )}
            </aside>
          </div>
        )}

        {/* =====================================================
            CHECKOUT
        ===================================================== */}

        {checkoutOpen && (
          <div className="overlay">
            <div className="modal">
              <button
                className="close"
                disabled={orderLoading}
                onClick={() =>
                  !orderLoading &&
                  setCheckoutOpen(false)
                }
              >
                ×
              </button>

              {orderSuccess ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "25px 5px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 55,
                    }}
                  >
                    ✅
                  </div>

                  <div className="eyebrow">
                    ORDER RECEIVED
                  </div>

                  <h2>
                    Thank you!
                  </h2>

                  <div className="message">
                    {orderMessage}
                  </div>

                  <p
                    style={{
                      color: theme.muted,
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    Your cart has NOT been
                    deleted. It remains saved
                    until your payment is
                    verified.
                  </p>

                  <button
                    className="primary"
                    style={{
                      width: "100%",
                    }}
                    onClick={() =>
                      setCheckoutOpen(false)
                    }
                  >
                    Continue shopping
                  </button>

                  <button
                    className="secondary"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setAccountOpen(true);
                      setAccountTab("orders");
                      loadOrders();
                    }}
                  >
                    View my orders
                  </button>
                </div>
              ) : (
                <>
                  <div className="eyebrow">
                    SHINDARA CHECKOUT
                  </div>

                  <h2>
                    Delivery details
                  </h2>

                  <form
                    onSubmit={placeOrder}
                  >
                    <label className="field">
                      Full name
                    </label>

                    <input
                      className="input"
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(
                          event.target.value
                        )
                      }
                      required
                    />

                    <label className="field">
                      Phone number
                    </label>

                    <input
                      className="input"
                      type="tel"
                      value={customerPhone}
                      onChange={(event) =>
                        setCustomerPhone(
                          event.target.value
                        )
                      }
                      required
                    />

                    <label className="field">
                      Delivery address
                    </label>

                    <textarea
                      className="textarea"
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(
                          event.target.value
                        )
                      }
                      placeholder="House number, street..."
                      required
                    />

                    <div className="two">
                      <div>
                        <label className="field">
                          State
                        </label>

                        <select
                          className="select"
                          value={
                            deliveryState
                          }
                          onChange={(event) =>
                            changeState(
                              event.target.value
                            )
                          }
                          required
                          disabled={
                            locationsLoading
                          }
                        >
                          <option value="">
                            {locationsLoading
                              ? "Loading states..."
                              : "Select state"}
                          </option>

                          {states.map(
                            (state) => (
                              <option
                                key={state}
                                value={state}
                              >
                                {state}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="field">
                          City / LGA
                        </label>

                        <select
                          className="select"
                          value={
                            deliveryCity
                          }
                          onChange={(event) =>
                            setDeliveryCity(
                              event.target.value
                            )
                          }
                          disabled={
                            !deliveryState ||
                            locationsLoading
                          }
                          required
                        >
                          <option value="">
                            {!deliveryState
                              ? "Select state first"
                              : "Select city / LGA"}
                          </option>

                          {cities.map(
                            (city) => (
                              <option
                                key={city}
                                value={city}
                              >
                                {city}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    {locationsError && (
                      <div className="message">
                        {locationsError}
                      </div>
                    )}

                    <div className="total">
                      <span>
                        Order total
                      </span>

                      <strong>
                        {money(cartTotal)}
                      </strong>
                    </div>

                    {/* =================================================
                        MANUAL PAYMENT
                    ================================================= */}

                    <div className="message">
                      <strong>
                        🏦 Manual bank transfer
                      </strong>

                      <br />

                      Submit your order first.
                      Your order will remain
                      <strong> PENDING</strong>{" "}
                      until Shindara verifies
                      your payment.

                      <br />
                      <br />

                      Contact us on WhatsApp
                      for the current bank
                      transfer details and send
                      your payment receipt.

                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          whatsapp(
                            PAYMENT_MESSAGE
                          )
                        }
                      >
                        💬 Get payment details
                      </button>
                    </div>

                    {orderMessage && (
                      <div className="message">
                        {orderMessage}
                      </div>
                    )}

                    <button
                      className="primary"
                      style={{
                        width: "100%",
                        marginTop: 15,
                      }}
                      disabled={orderLoading}
                    >
                      {orderLoading
                        ? "Submitting order..."
                        : `Submit order • ${money(
                            cartTotal
                          )}`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            ACCOUNT
        ===================================================== */}

        {accountOpen && (
          <div
            className="overlay"
            onClick={() =>
              setAccountOpen(false)
            }
          >
            <div
              className="modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="close"
                onClick={() =>
                  setAccountOpen(false)
                }
              >
                ×
              </button>

              {!user ? (
                <>
                  <div className="eyebrow">
                    SHINDARA ACCOUNT
                  </div>

                  <h2>
                    {authMode === "login"
                      ? "Welcome back."
                      : "Create your account."}
                  </h2>

                  <p
                    style={{
                      color: theme.muted,
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    Sign in to shop and
                    keep your cart saved.
                  </p>

                  <form
                    onSubmit={handleAuth}
                  >
                    {authMode ===
                      "signup" && (
                      <>
                        <label className="field">
                          Full name
                        </label>

                        <input
                          className="input"
                          value={fullName}
                          onChange={(event) =>
                            setFullName(
                              event.target.value
                            )
                          }
                          placeholder="Your full name"
                          required
                        />

                        <label className="field">
                          Phone number
                        </label>

                        <input
                          className="input"
                          type="tel"
                          value={phone}
                          onChange={(event) =>
                            setPhone(
                              event.target.value
                            )
                          }
                          placeholder="080..."
                          required
                        />
                      </>
                    )}

                    <label className="field">
                      Email
                    </label>

                    <input
                      className="input"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      required
                    />

                    <label className="field">
                      Password
                    </label>

                    <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="At least 6 characters"
                      minLength={6}
                      required
                    />

                    {authMode ===
                      "login" && (
                      <button
                        type="button"
                        className="auth-switch"
                        onClick={() => {
                          setResetEmail(
                            email
                          );
                          setResetMessage("");
                          setResetOpen(true);
                          setAccountOpen(false);
                        }}
                      >
                        Forgot password?
                      </button>
                    )}

                    {authMessage && (
                      <div className="message">
                        {authMessage}
                      </div>
                    )}

                    <button
                      className="primary"
                      style={{
                        width: "100%",
                        marginTop: 15,
                      }}
                      disabled={authLoading}
                    >
                      {authLoading
                        ? "Please wait..."
                        : authMode ===
                          "signup"
                        ? "Create account"
                        : "Sign in"}
                    </button>
                  </form>

                  {authMode ===
                    "login" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: 10,
                          margin:
                            "18px 0",
                          color:
                            theme.muted,
                          fontSize: 9,
                        }}
                      >
                        <span
                          style={{
                            height: 1,
                            flex: 1,
                            background:
                              theme.border,
                          }}
                        />
                        OR
                        <span
                          style={{
                            height: 1,
                            flex: 1,
                            background:
                              theme.border,
                          }}
                        />
                      </div>

                      <div
                        className="two"
                      >
                        <button
                          className="secondary"
                          style={{
                            marginTop: 0,
                          }}
                          onClick={() =>
                            socialLogin(
                              "google"
                            )
                          }
                        >
                          Google
                        </button>

                        <button
                          className="secondary"
                          style={{
                            marginTop: 0,
                          }}
                          onClick={() =>
                            socialLogin(
                              "apple"
                            )
                          }
                        >
                          Apple
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    className="auth-switch"
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
                      ? "New to Shindara? Create an account"
                      : "Already have an account? Sign in"}
                  </button>
                </>
              ) : (
                <>
                  <div className="eyebrow">
                    CUSTOMER ACCOUNT
                  </div>

                  <h2>
                    {profile?.name
                      ? `Hello, ${
                          profile.name.split(
                            " "
                          )[0]
                        } 👋`
                      : "My account"}
                  </h2>

                  <div className="account-tabs">
                    {[
                      ["profile", "👤 Profile"],
                      ["orders", "📦 Orders"],
                      ["settings", "⚙️ Settings"],
                    ].map(
                      ([tab, label]) => (
                        <button
                          key={tab}
                          className={`account-tab ${
                            accountTab === tab
                              ? "active"
                              : ""
                          }`}
                          onClick={() => {
                            setAccountTab(tab);

                            if (
                              tab ===
                              "orders"
                            ) {
                              loadOrders();
                            }
                          }}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>

                  {/* PROFILE */}

                  {accountTab ===
                    "profile" && (
                    <>
                      <div className="message">
                        <strong>
                          {profile?.name ||
                            "Customer"}
                        </strong>

                        <br />

                        📧{" "}
                        {user.email}

                        <br />

                        📱{" "}
                        {profile?.phone ||
                          "Phone number not added"}
                      </div>

                      <button
                        className="primary"
                        style={{
                          width: "100%",
                          marginTop: 12,
                        }}
                        onClick={() =>
                          setAccountTab(
                            "settings"
                          )
                        }
                      >
                        Edit profile
                      </button>

                      <button
                        className="secondary"
                        onClick={() => {
                          setAccountOpen(false);
                          setCartOpen(true);
                        }}
                      >
                        🛒 My cart ({cartCount})
                      </button>

                      <button
                        className="secondary"
                        onClick={() => {
                          setAccountTab(
                            "orders"
                          );
                          loadOrders();
                        }}
                      >
                        📦 My orders ({orders.length})
                      </button>
                    </>
                  )}

                  {/* ORDERS */}

                  {accountTab ===
                    "orders" && (
                    <>
                      {ordersLoading ? (
                        <div className="empty">
                          Loading your orders...
                        </div>
                      ) : ordersError ? (
                        <div className="message">
                          {ordersError}

                          <button
                            className="secondary"
                            onClick={
                              loadOrders
                            }
                          >
                            Try again
                          </button>
                        </div>
                      ) : !orders.length ? (
                        <div className="empty">
                          <div
                            style={{
                              fontSize: 45,
                            }}
                          >
                            📦
                          </div>

                          <h3>
                            No orders yet
                          </h3>

                          <p
                            style={{
                              color:
                                theme.muted,
                              fontSize: 10,
                            }}
                          >
                            Your orders will
                            appear here.
                          </p>
                        </div>
                      ) : (
                        orders.map(
                          (order) => (
                            <div
                              className="order"
                              key={
                                order.id
                              }
                            >
                              <div className="order-top">
                                <div>
                                  <strong>
                                    Order #
                                    {String(
                                      order.id
                                    )
                                      .slice(
                                        0,
                                        8
                                      )
                                      .toUpperCase()}
                                  </strong>

                                  <div
                                    style={{
                                      color:
                                        theme.muted,
                                      fontSize: 9,
                                      marginTop: 5,
                                    }}
                                  >
                                    {formatDate(
                                      order.created_at
                                    )}
                                  </div>
                                </div>

                                <strong>
                                  {money(
                                    order.total
                                  )}
                                </strong>
                              </div>

                              <span className="status">
                                {orderStatus(
                                  order
                                )}
                              </span>

                              {order.payment_reference && (
                                <div
                                  style={{
                                    color:
                                      theme.muted,
                                    fontSize: 8,
                                    marginTop: 8,
                                  }}
                                >
                                  Ref:{" "}
                                  {
                                    order.payment_reference
                                  }
                                </div>
                              )}

                              {order.tracking_number && (
                                <div className="tracking">
                                  🚚 Tracking number:
                                  <br />
                                  <strong>
                                    {
                                      order.tracking_number
                                    }
                                  </strong>
                                </div>
                              )}

                              <button
                                className="secondary"
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

                              {expandedOrder ===
                                order.id && (
                                <div
                                  style={{
                                    marginTop: 12,
                                    borderTop:
                                      `1px solid ${theme.border}`,
                                    paddingTop: 10,
                                  }}
                                >
                                  {order.order_items?.map(
                                    (item) => (
                                      <div
                                        key={
                                          item.id
                                        }
                                        style={{
                                          display:
                                            "flex",
                                          justifyContent:
                                            "space-between",
                                          gap: 10,
                                          padding:
                                            "7px 0",
                                          fontSize: 10,
                                        }}
                                      >
                                        <span>
                                          {
                                            item.product_name
                                          }{" "}
                                          ×{" "}
                                          {
                                            item.quantity
                                          }
                                        </span>

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
                          )
                        )
                      )}
                    </>
                  )}

                  {/* SETTINGS */}

                  {accountTab ===
                    "settings" && (
                    <>
                      <form
                        onSubmit={
                          saveProfile
                        }
                      >
                        <label className="field">
                          Full name
                        </label>

                        <input
                          className="input"
                          value={profileName}
                          onChange={(event) =>
                            setProfileName(
                              event.target.value
                            )
                          }
                          required
                        />

                        <label className="field">
                          Phone number
                        </label>

                        <input
                          className="input"
                          type="tel"
                          value={profilePhone}
                          onChange={(event) =>
                            setProfilePhone(
                              event.target.value
                            )
                          }
                          required
                        />

                        <label className="field">
                          Email
                        </label>

                        <input
                          className="input"
                          value={
                            user.email || ""
                          }
                          disabled
                        />

                        <button
                          className="primary"
                          style={{
                            width: "100%",
                            marginTop: 15,
                          }}
                          disabled={
                            settingsLoading
                          }
                        >
                          {settingsLoading
                            ? "Saving..."
                            : "Save changes"}
                        </button>
                      </form>

                      {settingsMessage && (
                        <div className="message">
                          {settingsMessage}
                        </div>
                      )}

                      <div
                        style={{
                          borderTop:
                            `1px solid ${theme.border}`,
                          marginTop: 25,
                          paddingTop: 20,
                        }}
                      >
                        <div className="eyebrow">
                          SECURITY
                        </div>

                        <h3>
                          Change password
                        </h3>

                        <form
                          onSubmit={
                            changePassword
                          }
                        >
                          <input
                            className="input"
                            type="password"
                            value={
                              newPassword
                            }
                            onChange={(event) =>
                              setNewPassword(
                                event.target
                                  .value
                              )
                            }
                            placeholder="New password"
                            minLength={6}
                            required
                          />

                          <button
                            className="primary"
                            style={{
                              width: "100%",
                              marginTop: 10,
                            }}
                            disabled={
                              passwordLoading
                            }
                          >
                            {passwordLoading
                              ? "Changing..."
                              : "Change password"}
                          </button>
                        </form>

                        {passwordMessage && (
                          <div className="message">
                            {
                              passwordMessage
                            }
                          </div>
                        )}
                      </div>

                      <button
                        className="secondary"
                        onClick={logout}
                      >
                        🚪 Log out
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* =====================================================
            PASSWORD RESET
        ===================================================== */}

        {resetOpen && (
          <div
            className="overlay"
            onClick={() =>
              setResetOpen(false)
            }
          >
            <div
              className="modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="close"
                onClick={() =>
                  setResetOpen(false)
                }
              >
                ×
              </button>

              <div className="eyebrow">
                SHINDARA ACCOUNT
              </div>

              <h2>
                Reset your password
              </h2>

              <p
                style={{
                  color: theme.muted,
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                Enter your email and
                we'll send you a password
                reset link.
              </p>

              <form
                onSubmit={resetPassword}
              >
                <input
                  className="input"
                  type="email"
                  value={resetEmail}
                  onChange={(event) =>
                    setResetEmail(
                      event.target.value
                    )
                  }
                  placeholder="Email address"
                  required
                />

                <button
                  className="primary"
                  style={{
                    width: "100%",
                    marginTop: 12,
                  }}
                  disabled={resetLoading}
                >
                  {resetLoading
                    ? "Sending..."
                    : "Send reset link"}
                </button>
              </form>

              {resetMessage && (
                <div className="message">
                  {resetMessage}
                </div>
              )}

              <button
                className="secondary"
                onClick={() => {
                  setResetOpen(false);
                  setAccountOpen(true);
                  setAuthMode("login");
                }}
              >
                Back to sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
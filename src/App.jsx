// App.js - Complete Redesigned Version (Copy and paste this entire file)
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
   NIGERIA STATES + CITIES (COMPLETE)
   ========================================================= */
const NIGERIA_LOCATIONS = {
  Abia: ["Aba", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma", "Umuahia", "Umunneochi"],
  Adamawa: ["Fufore", "Ganye", "Girei", "Gombi", "Hong", "Jada", "Jimeta", "Mayo Belwa", "Michika", "Mubi", "Numan", "Song", "Toungo", "Yola"],
  "Akwa Ibom": ["Abak", "Eket", "Essien Udim", "Etinan", "Ikot Ekpene", "Ikot Abasi", "Ika", "Itu", "Mkpat Enin", "Oron", "Uyo"],
  Anambra: ["Aguata", "Awka", "Awka North", "Awka South", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Nnewi", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  Bauchi: ["Bauchi", "Bogoro", "Dass", "Gamawa", "Ganjuwa", "Jama'are", "Katagum", "Misau", "Ningi", "Toro", "Warji"],
  Bayelsa: ["Brass", "Ekeremor", "Kolokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  Benue: ["Adikpo", "Gbajimba", "Gboko", "Katsina-Ala", "Makurdi", "Otukpo", "Vandeikya", "Zaki Biam"],
  Borno: ["Bama", "Biu", "Chibok", "Dikwa", "Gubio", "Jere", "Kaga", "Konduga", "Maiduguri", "Monguno", "Ngala"],
  "Cross River": ["Akampka", "Akamkpa", "Calabar", "Ikom", "Obubra", "Obudu", "Ogoja", "Ugep", "Yakurr"],
  Delta: ["Asaba", "Bomadi", "Burutu", "Effurun", "Isoko North", "Isoko South", "Kwale", "Oghara", "Ogwashi-Uku", "Okpe", "Ozoro", "Sapele", "Ughelli", "Warri", "Warri North", "Warri South", "Warri South West"],
  Ebonyi: ["Abakaliki", "Afikpo", "Ezza", "Ishielu", "Ivo", "Izzi", "Ohaukwu", "Onicha"],
  Edo: ["Auchi", "Benin City", "Ekpoma", "Igarra", "Igueben", "Irrua", "Jattu", "Oredo", "Sabongida-Ora", "Uromi"],
  Ekiti: ["Ado Ekiti", "Aramoko", "Efon Alaaye", "Emure", "Ikere", "Ikole", "Ilawe", "Ijero", "Ise", "Omuo"],
  Enugu: ["Awgu", "Enugu", "Enugu East", "Enugu North", "Enugu South", "Nsukka", "Oji River", "Udi"],
  FCT: ["Abaji", "Abuja", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Maitama", "Wuse", "Garki", "Asokoro", "Gwarinpa", "Jabi", "Lugbe", "Kubwa", "Nyanya"],
  Gombe: ["Akko", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Yamaltu-Deba"],
  Imo: ["Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte Uboma", "Ikeduru", "Isu", "Mbaitoli", "Ngor Okpala", "Nkwerre", "Okigwe", "Orlu", "Owerri", "Owerri Municipal", "Owerri North", "Owerri West"],
  Jigawa: ["Auyo", "Birnin Kudu", "Dutse", "Gumel", "Hadejia", "Kafin Hausa", "Kazaure", "Ringim", "Sule Tankarkar"],
  Kaduna: ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Kaduna", "Kaduna North", "Kaduna South", "Kafanchan", "Kachia", "Kajuru", "Kagarko", "Kaura", "Kudan", "Sabon Gari", "Sanga", "Zangon Kataf", "Zaria"],
  Kano: ["Bichi", "Dambatta", "Dawakin Kudu", "Fagge", "Gaya", "Gwale", "Kano", "Kano Municipal", "Kumbotso", "Nassarawa", "Rano", "Tarauni", "Ungogo", "Wudil"],
  Katsina: ["Bakori", "Batagarawa", "Daura", "Dutsin-Ma", "Funtua", "Jibia", "Kafur", "Kankara", "Katsina", "Malumfashi", "Mani", "Rimi"],
  Kebbi: ["Argungu", "Arewa", "Birnin Kebbi", "Bunza", "Jega", "Kebbe", "Maiyama", "Sakaba", "Surame", "Yauri", "Zuru"],
  Kogi: ["Ankpa", "Dekina", "Idah", "Igalamela", "Kabba", "Kogi", "Lokoja", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  Kwara: ["Baruten", "Edu", "Ilorin", "Ilorin East", "Ilorin South", "Ilorin West", "Ifelodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi", "Jebba", "Lafiagi"],
  Lagos: ["Agege", "Alimosho", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ikeja", "Ikorodu", "Lagos Island", "Lagos Mainland", "Lekki", "Mushin", "Ojo", "Shomolu", "Surulere", "Victoria Island", "Yaba"],
  Nasarawa: ["Akwanga", "Doma", "Karu", "Keffi", "Lafia", "Nasarawa", "Nasarawa Eggon", "Obi", "Toto"],
  Niger: ["Bida", "Borgu", "Chanchaga", "Kontagora", "Lapai", "Minna", "Mokwa", "Munya", "Paikoro", "Rafi", "Shiroro", "Suleja", "Tafa"],
  Ogun: ["Abeokuta", "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Agbara", "Ijebu Ode", "Ijebu North", "Ijebu North East", "Ilaro", "Ikenne", "Iperu", "Ishara", "Ota", "Sagamu", "Ifo", "Obafemi Owode"],
  Ondo: ["Akoko", "Akure", "Akure North", "Akure South", "Ikare", "Ile Oluji", "Ondo", "Okitipupa", "Owo", "Ore", "Idanre"],
  Osun: ["Ede", "Ejigbo", "Ife Central", "Ife East", "Ife North", "Ife South", "Igbajo", "Ijesa", "Ila Orangun", "Ilesa", "Iwo", "Osogbo", "Oshogbo"],
  Oyo: ["Afijio", "Egbeda", "Ibadan", "Ibadan North", "Ibadan North East", "Ibadan North West", "Ibadan South East", "Ibadan South West", "Ibarapa", "Iseyin", "Ogbomosho", "Ogo Oluwa", "Oyo", "Saki", "Saki East"],
  Plateau: ["Barkin Ladi", "Bassa", "Bokkos", "Jos", "Jos East", "Jos North", "Jos South", "Mangu", "Pankshin", "Riyom", "Shendam", "Wase"],
  Rivers: ["Abua", "Ahoada", "Bonny", "Degema", "Eleme", "Emohua", "Etche", "Ikwerre", "Obio-Akpor", "Okrika", "Oyigbo", "Port Harcourt", "Rivers"],
  Sokoto: ["Binji", "Bodinga", "Goronyo", "Gwadabawa", "Illela", "Kware", "Sokoto", "Tambuwal", "Wamakko", "Wurno"],
  Taraba: ["Ardo Kola", "Bali", "Donga", "Gashaka", "Ibi", "Jalingo", "Karim Lamido", "Lau", "Sardauna", "Takum", "Wukari", "Yorro"],
  Yobe: ["Bade", "Bursari", "Damaturu", "Fika", "Geidam", "Gujba", "Gulani", "Nguru", "Potiskum", "Tarmuwa"],
  Zamfara: ["Anka", "Bakura", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Tsafe"],
};

const CATEGORIES = ["All", "Phones", "Phone Cases", "Chargers", "Cables", "Power Banks", "Audio", "Smart Watches", "Screen Protectors"];

/* =========================================================
   MAIN APP
   ========================================================= */
export default function App() {
  // ===== STATE =====
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [modal, setModal] = useState(null); // null, 'cart', 'account', 'checkout', 'orders', 'tracking', 'product', 'settings'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  
  const [checkoutData, setCheckoutData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    delivery_state: "",
    delivery_city: "",
  });
  const [checkoutMessage, setCheckoutMessage] = useState("");
  
  const [theme, setTheme] = useState(() => localStorage.getItem("shindara-theme") || "device");
  
  // ===== REFS =====
  const noticeTimerRef = useRef(null);
  const paymentCallbackRef = useRef(null);
  const paymentCloseRef = useRef(null);

  // ===== COMPUTED =====
  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + Number(item.subtotal || 0), 0), 
    [cart]
  );
  
  const cartCount = useMemo(() => 
    cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), 
    [cart]
  );

  // ===== NOTICE =====
  const showNotice = useCallback((message) => {
    setNotice(message);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(""), 3500);
  }, []);

  // ===== THEME =====
  useEffect(() => {
    localStorage.setItem("shindara-theme", theme);
    const isDark = theme === "dark" || (theme === "device" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, [theme]);

  // ===== DATA LOADING =====
  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
  }, []);

  const loadCart = useCallback(async (userId) => {
    if (!userId) return;
    setCartLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select(`id, user_id, product_id, quantity, products:product_id (id, name, price, image_url, description, category, stock)`)
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
      setCart(formatted);
    }
    setCartLoading(false);
  }, []);

  const loadOrders = useCallback(async (userId) => {
    if (!userId) return;
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
            .select(`id, order_id, product_id, quantity, price, products:product_id (id, name, image_url, category, description)`)
            .eq("order_id", order.id);
          return { ...order, items: (items || []).map(item => ({ ...item, product: item.products })) };
        })
      );
      setOrders(completeOrders);
    }
  }, []);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (!error && data) {
      setProfile(data);
      setCheckoutData(prev => ({
        ...prev,
        customer_name: data.full_name || "",
        customer_phone: data.phone || "",
        customer_email: data.email || "",
      }));
    }
  }, []);

  // ===== INIT =====
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        if (mounted) {
          setUser(currentUser);
          await loadProducts();
          if (currentUser) {
            await loadProfile(currentUser.id);
            await loadCart(currentUser.id);
            await loadOrders(currentUser.id);
          }
        }
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const user = session?.user || null;
      setUser(user);
      if (user) {
        await loadProfile(user.id);
        await loadCart(user.id);
        await loadOrders(user.id);
      } else {
        setProfile(null);
        setCart([]);
        setOrders([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProducts, loadProfile, loadCart, loadOrders]);

  // ===== CART OPERATIONS =====
  const addToCart = useCallback(async (product) => {
    if (!user) {
      setModal("account");
      setAuthMode("login");
      showNotice("Please sign in first.");
      return;
    }
    if (Number(product.stock || 0) <= 0) {
      showNotice("Out of stock.");
      return;
    }

    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      const nextQty = Number(existing.quantity) + 1;
      if (nextQty > Number(product.stock)) {
        showNotice("Cannot exceed available stock.");
        return;
      }
      await supabase.from("cart_items").update({ quantity: nextQty }).eq("id", existing.id).eq("user_id", user.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 });
    }
    await loadCart(user.id);
    showNotice(`${product.name} added to cart!`);
  }, [user, cart, loadCart, showNotice]);

  const updateQuantity = useCallback(async (item, change) => {
    if (!user) return;
    const nextQty = Number(item.quantity) + change;
    if (nextQty <= 0) {
      await supabase.from("cart_items").delete().eq("id", item.id).eq("user_id", user.id);
      await loadCart(user.id);
      showNotice("Item removed.");
      return;
    }
    if (item.product && Number(item.product.stock || 0) < nextQty) {
      showNotice("Cannot exceed available stock.");
      return;
    }
    await supabase.from("cart_items").update({ quantity: nextQty }).eq("id", item.id).eq("user_id", user.id);
    await loadCart(user.id);
  }, [user, loadCart, showNotice]);

  const removeFromCart = useCallback(async (item) => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("id", item.id).eq("user_id", user.id);
    await loadCart(user.id);
    showNotice("Item removed.");
  }, [user, loadCart, showNotice]);

  const clearCart = useCallback(async () => {
    if (!user) return false;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setCart([]);
    return true;
  }, [user]);

  // ===== AUTH =====
  const handleAuth = useCallback(async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");
    try {
      if (!authEmail.trim() || !authPassword) {
        setAuthMessage("Please enter email and password.");
        return;
      }
      if (authPassword.length < 6) {
        setAuthMessage("Password must be at least 6 characters.");
        return;
      }

      if (authMode === "signup") {
        if (!authFullName.trim() || !authPhone.trim()) {
          setAuthMessage("Please enter your full name and phone number.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
          options: { data: { full_name: authFullName.trim(), phone: authPhone.trim() } },
        });
        if (error) throw new Error(error.message);
        if (data?.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: data.user.email || authEmail.trim().toLowerCase(),
            full_name: authFullName.trim(),
            phone: authPhone.trim(),
          });
        }
        if (data?.session) {
          setModal(null);
          showNotice("Account created!");
        } else {
          setAuthMessage("Check your email for verification.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
        });
        if (error) throw new Error(error.message);
        if (data?.user) {
          setModal(null);
          showNotice("Welcome back!");
        }
      }
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, [authEmail, authPassword, authFullName, authPhone, authMode, showNotice]);

  const handleGoogleLogin = useCallback(async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw new Error(error.message);
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCart([]);
    setOrders([]);
    setModal(null);
    showNotice("Signed out.");
  }, [showNotice]);

  // ===== PAYMENT =====
  const loadPaystack = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(true);
        return;
      }
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
        const checkInterval = setInterval(() => {
          if (window.PaystackPop) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 200);
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("Paystack load timeout"));
        }, 10000);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => window.PaystackPop ? resolve(true) : reject(new Error("Paystack not available"));
      script.onerror = () => reject(new Error("Could not load Paystack"));
      document.head.appendChild(script);
    });
  }, []);

  // Payment callback handler
  const handlePaymentCallback = useCallback(async (response) => {
    console.log("Payment callback:", response);
    const ref = response?.reference || response?.trxref || "";
    if (!ref) {
      setCheckoutMessage("No payment reference received.");
      setProcessingPayment(false);
      return;
    }

    try {
      // Check duplicate
      const { data: existing } = await supabase.from("orders").select("*").eq("payment_reference", ref).maybeSingle();
      if (existing) {
        await loadOrders(user.id);
        await clearCart();
        setModal(null);
        setProcessingPayment(false);
        showNotice("Payment already recorded!");
        return;
      }

      // Create order
      const trackingNumber = generateTrackingNumber();
      const orderPayload = {
        user_id: user.id,
        customer_name: checkoutData.customer_name.trim(),
        customer_phone: checkoutData.customer_phone.trim(),
        customer_email: checkoutData.customer_email.trim(),
        delivery_address: checkoutData.delivery_address.trim(),
        delivery_state: checkoutData.delivery_state,
        delivery_city: checkoutData.delivery_city,
        total: Number(cartTotal),
        payment_status: "paid",
        payment_reference: ref,
        status: "processing",
        tracking_number: trackingNumber,
      };

      const { data: order, error: orderError } = await supabase.from("orders").insert(orderPayload).select().single();
      if (orderError || !order) {
        setCheckoutMessage(`Payment received but order not saved. Reference: ${ref}`);
        setProcessingPayment(false);
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
            await supabase.from("products").update({ stock: currentStock - qty }).eq("id", item.product_id);
          }
        } catch (e) { console.warn("Stock update skipped:", e); }
      }

      await clearCart();
      await loadOrders(user.id);
      await loadProducts();

      const { data: freshOrder } = await supabase.from("orders").select("*").eq("id", order.id).single();
      setSelectedOrder(freshOrder || order);
      setModal("tracking");
      setProcessingPayment(false);
      showNotice("Payment successful! 🎉");
    } catch (error) {
      console.error("Payment completion error:", error);
      setCheckoutMessage("Error completing payment. Please contact support.");
      setProcessingPayment(false);
    }
  }, [user, cart, cartTotal, checkoutData, clearCart, loadOrders, loadProducts, showNotice]);

  // Payment close handler
  const handlePaymentClose = useCallback(() => {
    console.log("Payment closed");
    setProcessingPayment(false);
    setCheckoutMessage("Payment was cancelled.");
  }, []);

  // Setup payment
  const handlePayment = useCallback(async (e) => {
    e.preventDefault();
    if (processingPayment) return;
    if (!user) {
      setCheckoutMessage("Please sign in.");
      return;
    }
    if (!cart.length) {
      setCheckoutMessage("Your cart is empty.");
      return;
    }

    // Validate fields
    const required = [
      ["customer_name", "full name"],
      ["customer_phone", "phone number"],
      ["customer_email", "email"],
      ["delivery_address", "delivery address"],
      ["delivery_state", "state"],
      ["delivery_city", "city"],
    ];
    for (const [field, label] of required) {
      if (!String(checkoutData[field] || "").trim()) {
        setCheckoutMessage(`Please enter your ${label}.`);
        return;
      }
    }

    // Check stock
    for (const item of cart) {
      if (Number(item.product?.stock || 0) < Number(item.quantity || 0)) {
        setCheckoutMessage(`${item.product?.name || "Product"} is out of stock.`);
        await loadCart(user.id);
        return;
      }
    }

    setProcessingPayment(true);
    setCheckoutMessage("Loading payment...");

    try {
      await loadPaystack();
      if (!window.PaystackPop) throw new Error("Paystack not available.");

      const reference = `SHP-${user.id.slice(0,8)}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      const amount = Math.round(Number(cartTotal) * 100);

      paymentCallbackRef.current = handlePaymentCallback;
      paymentCloseRef.current = handlePaymentClose;

      const handler = window.PaystackPop.setup({
        key: CONFIG.PAYSTACK_KEY,
        email: checkoutData.customer_email.trim(),
        amount: amount,
        currency: "NGN",
        ref: reference,
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: checkoutData.customer_name.trim() },
            { display_name: "Customer Phone", variable_name: "customer_phone", value: checkoutData.customer_phone.trim() },
            { display_name: "User ID", variable_name: "user_id", value: user.id },
          ],
        },
        callback: paymentCallbackRef.current,
        onClose: paymentCloseRef.current,
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      setCheckoutMessage(error.message || "Payment could not be started.");
      setProcessingPayment(false);
    }
  }, [user, cart, cartTotal, checkoutData, processingPayment, loadCart, loadPaystack, handlePaymentCallback, handlePaymentClose]);

  // ===== FILTERS =====
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(product => {
      const matchesCategory = category === "All" || 
        product.category?.toLowerCase().includes(category.toLowerCase()) ||
        (category === "Audio" && /(airpod|earbud|headphone|speaker)/i.test(product.category || ""));
      const searchable = [product.name, product.description, product.category].map(v => String(v || "").toLowerCase()).join(" ");
      return matchesCategory && (!q || searchable.includes(q));
    });
  }, [products, category, search]);

  // ===== HELPERS =====
  const getProductImage = useCallback((product) => product?.image_url || product?.image || product?.imageUrl || "", []);
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

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ===== MODAL COMPONENT =====
  const Modal = ({ children, onClose }) => (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">S</div>
        <strong>SHINDARA PHONEFLAIR</strong>
        <span>Loading store...</span>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="app-shell">
      {/* ANNOUNCEMENT */}
      <div className="announcement">
        <div className="announcement-track">
          <span>SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS • QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE DELIVERY •</span>
          <span aria-hidden="true">SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS • QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE DELIVERY •</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="header">
        <button className="logo-button" onClick={() => scrollTo("top")}>
          <b>SHINDARA</b>
          <span className="logo-tagline">PHONEFLAIR</span>
        </button>

        <nav className="desktop-nav">
          <button onClick={() => scrollTo("categories")}>Categories</button>
          <button onClick={() => scrollTo("shop")}>Shop</button>
          {user && <button onClick={() => setModal("orders")}>Orders</button>}
        </nav>

        <div className="header-actions">
          <button className="account-button" onClick={() => {
            if (user) setModal("settings");
            else { setAuthMode("login"); setModal("account"); }
          }}>
            {user ? "Profile" : "Sign in"}
          </button>
          <button className="cart-button" onClick={() => {
            if (!user) { setModal("account"); showNotice("Sign in to access your cart."); }
            else setModal("cart");
          }}>
            🛒 {cartCount}
          </button>
        </div>
      </header>

      {/* HERO */}
      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">SHINDARA PHONEFLAIR</div>
            <h1>Tech essentials. <br /><em>Done better.</em></h1>
            <p>Premium phones, accessories and everyday technology selected for people who want quality without the unnecessary noise.</p>
            <button className="primary-button" onClick={() => scrollTo("shop")}>Shop now →</button>
          </div>
          <div className="hero-card">
            <span>THE SHINDARA EDIT</span>
            <strong>Better accessories.</strong>
            <strong>Better everyday.</strong>
            <div className="hero-line" />
            <p>Discover phone essentials, power, audio and accessories built around your everyday life.</p>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="categories-section" id="categories">
          <div className="section-heading">
            <small>SHOP BY CATEGORY</small>
            <h2>Find your essentials.</h2>
          </div>
          <div className="category-scroll">
            {CATEGORIES.map(item => (
              <button key={item} className={`category ${category === item ? "active" : ""}`} onClick={() => {
                setCategory(item);
                scrollTo("shop");
              }}>
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* SHOP */}
        <section className="shop-section" id="shop">
          <div className="shop-top">
            <div>
              <small>THE COLLECTION</small>
              <h2>Shop Shindara.</h2>
            </div>
            <input className="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." type="search" />
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
                  <button type="button" onClick={() => { setSelectedProduct(product); setModal("product"); }} className="product-clickable">
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
                      <button disabled={Number(product.stock || 0) <= 0} onClick={() => addToCart(product)}>
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

      {/* FOOTER */}
      <footer className="footer">
        <b>SHINDARA</b>
        <span>PHONEFLAIR</span>
        <p>Premium phone accessories and everyday technology.</p>
        <small>© {new Date().getFullYear()} Shindara Phoneflair. All rights reserved.</small>
      </footer>

      {/* =========================================================
          MODALS
          ========================================================= */}

      {/* PRODUCT PREVIEW */}
      {modal === "product" && selectedProduct && (
        <Modal onClose={() => setModal(null)}>
          <div className="product-preview-image">
            {getProductImage(selectedProduct) ? (
              <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
            ) : (
              <div className="image-placeholder">S</div>
            )}
          </div>
          <div className="modal-heading">
            <small>{selectedProduct.category || "PRODUCT"}</small>
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description || "Premium Shindara Phoneflair product."}</p>
          </div>
          <div className="checkout-summary">
            <span>Price</span>
            <strong>{money(selectedProduct.price)}</strong>
            <span>Availability</span>
            <span>{Number(selectedProduct.stock || 0) > 0 ? `${selectedProduct.stock} available` : "Sold out"}</span>
          </div>
          <button className="primary-button full" disabled={Number(selectedProduct.stock || 0) <= 0} onClick={() => {
            addToCart(selectedProduct);
            setModal(null);
          }}>
            {Number(selectedProduct.stock || 0) > 0 ? "Add to cart" : "Sold out"}
          </button>
        </Modal>
      )}

      {/* AUTH */}
      {modal === "account" && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-heading">
            <small>SHINDARA ACCOUNT</small>
            <h2>{authMode === "login" ? "Welcome back." : "Create your account."}</h2>
            <p>Save your cart, manage your profile and track every order from one place.</p>
          </div>

          {authMessage && <div className={`form-message ${authMessage.includes("Check your email") ? "success" : "error"}`}>{authMessage}</div>}

          <button className="google-button" disabled={authLoading} onClick={handleGoogleLogin}>
            Continue with Google
          </button>

          <div className="divider">OR CONTINUE WITH EMAIL</div>

          <form onSubmit={handleAuth}>
            {authMode === "signup" && (
              <>
                <label>
                  Full name
                  <input value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} placeholder="Your full name" autoComplete="name" />
                </label>
                <label>
                  Phone number
                  <input value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="08012345678" inputMode="tel" autoComplete="tel" />
                </label>
              </>
            )}
            <label>
              Email
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </label>
            <label>
              Password
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={authMode === "signup" ? "new-password" : "current-password"} />
            </label>
            <button className="primary-button full" disabled={authLoading} type="submit">
              {authLoading ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button className="switch-auth" onClick={() => {
            setAuthMode(authMode === "login" ? "signup" : "login");
            setAuthMessage("");
          }}>
            {authMode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </Modal>
      )}

      {/* CART */}
      {modal === "cart" && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-heading">
            <small>YOUR BAG</small>
            <h2>Your cart.</h2>
            <p>Your cart is saved to your account, so you can leave and come back without losing your items.</p>
          </div>

          {cartLoading ? (
            <div className="empty-cart"><p>Loading your cart...</p></div>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <div>🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add something you love and it will stay here until you remove it or complete your order.</p>
              <button className="primary-button" onClick={() => { setModal(null); scrollTo("shop"); }}>
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
              <button className="primary-button full" onClick={() => setModal("checkout")}>
                Proceed to checkout →
              </button>
            </>
          )}
        </Modal>
      )}

      {/* CHECKOUT */}
      {modal === "checkout" && (
        <Modal onClose={() => !processingPayment && setModal(null)}>
          <div className="modal-heading">
            <small>SECURE CHECKOUT</small>
            <h2>Almost there.</h2>
            <p>Enter your delivery details, then continue to secure payment with Paystack.</p>
          </div>

          {checkoutMessage && (
            <div className={`form-message ${checkoutMessage.includes("successful") ? "success" : "error"}`}>
              {checkoutMessage}
            </div>
          )}

          <form onSubmit={handlePayment}>
            <div className="checkout-grid">
              <label>
                Full name
                <input value={checkoutData.customer_name} onChange={(e) => setCheckoutData(prev => ({ ...prev, customer_name: e.target.value }))} placeholder="Full name" autoComplete="name" required />
              </label>
              <label>
                Phone number
                <input value={checkoutData.customer_phone} onChange={(e) => setCheckoutData(prev => ({ ...prev, customer_phone: e.target.value }))} placeholder="08012345678" inputMode="tel" autoComplete="tel" required />
              </label>
              <label>
                Email
                <input type="email" value={checkoutData.customer_email} onChange={(e) => setCheckoutData(prev => ({ ...prev, customer_email: e.target.value }))} placeholder="you@example.com" autoComplete="email" required />
              </label>
              <label>
                State
                <select value={checkoutData.delivery_state} onChange={(e) => {
                  setCheckoutData(prev => ({ ...prev, delivery_state: e.target.value, delivery_city: "" }));
                }} required>
                  <option value="">Select your state</option>
                  {Object.keys(NIGERIA_LOCATIONS).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>
              <label>
                City / locality
                <select value={checkoutData.delivery_city} disabled={!checkoutData.delivery_state} onChange={(e) => {
                  setCheckoutData(prev => ({ ...prev, delivery_city: e.target.value }));
                }} required>
                  <option value="">{checkoutData.delivery_state ? "Select city" : "Select state first"}</option>
                  {(NIGERIA_LOCATIONS[checkoutData.delivery_state] || []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Delivery address
              <textarea value={checkoutData.delivery_address} onChange={(e) => setCheckoutData(prev => ({ ...prev, delivery_address: e.target.value }))} placeholder="House number, street, estate, landmark..." rows="3" required />
            </label>

            <div className="checkout-summary">
              <span>Items</span>
              <span>{cartCount}</span>
              <span>Total</span>
              <strong>{money(cartTotal)}</strong>
            </div>

            <button className="primary-button pay-button" disabled={processingPayment} type="submit">
              {processingPayment ? (
                <>
                  <span className="spinner"></span>
                  Opening secure payment...
                </>
              ) : (
                `Pay ${money(cartTotal)} with Paystack`
              )}
            </button>
            <span className="secure-note">🔒 Secure payment powered by Paystack</span>
          </form>
        </Modal>
      )}

      {/* ORDERS */}
      {modal === "orders" && (
        <Modal onClose={() => setModal(null)}>
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
                <button className="order-card" key={order.id} onClick={() => {
                  setSelectedOrder(order);
                  setModal("tracking");
                }}>
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

      {/* TRACKING */}
      {modal === "tracking" && selectedOrder && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-heading">
            <small>ORDER TRACKING</small>
            <h2>{selectedOrder.tracking_number || "Order tracking"}</h2>
            <p>Keep this tracking number for your delivery.</p>
          </div>

          <div className="tracking-status-box">
            <div>
              <span>Payment</span>
              <strong>{String(selectedOrder.payment_status || "pending").toUpperCase()}</strong>
            </div>
            <div>
              <span>Order status</span>
              <strong>{String(selectedOrder.status || "pending").replace(/_/g, " ").toUpperCase()}</strong>
            </div>
            <div>
              <span>Payment reference</span>
              <strong>{selectedOrder.payment_reference || "—"}</strong>
            </div>
            <div>
              <span>Order date</span>
              <strong>{formatDate(selectedOrder.created_at)}</strong>
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
              const currentStep = getTrackingStep(selectedOrder);
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
            {(selectedOrder.items || []).length === 0 ? (
              <p style={{ color: "#888", fontSize: 11 }}>Order item details are not available yet.</p>
            ) : (
              selectedOrder.items.map((item) => (
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
            <strong>{money(selectedOrder.total)}</strong>
          </div>

          <div className="delivery-box">
            <h3>Delivery address</h3>
            <p><b>{selectedOrder.customer_name || "—"}</b></p>
            <p>{selectedOrder.customer_phone || "—"}</p>
            <p>{selectedOrder.delivery_address || "—"}</p>
            <p>{selectedOrder.delivery_city || "—"}, {selectedOrder.delivery_state || "—"}</p>
          </div>
        </Modal>
      )}

      {/* SETTINGS */}
      {modal === "settings" && user && (
        <Modal onClose={() => setModal(null)}>
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
            <input value={profile?.full_name || ""} onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Your full name" />
          </label>
          <label>
            Phone number
            <input value={profile?.phone || ""} onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))} placeholder="08012345678" inputMode="tel" />
          </label>

          <button className="primary-button full" onClick={async () => {
            if (!profile?.full_name || !profile?.phone) {
              showNotice("Please fill in all fields.");
              return;
            }
            try {
              await supabase.from("profiles").upsert({ id: user.id, email: user.email, full_name: profile.full_name, phone: profile.phone });
              await supabase.auth.updateUser({ data: { full_name: profile.full_name, phone: profile.phone } });
              showNotice("Profile updated.");
            } catch (error) {
              showNotice("Error updating profile.");
            }
          }}>
            Save profile
          </button>

          <div className="settings-divider">
            <label>
              Appearance
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="device">Use device setting</option>
                <option value="light">Light mode</option>
                <option value="dark">Dark mode</option>
              </select>
            </label>
          </div>

          <button className="secondary-button full" onClick={() => setModal("orders")}>
            View my orders
          </button>

          <button className="logout-button" onClick={logout}>
            Sign out
          </button>
        </Modal>
      )}

      {/* NOTICE */}
      {notice && <div className="notice">{notice}</div>}
    </div>
  );
}
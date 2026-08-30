// App.js - Complete Redesign with Fixed Payment
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
   NIGERIA LOCATIONS
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
  
  const [activeModal, setActiveModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notification, setNotification] = useState("");
  
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  
  const [checkout, setCheckout] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    state: "",
    city: "",
  });
  const [checkoutError, setCheckoutError] = useState("");
  
  const [theme, setTheme] = useState(() => localStorage.getItem("shindara-theme") || "device");
  
  // ===== REFS =====
  const notificationTimer = useRef(null);
  const paystackCallback = useRef(null);
  const paystackClose = useRef(null);

  // ===== COMPUTED =====
  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + Number(item.subtotal || 0), 0), 
    [cart]
  );
  
  const cartCount = useMemo(() => 
    cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0), 
    [cart]
  );

  // ===== NOTIFICATION =====
  const showNotification = useCallback((message) => {
    setNotification(message);
    clearTimeout(notificationTimer.current);
    notificationTimer.current = setTimeout(() => setNotification(""), 3500);
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
      .select(`*, products:product_id (*)`)
      .eq("user_id", userId);
    if (!error && data) {
      const formatted = data
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
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      const withItems = await Promise.all(
        data.map(async (order) => {
          const { data: items } = await supabase
            .from("order_items")
            .select(`*, products:product_id (*)`)
            .eq("order_id", order.id);
          return { ...order, items: items || [] };
        })
      );
      setOrders(withItems);
    }
  }, []);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) {
      setProfile(data);
      setCheckout(prev => ({
        ...prev,
        name: data.full_name || "",
        phone: data.phone || "",
        email: data.email || "",
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
      setActiveModal("auth");
      setAuthMode("login");
      showNotification("Please sign in first.");
      return;
    }
    if (Number(product.stock || 0) <= 0) {
      showNotification("Out of stock.");
      return;
    }

    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      const nextQty = Number(existing.quantity) + 1;
      if (nextQty > Number(product.stock)) {
        showNotification("Cannot exceed available stock.");
        return;
      }
      await supabase
        .from("cart_items")
        .update({ quantity: nextQty })
        .eq("id", existing.id)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: product.id, quantity: 1 });
    }
    await loadCart(user.id);
    showNotification(`${product.name} added to cart!`);
  }, [user, cart, loadCart, showNotification]);

  const updateQuantity = useCallback(async (item, change) => {
    if (!user) return;
    const nextQty = Number(item.quantity) + change;
    if (nextQty <= 0) {
      await supabase.from("cart_items").delete().eq("id", item.id).eq("user_id", user.id);
      await loadCart(user.id);
      showNotification("Item removed.");
      return;
    }
    if (item.product && Number(item.product.stock || 0) < nextQty) {
      showNotification("Cannot exceed available stock.");
      return;
    }
    await supabase
      .from("cart_items")
      .update({ quantity: nextQty })
      .eq("id", item.id)
      .eq("user_id", user.id);
    await loadCart(user.id);
  }, [user, loadCart, showNotification]);

  const removeFromCart = useCallback(async (item) => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("id", item.id).eq("user_id", user.id);
    await loadCart(user.id);
    showNotification("Item removed.");
  }, [user, loadCart, showNotification]);

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
    setAuthError("");
    try {
      if (!authEmail.trim() || !authPassword) {
        setAuthError("Please enter email and password.");
        return;
      }
      if (authPassword.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }

      if (authMode === "signup") {
        if (!authFullName.trim() || !authPhone.trim()) {
          setAuthError("Please enter your full name and phone number.");
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
          setActiveModal(null);
          showNotification("Account created!");
        } else {
          setAuthError("Check your email for verification.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
        });
        if (error) throw new Error(error.message);
        if (data?.user) {
          setActiveModal(null);
          showNotification("Welcome back!");
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, [authEmail, authPassword, authFullName, authPhone, authMode, showNotification]);

  const handleGoogleLogin = useCallback(async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw new Error(error.message);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCart([]);
    setOrders([]);
    setActiveModal(null);
    showNotification("Signed out.");
  }, [showNotification]);

  // ===== PAYMENT =====
  const loadPaystack = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existing) {
        const interval = setInterval(() => {
          if (window.PaystackPop) {
            clearInterval(interval);
            resolve(true);
          }
        }, 200);
        setTimeout(() => {
          clearInterval(interval);
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

  // FIXED: Payment callback as a separate function
  const onPaymentSuccess = useCallback(async (response) => {
    console.log("Payment successful:", response);
    const ref = response?.reference || response?.trxref || "";
    
    if (!ref) {
      setCheckoutError("No payment reference received.");
      setProcessingPayment(false);
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
        setActiveModal(null);
        setProcessingPayment(false);
        showNotification("Payment already recorded!");
        return;
      }

      // Create order
      const trackingNumber = generateTrackingNumber();
      const orderPayload = {
        user_id: user.id,
        customer_name: checkout.name.trim(),
        customer_phone: checkout.phone.trim(),
        customer_email: checkout.email.trim(),
        delivery_address: checkout.address.trim(),
        delivery_state: checkout.state,
        delivery_city: checkout.city,
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
        setCheckoutError(`Payment received but order not saved. Reference: ${ref}`);
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

      const { data: freshOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order.id)
        .single();

      setSelectedOrder(freshOrder || order);
      setActiveModal("tracking");
      setProcessingPayment(false);
      showNotification("Payment successful! 🎉");
    } catch (error) {
      console.error("Payment completion error:", error);
      setCheckoutError("Error completing payment. Please contact support.");
      setProcessingPayment(false);
    }
  }, [user, cart, cartTotal, checkout, clearCart, loadOrders, loadProducts, showNotification]);

  // FIXED: Payment close handler
  const onPaymentClose = useCallback(() => {
    console.log("Payment closed");
    setProcessingPayment(false);
    setCheckoutError("Payment was cancelled.");
  }, []);

  // FIXED: Payment initialization
  const handlePayment = useCallback(async (e) => {
    e.preventDefault();
    
    if (processingPayment) return;
    if (!user) {
      setCheckoutError("Please sign in.");
      return;
    }
    if (!cart.length) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    // Validate fields
    const required = [
      ["name", "full name"],
      ["phone", "phone number"],
      ["email", "email"],
      ["address", "delivery address"],
      ["state", "state"],
      ["city", "city"],
    ];
    for (const [field, label] of required) {
      if (!String(checkout[field] || "").trim()) {
        setCheckoutError(`Please enter your ${label}.`);
        return;
      }
    }

    // Check stock
    for (const item of cart) {
      if (Number(item.product?.stock || 0) < Number(item.quantity || 0)) {
        setCheckoutError(`${item.product?.name || "Product"} is out of stock.`);
        await loadCart(user.id);
        return;
      }
    }

    setProcessingPayment(true);
    setCheckoutError("Loading payment...");

    try {
      await loadPaystack();
      if (!window.PaystackPop) throw new Error("Paystack not available.");

      const reference = `SHP-${user.id.slice(0,8)}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      const amount = Math.round(Number(cartTotal) * 100);

      // Store callbacks in refs
      paystackCallback.current = onPaymentSuccess;
      paystackClose.current = onPaymentClose;

      const handler = window.PaystackPop.setup({
        key: CONFIG.PAYSTACK_KEY,
        email: checkout.email.trim(),
        amount: amount,
        currency: "NGN",
        ref: reference,
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: checkout.name.trim() },
            { display_name: "Customer Phone", variable_name: "customer_phone", value: checkout.phone.trim() },
            { display_name: "User ID", variable_name: "user_id", value: user.id },
          ],
        },
        callback: paystackCallback.current,
        onClose: paystackClose.current,
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      setCheckoutError(error.message || "Payment could not be started.");
      setProcessingPayment(false);
    }
  }, [user, cart, cartTotal, checkout, processingPayment, loadCart, loadPaystack, onPaymentSuccess, onPaymentClose]);

  // ===== FILTERS =====
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(product => {
      const matchCategory = category === "All" || 
        product.category?.toLowerCase().includes(category.toLowerCase()) ||
        (category === "Audio" && /(airpod|earbud|headphone|speaker)/i.test(product.category || ""));
      const matchSearch = !q || 
        [product.name, product.description, product.category]
          .map(v => String(v || "").toLowerCase())
          .join(" ")
          .includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, category, search]);

  // ===== HELPERS =====
  const getImage = useCallback((product) => product?.image_url || product?.image || product?.imageUrl || "", []);
  const formatDate = useCallback((date) => {
    if (!date) return "—";
    try { return new Date(date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return String(date); }
  }, []);

  const getStep = useCallback((order) => {
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

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ===== MODAL COMPONENT =====
  const Modal = ({ children, onClose }) => (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">S</div>
        <h2>SHINDARA PHONEFLAIR</h2>
        <p>Loading store...</p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="app">
      {/* ANNOUNCEMENT BAR */}
      <div className="announcement-bar">
        <div className="announcement-track">
          <span>✦ SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS • QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE DELIVERY ✦</span>
          <span aria-hidden="true">✦ SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS • QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE DELIVERY ✦</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="header">
        <button className="brand" onClick={() => scrollToSection("top")}>
          <strong>SHINDARA</strong>
          <span>PHONEFLAIR</span>
        </button>

        <nav className="nav-links">
          <button onClick={() => scrollToSection("categories")}>Categories</button>
          <button onClick={() => scrollToSection("shop")}>Shop</button>
          {user && <button onClick={() => setActiveModal("orders")}>Orders</button>}
        </nav>

        <div className="header-actions">
          <button 
            className="btn-profile" 
            onClick={() => user ? setActiveModal("settings") : (setAuthMode("login"), setActiveModal("auth"))}
          >
            {user ? "👤 Profile" : "Sign in"}
          </button>
          <button 
            className="btn-cart" 
            onClick={() => user ? setActiveModal("cart") : (setActiveModal("auth"), showNotification("Sign in to access your cart."))}
          >
            🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section" id="top">
        <div className="hero-content">
          <span className="hero-badge">✦ SHINDARA PHONEFLAIR</span>
          <h1>Tech essentials.<br /><em>Done better.</em></h1>
          <p>Premium phones, accessories and everyday technology selected for people who want quality without the unnecessary noise.</p>
          <button className="btn-primary" onClick={() => scrollToSection("shop")}>
            Shop now →
          </button>
        </div>
        <div className="hero-card">
          <span>THE SHINDARA EDIT</span>
          <h3>Better accessories.</h3>
          <h3>Better everyday.</h3>
          <div className="hero-divider" />
          <p>Discover phone essentials, power, audio and accessories built around your everyday life.</p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-section" id="categories">
        <div className="section-header">
          <span>SHOP BY CATEGORY</span>
          <h2>Find your essentials.</h2>
        </div>
        <div className="categories-scroll">
          {CATEGORIES.map(item => (
            <button
              key={item}
              className={`category-btn ${category === item ? "active" : ""}`}
              onClick={() => { setCategory(item); scrollToSection("shop"); }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products-section" id="shop">
        <div className="products-header">
          <div>
            <span>THE COLLECTION</span>
            <h2>Shop Shindara.</h2>
          </div>
          <input
            className="search-input"
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No products found</h3>
            <p>Try another search or choose a different category.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div className="product-card" key={product.id}>
                <button 
                  className="product-image-wrapper"
                  onClick={() => { setSelectedProduct(product); setActiveModal("product"); }}
                >
                  {getImage(product) ? (
                    <img src={getImage(product)} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="image-placeholder">S</div>
                  )}
                  {Number(product.stock || 0) <= 0 && <span className="badge-soldout">SOLD OUT</span>}
                </button>
                <div className="product-details">
                  <span className="product-category">{product.category || "SHINDARA"}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description || "Premium everyday tech essential."}</p>
                  <div className="product-actions">
                    <strong>{money(product.price)}</strong>
                    <button 
                      disabled={Number(product.stock || 0) <= 0}
                      onClick={() => addToCart(product)}
                    >
                      {Number(product.stock || 0) <= 0 ? "Sold out" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <strong>SHINDARA</strong>
          <span>PHONEFLAIR</span>
          <p>Premium phone accessories and everyday technology.</p>
          <small>© {new Date().getFullYear()} Shindara Phoneflair. All rights reserved.</small>
        </div>
      </footer>

      {/* =========================================================
          MODALS
          ========================================================= */}

      {/* PRODUCT MODAL */}
      {activeModal === "product" && selectedProduct && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="modal-product-image">
            {getImage(selectedProduct) ? (
              <img src={getImage(selectedProduct)} alt={selectedProduct.name} />
            ) : (
              <div className="image-placeholder">S</div>
            )}
          </div>
          <div className="modal-header">
            <span>{selectedProduct.category || "PRODUCT"}</span>
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description || "Premium Shindara Phoneflair product."}</p>
          </div>
          <div className="modal-summary">
            <div>
              <span>Price</span>
              <strong>{money(selectedProduct.price)}</strong>
            </div>
            <div>
              <span>Availability</span>
              <span>{Number(selectedProduct.stock || 0) > 0 ? `${selectedProduct.stock} available` : "Sold out"}</span>
            </div>
          </div>
          <button 
            className="btn-primary full" 
            disabled={Number(selectedProduct.stock || 0) <= 0}
            onClick={() => { addToCart(selectedProduct); setActiveModal(null); }}
          >
            {Number(selectedProduct.stock || 0) > 0 ? "Add to cart" : "Sold out"}
          </button>
        </Modal>
      )}

      {/* AUTH MODAL */}
      {activeModal === "auth" && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="modal-header">
            <span>SHINDARA ACCOUNT</span>
            <h2>{authMode === "login" ? "Welcome back." : "Create your account."}</h2>
            <p>Save your cart, manage your profile and track every order from one place.</p>
          </div>

          {authError && <div className={`form-message ${authError.includes("verification") ? "success" : "error"}`}>{authError}</div>}

          <button className="btn-google" disabled={authLoading} onClick={handleGoogleLogin}>
            Continue with Google
          </button>

          <div className="divider">OR CONTINUE WITH EMAIL</div>

          <form onSubmit={handleAuth}>
            {authMode === "signup" && (
              <>
                <div className="form-group">
                  <label>Full name</label>
                  <input value={authFullName} onChange={(e) => setAuthFullName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label>Phone number</label>
                  <input value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="08012345678" />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <button className="btn-primary full" disabled={authLoading} type="submit">
              {authLoading ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button className="switch-auth" onClick={() => {
            setAuthMode(authMode === "login" ? "signup" : "login");
            setAuthError("");
          }}>
            {authMode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </Modal>
      )}

      {/* CART MODAL */}
      {activeModal === "cart" && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="modal-header">
            <span>YOUR BAG</span>
            <h2>Your cart.</h2>
            <p>Your cart is saved to your account, so you can leave and come back without losing your items.</p>
          </div>

          {cartLoading ? (
            <div className="empty-state"><p>Loading your cart...</p></div>
          ) : cart.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add something you love and it will stay here until you remove it or complete your order.</p>
              <button className="btn-primary" onClick={() => { setActiveModal(null); scrollToSection("shop"); }}>
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      {getImage(item.product) ? (
                        <img src={getImage(item.product)} alt={item.product?.name || ""} />
                      ) : "S"}
                    </div>
                    <div className="cart-item-info">
                      <strong>{item.product?.name}</strong>
                      <span>{money(item.product?.price)}</span>
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      <strong>{money(item.subtotal)}</strong>
                      <button className="btn-remove" onClick={() => removeFromCart(item)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <button className="btn-primary full" onClick={() => setActiveModal("checkout")}>
                Proceed to checkout →
              </button>
            </>
          )}
        </Modal>
      )}

      {/* CHECKOUT MODAL */}
      {activeModal === "checkout" && (
        <Modal onClose={() => !processingPayment && setActiveModal(null)}>
          <div className="modal-header">
            <span>SECURE CHECKOUT</span>
            <h2>Almost there.</h2>
            <p>Enter your delivery details, then continue to secure payment with Paystack.</p>
          </div>

          {checkoutError && (
            <div className={`form-message ${checkoutError.includes("successful") ? "success" : "error"}`}>
              {checkoutError}
            </div>
          )}

          <form onSubmit={handlePayment}>
            <div className="checkout-grid">
              <div className="form-group">
                <label>Full name</label>
                <input value={checkout.name} onChange={(e) => setCheckout(prev => ({ ...prev, name: e.target.value }))} placeholder="Full name" required />
              </div>
              <div className="form-group">
                <label>Phone number</label>
                <input value={checkout.phone} onChange={(e) => setCheckout(prev => ({ ...prev, phone: e.target.value }))} placeholder="08012345678" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={checkout.email} onChange={(e) => setCheckout(prev => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>State</label>
                <select value={checkout.state} onChange={(e) => {
                  setCheckout(prev => ({ ...prev, state: e.target.value, city: "" }));
                }} required>
                  <option value="">Select your state</option>
                  {Object.keys(NIGERIA_LOCATIONS).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>City / locality</label>
                <select value={checkout.city} disabled={!checkout.state} onChange={(e) => {
                  setCheckout(prev => ({ ...prev, city: e.target.value }));
                }} required>
                  <option value="">{checkout.state ? "Select city" : "Select state first"}</option>
                  {(NIGERIA_LOCATIONS[checkout.state] || []).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Delivery address</label>
              <textarea value={checkout.address} onChange={(e) => setCheckout(prev => ({ ...prev, address: e.target.value }))} placeholder="House number, street, estate, landmark..." rows="3" required />
            </div>

            <div className="modal-summary">
              <div>
                <span>Items</span>
                <span>{cartCount}</span>
              </div>
              <div>
                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>
            </div>

            <button className="btn-primary pay-btn" disabled={processingPayment} type="submit">
              {processingPayment ? (
                <>
                  <span className="spinner"></span>
                  Opening secure payment...
                </>
              ) : (
                `Pay ${money(cartTotal)} with Paystack`
              )}
            </button>
            <p className="secure-note">🔒 Secure payment powered by Paystack</p>
          </form>
        </Modal>
      )}

      {/* ORDERS MODAL */}
      {activeModal === "orders" && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="modal-header">
            <span>MY ORDERS</span>
            <h2>Your orders.</h2>
            <p>View your purchases and track delivery progress.</p>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Your completed purchases will appear here.</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <button className="order-card" key={order.id} onClick={() => {
                  setSelectedOrder(order);
                  setActiveModal("tracking");
                }}>
                  <div>
                    <small>{formatDate(order.created_at)}</small>
                    <strong>{order.tracking_number || `Order #${String(order.id).slice(0, 8)}`}</strong>
                    <small>{order.items?.length || 0} item{(order.items?.length || 0) === 1 ? "" : "s"} • {money(order.total)}</small>
                  </div>
                  <span className={`order-status ${String(order.payment_status).toLowerCase() === "paid" ? "paid" : "pending"}`}>
                    {order.payment_status}
                  </span>
                  <span className="order-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* TRACKING MODAL */}
      {activeModal === "tracking" && selectedOrder && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="modal-header">
            <span>ORDER TRACKING</span>
            <h2>{selectedOrder.tracking_number || "Order tracking"}</h2>
            <p>Keep this tracking number for your delivery.</p>
          </div>

          <div className="tracking-grid">
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
              const currentStep = getStep(selectedOrder);
              const completed = index <= currentStep;
              return (
                <div className={`timeline-item ${completed ? "completed" : ""}`} key={title}>
                  <div className="timeline-dot">{completed ? "✓" : index + 1}</div>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-items">
            <h3>Items purchased</h3>
            {(selectedOrder.items || []).length === 0 ? (
              <p className="text-muted">Order item details are not available yet.</p>
            ) : (
              selectedOrder.items.map((item) => (
                <div className="order-item" key={item.id || `${item.product_id}-${item.quantity}`}>
                  <div>
                    <strong>{item.product?.name || "Product"}</strong>
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

          <div className="delivery-info">
            <h3>Delivery address</h3>
            <p><strong>{selectedOrder.customer_name || "—"}</strong></p>
            <p>{selectedOrder.customer_phone || "—"}</p>
            <p>{selectedOrder.delivery_address || "—"}</p>
            <p>{selectedOrder.delivery_city || "—"}, {selectedOrder.delivery_state || "—"}</p>
          </div>
        </Modal>
      )}

      {/* SETTINGS MODAL */}
      {activeModal === "settings" && user && (
        <Modal onClose={() => setActiveModal(null)}>
          <div className="modal-header">
            <span>ACCOUNT SETTINGS</span>
            <h2>Your profile.</h2>
            <p>Manage your customer information and display preferences.</p>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={user.email || ""} readOnly />
          </div>
          <div className="form-group">
            <label>Full name</label>
            <input value={profile?.full_name || ""} onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Phone number</label>
            <input value={profile?.phone || ""} onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))} placeholder="08012345678" />
          </div>

          <button className="btn-primary full" onClick={async () => {
            if (!profile?.full_name || !profile?.phone) {
              showNotification("Please fill in all fields.");
              return;
            }
            try {
              await supabase.from("profiles").upsert({ 
                id: user.id, 
                email: user.email, 
                full_name: profile.full_name, 
                phone: profile.phone 
              });
              await supabase.auth.updateUser({ 
                data: { full_name: profile.full_name, phone: profile.phone } 
              });
              showNotification("Profile updated.");
            } catch (error) {
              showNotification("Error updating profile.");
            }
          }}>
            Save profile
          </button>

          <div className="settings-divider">
            <div className="form-group">
              <label>Appearance</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="device">Use device setting</option>
                <option value="light">Light mode</option>
                <option value="dark">Dark mode</option>
              </select>
            </div>
          </div>

          <button className="btn-secondary full" onClick={() => setActiveModal("orders")}>
            View my orders
          </button>

          <button className="btn-logout" onClick={handleLogout}>
            Sign out
          </button>
        </Modal>
      )}

      {/* NOTIFICATION */}
      {notification && <div className="notification">{notification}</div>}
    </div>
  );
}
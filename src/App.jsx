// App.js - Complete Redesign
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient.js";
import "./shindara-redesign.css";

/* =========================================================
   CONFIG
   ========================================================= */
const PAYSTACK_KEY = "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

const money = (value) => 
  `₦${Number(value || 0).toLocaleString("en-NG")}`;

const generateTrackingNumber = () =>
  `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

/* =========================================================
   LOCATIONS
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

const CATEGORIES = ["All", "Phone Cases", "Chargers", "Cables", "Power Banks", "Audio", "Smart Watches", "Screen Protectors"];

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
  const [processing, setProcessing] = useState(false);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [checkout, setCheckout] = useState({
    name: "", phone: "", email: "", address: "", state: "", city: ""
  });
  const [checkoutError, setCheckoutError] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  const timer = useRef(null);

  // ===== COMPUTED =====
  const cartTotal = useMemo(() => 
    cart.reduce((s, i) => s + Number(i.subtotal || 0), 0), [cart]);
  const cartCount = useMemo(() => 
    cart.reduce((s, i) => s + Number(i.quantity || 0), 0), [cart]);

  // ===== NOTICE =====
  const showNotice = useCallback((msg) => {
    setNotice(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(""), 3000);
  }, []);

  // ===== THEME =====
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // ===== DATA LOADING =====
  const loadProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  }, []);

  const loadCart = useCallback(async (id) => {
    if (!id) return;
    setCartLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select(`*, products:product_id(*)`)
      .eq("user_id", id);
    if (data) {
      setCart(data.filter(i => i.products).map(i => ({
        ...i,
        product: i.products,
        subtotal: Number(i.products.price || 0) * Number(i.quantity || 0)
      })));
    }
    setCartLoading(false);
  }, []);

  const loadOrders = useCallback(async (id) => {
    if (!id) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });
    if (data) {
      const withItems = await Promise.all(data.map(async (o) => {
        const { data: items } = await supabase
          .from("order_items")
          .select(`*, products:product_id(*)`)
          .eq("order_id", o.id);
        return { ...o, items: items || [] };
      }));
      setOrders(withItems);
    }
  }, []);

  const loadProfile = useCallback(async (id) => {
    if (!id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      setProfile(data);
      setCheckout(prev => ({
        ...prev,
        name: data.full_name || "",
        phone: data.phone || "",
        email: data.email || ""
      }));
    }
  }, []);

  // ===== INIT =====
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const u = session?.user || null;
        if (mounted) {
          setUser(u);
          await loadProducts();
          if (u) {
            await loadProfile(u.id);
            await loadCart(u.id);
            await loadOrders(u.id);
          }
        }
      } catch (e) { console.error(e); } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) {
        await loadProfile(u.id);
        await loadCart(u.id);
        await loadOrders(u.id);
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

  // ===== CART ACTIONS =====
  const addToCart = useCallback(async (product) => {
    if (!user) {
      setModal("auth");
      setAuthMode("login");
      showNotice("Please sign in first.");
      return;
    }
    if (Number(product.stock || 0) <= 0) {
      showNotice("Out of stock.");
      return;
    }

    const existing = cart.find(i => i.product_id === product.id);
    if (existing) {
      const next = Number(existing.quantity) + 1;
      if (next > Number(product.stock)) {
        showNotice("Cannot exceed available stock.");
        return;
      }
      await supabase
        .from("cart_items")
        .update({ quantity: next })
        .eq("id", existing.id)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: product.id, quantity: 1 });
    }
    await loadCart(user.id);
    showNotice(`${product.name} added!`);
  }, [user, cart, loadCart, showNotice]);

  const updateQty = useCallback(async (item, change) => {
    if (!user) return;
    const next = Number(item.quantity) + change;
    if (next <= 0) {
      await supabase.from("cart_items").delete().eq("id", item.id).eq("user_id", user.id);
      await loadCart(user.id);
      showNotice("Item removed.");
      return;
    }
    if (item.product && Number(item.product.stock || 0) < next) {
      showNotice("Cannot exceed available stock.");
      return;
    }
    await supabase
      .from("cart_items")
      .update({ quantity: next })
      .eq("id", item.id)
      .eq("user_id", user.id);
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
        if (!authName.trim() || !authPhone.trim()) {
          setAuthError("Please enter your full name and phone number.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
          options: { data: { full_name: authName.trim(), phone: authPhone.trim() } },
        });
        if (error) throw new Error(error.message);
        if (data?.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: data.user.email || authEmail.trim().toLowerCase(),
            full_name: authName.trim(),
            phone: authPhone.trim(),
          });
        }
        if (data?.session) {
          setModal(null);
          showNotice("Account created!");
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
          setModal(null);
          showNotice(`Welcome back!`);
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, [authEmail, authPassword, authName, authPhone, authMode, showNotice]);

  const handleGoogle = useCallback(async () => {
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

  const onPaymentSuccess = useCallback(async (response) => {
    const ref = response?.reference || response?.trxref || "";
    if (!ref) {
      setCheckoutError("No payment reference received.");
      setProcessing(false);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("payment_reference", ref)
        .maybeSingle();
      
      if (existing) {
        await loadOrders(user.id);
        await clearCart();
        setModal(null);
        setProcessing(false);
        showNotice("Payment already recorded!");
        return;
      }

      const tracking = generateTrackingNumber();
      const payload = {
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
        tracking_number: tracking,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(payload)
        .select()
        .single();

      if (orderError || !order) {
        setCheckoutError(`Payment received but order not saved. Reference: ${ref}`);
        setProcessing(false);
        return;
      }

      const items = cart.map(i => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: Number(i.quantity),
        price: Number(i.product?.price || 0),
      }));
      await supabase.from("order_items").insert(items);

      for (const i of cart) {
        try {
          const stock = Number(i.product?.stock || 0);
          const qty = Number(i.quantity || 0);
          if (stock >= qty) {
            await supabase
              .from("products")
              .update({ stock: stock - qty })
              .eq("id", i.product_id);
          }
        } catch (e) { console.warn(e); }
      }

      await clearCart();
      await loadOrders(user.id);
      await loadProducts();

      const { data: fresh } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order.id)
        .single();

      setSelectedOrder(fresh || order);
      setModal("tracking");
      setProcessing(false);
      showNotice("Payment successful! 🎉");
    } catch (error) {
      console.error(error);
      setCheckoutError("Error completing payment.");
      setProcessing(false);
    }
  }, [user, cart, cartTotal, checkout, clearCart, loadOrders, loadProducts, showNotice]);

  const onPaymentClose = useCallback(() => {
    setProcessing(false);
    setCheckoutError("Payment was cancelled.");
  }, []);

  const handlePayment = useCallback(async (e) => {
    e.preventDefault();
    if (processing) return;
    if (!user) {
      setCheckoutError("Please sign in.");
      return;
    }
    if (!cart.length) {
      setCheckoutError("Your cart is empty.");
      return;
    }

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

    for (const i of cart) {
      if (Number(i.product?.stock || 0) < Number(i.quantity || 0)) {
        setCheckoutError(`${i.product?.name || "Product"} is out of stock.`);
        await loadCart(user.id);
        return;
      }
    }

    setProcessing(true);
    setCheckoutError("Loading payment...");

    try {
      await loadPaystack();
      if (!window.PaystackPop) throw new Error("Paystack not available.");

      const ref = `SHP-${user.id.slice(0,8)}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
      const amount = Math.round(Number(cartTotal) * 100);

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: checkout.email.trim(),
        amount: amount,
        currency: "NGN",
        ref: ref,
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: checkout.name.trim() },
            { display_name: "Customer Phone", variable_name: "customer_phone", value: checkout.phone.trim() },
            { display_name: "User ID", variable_name: "user_id", value: user.id },
          ],
        },
        callback: function(response) {
          onPaymentSuccess(response);
        },
        onClose: function() {
          onPaymentClose();
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error(error);
      setCheckoutError(error.message || "Payment could not be started.");
      setProcessing(false);
    }
  }, [user, cart, cartTotal, checkout, processing, loadCart, loadPaystack, onPaymentSuccess, onPaymentClose]);

  // ===== FILTER =====
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchCat = category === "All" || 
        p.category?.toLowerCase().includes(category.toLowerCase()) ||
        (category === "Audio" && /(airpod|earbud|headphone|speaker)/i.test(p.category || ""));
      const matchSearch = !q || 
        [p.name, p.description, p.category].map(v => String(v || "").toLowerCase()).join(" ").includes(q);
      return matchCat && matchSearch;
    });
  }, [products, category, search]);

  // ===== HELPERS =====
  const getImage = useCallback((p) => p?.image_url || p?.image || p?.imageUrl || "", []);
  const formatDate = useCallback((d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }); }
    catch { return String(d); }
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

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ===== MODAL =====
  const Modal = ({ children, onClose }) => (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-logo">S</div>
        <h1>SHINDARA</h1>
        <p>Loading...</p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="app">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-track">
          <span className="golden">✦ Premium phone accessories are screaming here!!! ✦</span>
          <span className="golden" aria-hidden="true">✦ Premium phone accessories are screaming here!!! ✦</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="header">
        <button className="logo" onClick={() => scrollTo("top")}>
          <span className="logo-icon">◆</span>
          <div>
            <strong>SHINDARA</strong>
            <span>PHONEFLAIR</span>
          </div>
        </button>

        <nav className="nav">
          <button onClick={() => scrollTo("shop")}>Shop</button>
          <button onClick={() => scrollTo("categories")}>Categories</button>
          {user && <button onClick={() => setModal("orders")}>Orders</button>}
        </nav>

        <div className="actions">
          <button className="action-btn" onClick={() => {
            if (user) setModal("settings");
            else { setAuthMode("login"); setModal("auth"); }
          }}>
            {user ? "👤" : "Sign In"}
          </button>
          <button className="action-btn cart-btn" onClick={() => {
            if (!user) { setModal("auth"); showNotice("Sign in to access your cart."); }
            else setModal("cart");
          }}>
            🛒 {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-content">
          <span className="hero-badge">✦ 2024 COLLECTION</span>
          <h1>Tech <br /><em>Essentials</em></h1>
          <p>Premium accessories engineered for everyday excellence.</p>
          <button className="btn-primary" onClick={() => scrollTo("shop")}>
            Shop Now →
          </button>
        </div>
        <div className="hero-features">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Premium Quality</h3>
            <p>Curated for performance</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure Checkout</h3>
            <p>Paystack protected</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Nationwide shipping</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories" id="categories">
        <div className="section-head">
          <span>SHOP BY CATEGORY</span>
          <h2>Find Your Essential</h2>
        </div>
        <div className="category-list">
          {CATEGORIES.map(item => (
            <button
              key={item}
              className={`cat-btn ${category === item ? "active" : ""}`}
              onClick={() => { setCategory(item); scrollTo("shop"); }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products" id="shop">
        <div className="products-head">
          <div>
            <span>THE COLLECTION</span>
            <h2>Featured Products</h2>
          </div>
          <input
            className="search"
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">⌕</div>
            <h3>No products found</h3>
            <p>Try adjusting your search</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(p => (
              <div className="product-card" key={p.id}>
                <button 
                  className="product-img"
                  onClick={() => { setSelected(p); setModal("product"); }}
                >
                  {getImage(p) ? (
                    <img src={getImage(p)} alt={p.name} loading="lazy" />
                  ) : (
                    <div className="img-placeholder">S</div>
                  )}
                  {Number(p.stock || 0) <= 0 && <span className="sold-tag">SOLD OUT</span>}
                </button>
                <div className="product-body">
                  <span className="product-cat">{p.category || "SHINDARA"}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description || "Premium tech essential."}</p>
                  <div className="product-bottom">
                    <span className="price">{money(p.price)}</span>
                    <button 
                      className="add-btn"
                      disabled={Number(p.stock || 0) <= 0}
                      onClick={() => addToCart(p)}
                    >
                      {Number(p.stock || 0) <= 0 ? "Sold" : "Add"}
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
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="logo-icon">◆</span>
              <strong>SHINDARA</strong>
              <span>PHONEFLAIR</span>
            </div>
            <p className="footer-tagline">Premium tech essentials.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <button onClick={() => scrollTo("shop")}>New Arrivals</button>
            <button onClick={() => scrollTo("categories")}>Categories</button>
          </div>
          <div>
            <h4>Support</h4>
            <button>Shipping Info</button>
            <button>Returns</button>
          </div>
          <div>
            <h4>Connect</h4>
            <button>Instagram</button>
            <button>Twitter</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Shindara Phoneflair.</p>
        </div>
      </footer>

      {/* ===== MODALS ===== */}

      {/* PRODUCT PREVIEW */}
      {modal === "product" && selected && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-img">
            {getImage(selected) ? (
              <img src={getImage(selected)} alt={selected.name} />
            ) : (
              <div className="img-placeholder">S</div>
            )}
          </div>
          <div className="modal-head">
            <span>{selected.category || "PRODUCT"}</span>
            <h2>{selected.name}</h2>
            <p>{selected.description || "Premium product."}</p>
          </div>
          <div className="modal-info">
            <div><span>Price</span><strong>{money(selected.price)}</strong></div>
            <div><span>Availability</span><span>{Number(selected.stock || 0) > 0 ? `${selected.stock} available` : "Sold out"}</span></div>
          </div>
          <button 
            className="btn-primary full" 
            disabled={Number(selected.stock || 0) <= 0}
            onClick={() => { addToCart(selected); setModal(null); }}
          >
            {Number(selected.stock || 0) > 0 ? "Add to cart" : "Sold out"}
          </button>
        </Modal>
      )}

      {/* AUTH */}
      {modal === "auth" && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-head">
            <span>SHINDARA</span>
            <h2>{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
            <p>{authMode === "login" ? "Sign in to access your cart." : "Join the community."}</p>
          </div>

          {authError && <div className={`msg ${authError.includes("verification") ? "success" : "error"}`}>{authError}</div>}

          <button className="btn-google" disabled={authLoading} onClick={handleGoogle}>
            Continue with Google
          </button>

          <div className="divider">OR</div>

          <form onSubmit={handleAuth}>
            {authMode === "signup" && (
              <>
                <div className="field">
                  <label>Full name</label>
                  <input value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="08012345678" />
                </div>
              </>
            )}
            <div className="field">
              <label>Email</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <button className="btn-primary full" disabled={authLoading} type="submit">
              {authLoading ? "Please wait..." : authMode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <button className="switch" onClick={() => {
            setAuthMode(authMode === "login" ? "signup" : "login");
            setAuthError("");
          }}>
            {authMode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </Modal>
      )}

      {/* CART */}
      {modal === "cart" && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-head">
            <span>YOUR BAG</span>
            <h2>Shopping Cart</h2>
            <p>{cart.length} item{cart.length !== 1 ? "s" : ""} in your bag</p>
          </div>

          {cartLoading ? (
            <div className="empty"><p>Loading...</p></div>
          ) : cart.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🛒</div>
              <h3>Your bag is empty</h3>
              <button className="btn-primary" onClick={() => { setModal(null); scrollTo("shop"); }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cart.map(i => (
                  <div className="cart-item" key={i.id}>
                    <div className="cart-img">
                      {getImage(i.product) ? (
                        <img src={getImage(i.product)} alt={i.product?.name || ""} />
                      ) : "S"}
                    </div>
                    <div className="cart-info">
                      <h4>{i.product?.name}</h4>
                      <span className="cart-price">{money(i.product?.price)}</span>
                      <div className="cart-qty">
                        <button onClick={() => updateQty(i, -1)}>−</button>
                        <span>{i.quantity}</span>
                        <button onClick={() => updateQty(i, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-total-item">
                      <strong>{money(i.subtotal)}</strong>
                      <button className="remove-btn" onClick={() => removeFromCart(i)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total">
                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>
              <button className="btn-primary full" onClick={() => setModal("checkout")}>
                Checkout →
              </button>
            </>
          )}
        </Modal>
      )}

      {/* CHECKOUT */}
      {modal === "checkout" && (
        <Modal onClose={() => !processing && setModal(null)}>
          <div className="modal-head">
            <span>CHECKOUT</span>
            <h2>Delivery Details</h2>
            <p>Enter your information to complete your order.</p>
          </div>

          {checkoutError && (
            <div className={`msg ${checkoutError.includes("successful") ? "success" : "error"}`}>
              {checkoutError}
            </div>
          )}

          <form onSubmit={handlePayment}>
            <div className="checkout-grid">
              <div className="field">
                <label>Full name</label>
                <input value={checkout.name} onChange={(e) => setCheckout(prev => ({ ...prev, name: e.target.value }))} placeholder="Full name" required />
              </div>
              <div className="field">
                <label>Phone number</label>
                <input value={checkout.phone} onChange={(e) => setCheckout(prev => ({ ...prev, phone: e.target.value }))} placeholder="08012345678" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={checkout.email} onChange={(e) => setCheckout(prev => ({ ...prev, email: e.target.value }))} placeholder="you@example.com" required />
              </div>
              <div className="field">
                <label>State</label>
                <select value={checkout.state} onChange={(e) => {
                  setCheckout(prev => ({ ...prev, state: e.target.value, city: "" }));
                }} required>
                  <option value="">Select state</option>
                  {Object.keys(NIGERIA_LOCATIONS).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>City</label>
                <select value={checkout.city} disabled={!checkout.state} onChange={(e) => {
                  setCheckout(prev => ({ ...prev, city: e.target.value }));
                }} required>
                  <option value="">{checkout.state ? "Select city" : "Select state first"}</option>
                  {(NIGERIA_LOCATIONS[checkout.state] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Delivery address</label>
              <textarea value={checkout.address} onChange={(e) => setCheckout(prev => ({ ...prev, address: e.target.value }))} placeholder="House number, street..." rows="2" required />
            </div>

            <div className="order-summary">
              <div><span>Items</span><span>{cartCount}</span></div>
              <div><span>Total</span><strong>{money(cartTotal)}</strong></div>
            </div>

            <button className="btn-primary pay-btn" disabled={processing} type="submit">
              {processing ? "Processing..." : `Pay ${money(cartTotal)}`}
            </button>
            <p className="secure-note">🔒 Secured by Paystack</p>
          </form>
        </Modal>
      )}

      {/* ORDERS */}
      {modal === "orders" && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-head">
            <span>MY ORDERS</span>
            <h2>Your Orders</h2>
            <p>Track your purchases.</p>
          </div>

          {orders.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📦</div>
              <h3>No orders yet</h3>
            </div>
          ) : (
            <div className="order-list">
              {orders.map(o => (
                <button className="order-item" key={o.id} onClick={() => {
                  setSelectedOrder(o);
                  setModal("tracking");
                }}>
                  <div>
                    <small>{formatDate(o.created_at)}</small>
                    <h4>{o.tracking_number || `Order #${String(o.id).slice(0, 8)}`}</h4>
                    <small>{o.items?.length || 0} items • {money(o.total)}</small>
                  </div>
                  <span className={`order-status ${String(o.payment_status).toLowerCase() === "paid" ? "paid" : "pending"}`}>
                    {o.payment_status}
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
          <div className="modal-head">
            <span>TRACKING</span>
            <h2>{selectedOrder.tracking_number || "Order"}</h2>
            <p>Keep this number for delivery reference.</p>
          </div>

          <div className="tracking-grid">
            <div><span>Payment</span><strong>{String(selectedOrder.payment_status || "pending").toUpperCase()}</strong></div>
            <div><span>Status</span><strong>{String(selectedOrder.status || "pending").replace(/_/g, " ").toUpperCase()}</strong></div>
            <div><span>Reference</span><strong>{selectedOrder.payment_reference || "—"}</strong></div>
            <div><span>Date</span><strong>{formatDate(selectedOrder.created_at)}</strong></div>
          </div>

          <div className="timeline">
            {[
              ["Order Placed", "Received"],
              ["Payment Confirmed", "Confirmed"],
              ["Processing", "Preparing"],
              ["Shipped", "In transit"],
              ["Out for Delivery", "Almost there"],
              ["Delivered", "Delivered"],
            ].map(([title, desc], index) => {
              const step = getStep(selectedOrder);
              const done = index <= step;
              return (
                <div className={`tl-item ${done ? "done" : ""}`} key={title}>
                  <div className="tl-dot">{done ? "✓" : index + 1}</div>
                  <div>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-items">
            <h3>Items</h3>
            {(selectedOrder.items || []).length === 0 ? (
              <p className="muted">No items available.</p>
            ) : (
              selectedOrder.items.map((i) => (
                <div className="item-row" key={i.id || `${i.product_id}-${i.quantity}`}>
                  <div>
                    <strong>{i.product?.name || "Product"}</strong>
                    <span>Qty: {i.quantity} × {money(i.price)}</span>
                  </div>
                  <strong>{money(Number(i.price || 0) * Number(i.quantity || 0))}</strong>
                </div>
              ))
            )}
          </div>

          <div className="tracking-total">
            <span>Total</span>
            <strong>{money(selectedOrder.total)}</strong>
          </div>

          <div className="delivery-info">
            <h3>Delivery Address</h3>
            <p><strong>{selectedOrder.customer_name || "—"}</strong></p>
            <p>{selectedOrder.customer_phone || "—"}</p>
            <p>{selectedOrder.delivery_address || "—"}</p>
            <p>{selectedOrder.delivery_city || "—"}, {selectedOrder.delivery_state || "—"}</p>
          </div>
        </Modal>
      )}

      {/* SETTINGS */}
      {modal === "settings" && user && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-head">
            <span>SETTINGS</span>
            <h2>Your Profile</h2>
            <p>Manage your account information.</p>
          </div>

          <div className="field">
            <label>Email</label>
            <input value={user.email || ""} readOnly />
          </div>
          <div className="field">
            <label>Full name</label>
            <input value={profile?.full_name || ""} onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Your full name" />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input value={profile?.phone || ""} onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))} placeholder="08012345678" />
          </div>

          <button className="btn-primary full" onClick={async () => {
            if (!profile?.full_name || !profile?.phone) {
              showNotice("Please fill in all fields.");
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
              showNotice("Profile updated.");
            } catch (e) {
              showNotice("Error updating profile.");
            }
          }}>
            Save Profile
          </button>

          <div className="settings-divider">
            <div className="field">
              <label>Appearance</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          <button className="btn-secondary full" onClick={() => setModal("orders")}>
            View Orders
          </button>

          <button className="btn-logout" onClick={logout}>
            Sign Out
          </button>
        </Modal>
      )}

      {/* NOTICE */}
      {notice && <div className="notice">{notice}</div>}
    </div>
  );
}
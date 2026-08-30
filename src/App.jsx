import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient.js";
import "./shindara-redesign.css";

/* =========================================================
   SHINDARA PHONEFLAIR
   COMPLETE CUSTOMER STORE
   SUPABASE + PAYSTACK
   ========================================================= */

const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

const money = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG")}`;

const makeTrackingNumber = () =>
  `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

/* =========================================================
   NIGERIA STATES + CITIES / MAJOR LOCALITIES
   ========================================================= */

const nigeriaLocations = {
  Abia: [
    "Aba",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma",
    "Umuahia",
    "Umunneochi",
  ],

  Adamawa: [
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Hong",
    "Jada",
    "Jimeta",
    "Mayo Belwa",
    "Michika",
    "Mubi",
    "Numan",
    "Song",
    "Toungo",
    "Yola",
  ],

  "Akwa Ibom": [
    "Abak",
    "Eket",
    "Essien Udim",
    "Etinan",
    "Ikot Ekpene",
    "Ikot Abasi",
    "Ika",
    "Itu",
    "Mkpat Enin",
    "Oron",
    "Uyo",
  ],

  Anambra: [
    "Aguata",
    "Awka",
    "Awka North",
    "Awka South",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Nnewi",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],

  Bauchi: [
    "Bauchi",
    "Bogoro",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Jama'are",
    "Katagum",
    "Misau",
    "Ningi",
    "Toro",
    "Warji",
  ],

  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],

  Benue: [
    "Adikpo",
    "Gbajimba",
    "Gboko",
    "Katsina-Ala",
    "Makurdi",
    "Otukpo",
    "Vandeikya",
    "Zaki Biam",
  ],

  Borno: [
    "Bama",
    "Biu",
    "Chibok",
    "Dikwa",
    "Gubio",
    "Jere",
    "Kaga",
    "Konduga",
    "Maiduguri",
    "Monguno",
    "Ngala",
  ],

  "Cross River": [
    "Akampka",
    "Akamkpa",
    "Calabar",
    "Ikom",
    "Obubra",
    "Obudu",
    "Ogoja",
    "Ugep",
    "Yakurr",
  ],

  Delta: [
    "Asaba",
    "Bomadi",
    "Burutu",
    "Effurun",
    "Ibadan?",
    "Isoko North",
    "Isoko South",
    "Kwale",
    "Oghara",
    "Ogwashi-Uku",
    "Okpe",
    "Ozoro",
    "Sapele",
    "Ughelli",
    "Warri",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],

  Ebonyi: [
    "Abakaliki",
    "Afikpo",
    "Ezza",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaukwu",
    "Onicha",
  ],

  Edo: [
    "Auchi",
    "Benin City",
    "Ekpoma",
    "Igarra",
    "Igueben",
    "Irrua",
    "Jattu",
    "Oredo",
    "Sabongida-Ora",
    "Uromi",
  ],

  Ekiti: [
    "Ado Ekiti",
    "Aramoko",
    "Efon Alaaye",
    "Emure",
    "Ikere",
    "Ikole",
    "Ilawe",
    "Ijero",
    "Ise",
    "Omuo",
  ],

  Enugu: [
    "Awgu",
    "Enugu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Nsukka",
    "Oji River",
    "Udi",
  ],

  FCT: [
    "Abaji",
    "Abuja",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
    "Maitama",
    "Wuse",
    "Garki",
    "Asokoro",
    "Gwarinpa",
    "Jabi",
    "Lugbe",
    "Kubwa",
    "Nyanya",
  ],

  Gombe: [
    "Akko",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Yamaltu-Deba",
  ],

  Imo: [
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte Uboma",
    "Ikeduru",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Nkwerre",
    "Okigwe",
    "Orlu",
    "Owerri",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
  ],

  Jigawa: [
    "Auyo",
    "Birnin Kudu",
    "Dutse",
    "Gumel",
    "Hadejia",
    "Kafin Hausa",
    "Kazaure",
    "Ringim",
    "Sule Tankarkar",
  ],

  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Kaduna",
    "Kaduna North",
    "Kaduna South",
    "Kafanchan",
    "Kachia",
    "Kajuru",
    "Kagarko",
    "Kaura",
    "Kudan",
    "Sabon Gari",
    "Sanga",
    "Zangon Kataf",
    "Zaria",
  ],

  Kano: [
    "Bichi",
    "Dambatta",
    "Dawakin Kudu",
    "Fagge",
    "Gaya",
    "Gwale",
    "Kano",
    "Kano Municipal",
    "Kumbotso",
    "Nassarawa",
    "Rano",
    "Tarauni",
    "Ungogo",
    "Wudil",
  ],

  Katsina: [
    "Bakori",
    "Batagarawa",
    "Daura",
    "Dutsin-Ma",
    "Funtua",
    "Jibia",
    "Kafur",
    "Kankara",
    "Katsina",
    "Malumfashi",
    "Mani",
    "Rimi",
  ],

  Kebbi: [
    "Argungu",
    "Arewa",
    "Birnin Kebbi",
    "Bunza",
    "Jega",
    "Kebbe",
    "Maiyama",
    "Sakaba",
    "Surame",
    "Yauri",
    "Zuru",
  ],

  Kogi: [
    "Ankpa",
    "Dekina",
    "Idah",
    "Igalamela",
    "Kabba",
    "Kogi",
    "Lokoja",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],

  Kwara: [
    "Baruten",
    "Edu",
    "Ilorin",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Ifelodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
    "Jebba",
    "Lafiagi",
  ],

  Lagos: [
    "Agege",
    "Alimosho",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ikeja",
    "Ikorodu",
    "Lagos Island",
    "Lagos Mainland",
    "Lekki",
    "Mushin",
    "Ojo",
    "Shomolu",
    "Surulere",
    "Victoria Island",
    "Yaba",
  ],

  Nasarawa: [
    "Akwanga",
    "Doma",
    "Karu",
    "Keffi",
    "Lafia",
    "Nasarawa",
    "Nasarawa Eggon",
    "Obi",
    "Toto",
  ],

  Niger: [
    "Bida",
    "Borgu",
    "Chanchaga",
    "Kontagora",
    "Lapai",
    "Minna",
    "Mokwa",
    "Munya",
    "Paikoro",
    "Rafi",
    "Shiroro",
    "Suleja",
    "Tafa",
  ],

  Ogun: [
    "Abeokuta",
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Agbara",
    "Ijebu Ode",
    "Ijebu North",
    "Ijebu North East",
    "Ilaro",
    "Ikenne",
    "Iperu",
    "Ishara",
    "Ota",
    "Sagamu",
    "Ifo",
    "Obafemi Owode",
  ],

  Ondo: [
    "Akoko",
    "Akure",
    "Akure North",
    "Akure South",
    "Ikare",
    "Ile Oluji",
    "Ondo",
    "Okitipupa",
    "Owo",
    "Ore",
    "Idanre",
  ],

  Osun: [
    "Ede",
    "Ejigbo",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Igbajo",
    "Ijesa",
    "Ila Orangun",
    "Ilesa",
    "Iwo",
    "Osogbo",
    "Oshogbo",
  ],

  Oyo: [
    "Afijio",
    "Egbeda",
    "Ibadan",
    "Ibadan North",
    "Ibadan North East",
    "Ibadan North West",
    "Ibadan South East",
    "Ibadan South West",
    "Ibarapa",
    "Iseyin",
    "Ogbomosho",
    "Ogo Oluwa",
    "Oyo",
    "Saki",
    "Saki East",
  ],

  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Bokkos",
    "Jos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Mangu",
    "Pankshin",
    "Riyom",
    "Shendam",
    "Wase",
  ],

  Rivers: [
    "Abua",
    "Ahoada",
    "Bonny",
    "Degema",
    "Eleme",
    "Emohua",
    "Etche",
    "Ikwerre",
    "Obio-Akpor",
    "Okrika",
    "Oyigbo",
    "Port Harcourt",
    "Rivers",
  ],

  Sokoto: [
    "Binji",
    "Bodinga",
    "Goronyo",
    "Gwadabawa",
    "Illela",
    "Kware",
    "Sokoto",
    "Tambuwal",
    "Wamakko",
    "Wurno",
  ],

  Taraba: [
    "Ardo Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Lau",
    "Sardauna",
    "Takum",
    "Wukari",
    "Yorro",
  ],

  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Geidam",
    "Gujba",
    "Gulani",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
  ],

  Zamfara: [
    "Anka",
    "Bakura",
    "Bungudu",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Tsafe",
  ],
};

const categories = [
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
   HELPERS
   ========================================================= */

const getProductImage = (product) =>
  product?.image_url ||
  product?.image ||
  product?.imageUrl ||
  "";

const normalizeCategory = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .trim();

const categoryMatches = (productCategory, selectedCategory) => {
  if (selectedCategory === "All") return true;

  const p = normalizeCategory(productCategory);
  const c = normalizeCategory(selectedCategory);

  return (
    p === c ||
    p.includes(c) ||
    c.includes(p) ||
    (c === "audio" && /(airpod|earbud|headphone|speaker)/i.test(p)) ||
    (c === "phones" && /(phone|iphone|samsung|android)/i.test(p)) ||
    (c === "phone cases" && /(case|cover)/i.test(p)) ||
    (c === "smart watches" && /(watch|smartwatch)/i.test(p))
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(date);
  }
};

const getOrderStatus = (order) =>
  String(order?.status || "pending").toLowerCase();

const getPaymentStatus = (order) =>
  String(order?.payment_status || "pending").toLowerCase();

/* =========================================================
   PAYSTACK SCRIPT
   ========================================================= */

const loadPaystack = () =>
  new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://js.paystack.co/v1/inline.js"]'
    );

    if (existing) {
      const started = Date.now();

      const check = () => {
        if (window.PaystackPop) {
          resolve(true);
          return;
        }

        if (Date.now() - started > 10000) {
          reject(new Error("Paystack script timeout"));
          return;
        }

        setTimeout(check, 100);
      };

      check();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      if (window.PaystackPop) {
        resolve(true);
      } else {
        reject(new Error("Paystack loaded without PaystackPop"));
      }
    };

    script.onerror = () =>
      reject(new Error("Could not load Paystack"));

    document.head.appendChild(script);
  });

/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("shindara-theme") || "device"
  );

  const [checkout, setCheckout] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    delivery_state: "",
    delivery_city: "",
  });

  const [checkoutMessage, setCheckoutMessage] = useState("");

  /* =========================================================
     NOTICE
     ========================================================= */

  const showNotice = (message) => {
    setNotice(message);

    window.clearTimeout(window.__shindaraNoticeTimer);

    window.__shindaraNoticeTimer = window.setTimeout(() => {
      setNotice("");
    }, 3500);
  };

  /* =========================================================
     THEME
     ========================================================= */

  useEffect(() => {
    localStorage.setItem("shindara-theme", theme);

    const applyTheme = () => {
      const dark =
        theme === "dark" ||
        (theme === "device" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };

    applyTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener?.("change", applyTheme);

    return () => media.removeEventListener?.("change", applyTheme);
  }, [theme]);

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const sessionResult = await supabase.auth.getSession();
        const currentUser = sessionResult?.data?.session?.user || null;

        if (!mounted) return;

        setUser(currentUser);

        await loadProducts();

        if (currentUser) {
          await loadCustomerData(currentUser);
        }
      } catch (error) {
        console.error("Initial load:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user || null;

      setUser(nextUser);

      if (nextUser) {
        await loadCustomerData(nextUser);
      } else {
        setProfile(null);
        setCartProducts([]);
        setOrders([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     PRODUCTS
     ========================================================= */

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products:", error);
      return;
    }

    setProducts(data || []);
  };

  /* =========================================================
     CUSTOMER DATA
     ========================================================= */

  const loadCustomerData = async (currentUser) => {
    if (!currentUser) return;

    await Promise.all([
      loadProfile(currentUser),
      loadCart(currentUser),
      loadOrders(currentUser),
    ]);
  };

  /* =========================================================
     PROFILE
     ========================================================= */

  const loadProfile = async (currentUser) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Profile:", error);
      return;
    }

    const metadata = currentUser.user_metadata || {};

    const nextProfile = data || {
      id: currentUser.id,
      email: currentUser.email || "",
      full_name: metadata.full_name || "",
      phone: metadata.phone || "",
    };

    setProfile(nextProfile);
    setEditName(nextProfile.full_name || "");
    setEditPhone(nextProfile.phone || "");

    setCheckout((prev) => ({
      ...prev,
      customer_name:
        prev.customer_name ||
        nextProfile.full_name ||
        metadata.full_name ||
        "",
      customer_phone:
        prev.customer_phone ||
        nextProfile.phone ||
        metadata.phone ||
        "",
      customer_email:
        prev.customer_email ||
        currentUser.email ||
        "",
    }));
  };

  const saveProfile = async () => {
    if (!user) return;

    if (!editName.trim() || !editPhone.trim()) {
      showNotice("Please enter your name and phone number.");
      return;
    }

    setSavingProfile(true);

    try {
      const payload = {
        id: user.id,
        email: user.email || "",
        full_name: editName.trim(),
        phone: editPhone.trim(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        console.error(error);
        showNotice("Could not save profile.");
        return;
      }

      await supabase.auth.updateUser({
        data: {
          full_name: editName.trim(),
          phone: editPhone.trim(),
        },
      });

      setProfile((prev) => ({
        ...(prev || {}),
        ...payload,
      }));

      setCheckout((prev) => ({
        ...prev,
        customer_name: editName.trim(),
        customer_phone: editPhone.trim(),
      }));

      showNotice("Profile updated successfully.");
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================================================
     CART
     ========================================================= */

  const loadCart = async (currentUser) => {
    if (!currentUser) return;

    setCartLoading(true);

    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          products:product_id (
            id,
            name,
            price,
            image_url,
            description,
            category,
            stock
          )
        `)
        .eq("user_id", currentUser.id)
        .order("id", { ascending: true });

      if (error) {
        console.error("Cart:", error);
        setCartProducts([]);
        return;
      }

      const formatted = (data || [])
        .filter((item) => item.products)
        .map((item) => ({
          ...item,
          product: item.products,
          subtotal:
            Number(item.products.price || 0) *
            Number(item.quantity || 0),
        }));

      setCartProducts(formatted);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      setAccountOpen(true);
      setAuthMode("login");
      setAuthMessage("Please sign in before adding items to your cart.");
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      showNotice("This product is out of stock.");
      return;
    }

    const existing = cartProducts.find(
      (item) => item.product_id === product.id
    );

    if (existing) {
      const nextQuantity = Number(existing.quantity) + 1;

      if (nextQuantity > Number(product.stock)) {
        showNotice("You cannot exceed available stock.");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: nextQuantity })
        .eq("id", existing.id)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        showNotice("Unable to update cart.");
        return;
      }
    } else {
      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: product.id,
        quantity: 1,
      });

      if (error) {
        console.error(error);
        showNotice("Unable to add product to cart.");
        return;
      }
    }

    await loadCart(user);

    /*
     * IMPORTANT:
     * Adding an item NEVER automatically opens the cart.
     */
    showNotice(`${product.name} added to cart.`);
  };

  const updateQuantity = async (item, change) => {
    if (!user) return;

    const nextQuantity = Number(item.quantity) + change;

    if (nextQuantity <= 0) {
      await removeFromCart(item);
      return;
    }

    if (
      item.product &&
      Number(item.product.stock || 0) < nextQuantity
    ) {
      showNotice("You cannot exceed available stock.");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) {
      showNotice("Unable to update quantity.");
      return;
    }

    await loadCart(user);
  };

  const removeFromCart = async (item) => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) {
      showNotice("Unable to remove item.");
      return;
    }

    await loadCart(user);
    showNotice("Item removed from cart.");
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Clear cart:", error);
      return false;
    }

    setCartProducts([]);
    return true;
  };

  const cartTotal = useMemo(
    () =>
      cartProducts.reduce(
        (sum, item) => sum + Number(item.subtotal || 0),
        0
      ),
    [cartProducts]
  );

  const cartCount = useMemo(
    () =>
      cartProducts.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ),
    [cartProducts]
  );

  /* =========================================================
     ORDERS
     ========================================================= */

  const loadOrders = async (currentUser) => {
    if (!currentUser) return;

    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders:", error);
      setOrders([]);
      return;
    }

    const completeOrders = await Promise.all(
      (orderData || []).map(async (order) => {
        const { data: items, error: itemError } = await supabase
          .from("order_items")
          .select(`
            id,
            order_id,
            product_id,
            quantity,
            price,
            products:product_id (
              id,
              name,
              image_url,
              category,
              description
            )
          `)
          .eq("order_id", order.id);

        if (itemError) {
          console.error("Order items:", itemError);
        }

        return {
          ...order,
          items: (items || []).map((item) => ({
            ...item,
            product: item.products,
          })),
        };
      })
    );

    setOrders(completeOrders);
  };

  /* =========================================================
     AUTH
     ========================================================= */

  const resetAuthForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setAuthMessage("");
  };

  const submitAuth = async (event) => {
    event.preventDefault();

    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (!email.trim() || !password) {
        setAuthMessage("Please enter your email and password.");
        return;
      }

      if (password.length < 6) {
        setAuthMessage("Password must be at least 6 characters.");
        return;
      }

      if (authMode === "signup") {
        if (!fullName.trim() || !phone.trim()) {
          setAuthMessage(
            "Please enter your full name and phone number."
          );
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (error) {
          setAuthMessage(error.message);
          return;
        }

        if (data?.user) {
          await supabase.from("profiles").upsert(
            {
              id: data.user.id,
              email: data.user.email || email.trim().toLowerCase(),
              full_name: fullName.trim(),
              phone: phone.trim(),
            },
            { onConflict: "id" }
          );
        }

        setAuthMessage(
          data?.session
            ? "Account created successfully."
            : "Account created. Check your email if verification is required."
        );

        if (data?.session) {
          setAccountOpen(false);
          resetAuthForm();
        }
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

        if (error) {
          setAuthMessage(error.message);
          return;
        }

        if (data?.user) {
          await loadCustomerData(data.user);
        }

        setAccountOpen(false);
        resetAuthForm();
        showNotice("Welcome back to Shindara.");
      }
    } catch (error) {
      console.error(error);
      setAuthMessage(
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const googleLogin = async () => {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setAuthMessage(error.message);
      }
    } catch (error) {
      console.error(error);
      setAuthMessage("Google sign-in could not be started.");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setCartProducts([]);
    setOrders([]);

    setAccountOpen(false);
    setCartOpen(false);
    setCheckoutOpen(false);
    setOrdersOpen(false);
    setTrackingOpen(false);
    setSettingsOpen(false);

    showNotice("You have been signed out.");
  };

  /* =========================================================
     CHECKOUT
     ========================================================= */

  const openCheckout = () => {
    if (!user) {
      setCartOpen(false);
      setAccountOpen(true);
      setAuthMode("login");
      setAuthMessage("Please sign in before checkout.");
      return;
    }

    if (!cartProducts.length) {
      showNotice("Your cart is empty.");
      return;
    }

    const metadata = user.user_metadata || {};

    setCheckoutMessage("");

    setCheckout((prev) => ({
      ...prev,
      customer_name:
        prev.customer_name ||
        profile?.full_name ||
        metadata.full_name ||
        "",
      customer_phone:
        prev.customer_phone ||
        profile?.phone ||
        metadata.phone ||
        "",
      customer_email:
        prev.customer_email ||
        user.email ||
        "",
    }));

    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const updateCheckout = (field, value) => {
    setCheckout((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "delivery_state"
        ? { delivery_city: "" }
        : {}),
    }));
  };

  /* =========================================================
     PAYMENT
     ========================================================= */

  const startPaystackPayment = async (event) => {
    event.preventDefault();

    if (placingOrder) return;

    if (!user) {
      setCheckoutMessage("Please sign in again.");
      return;
    }

    if (!cartProducts.length) {
      setCheckoutMessage("Your cart is empty.");
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
        setCheckoutMessage(`Please enter your ${label}.`);
        return;
      }
    }

    for (const item of cartProducts) {
      if (
        !item.product ||
        Number(item.product.stock || 0) <
          Number(item.quantity || 0)
      ) {
        setCheckoutMessage(
          `${item.product?.name || "This product"} no longer has enough stock.`
        );
        await loadCart(user);
        return;
      }
    }

    if (cartTotal <= 0) {
      setCheckoutMessage("Your cart total is invalid.");
      return;
    }

    setPlacingOrder(true);
    setCheckoutMessage("");

    try {
      /*
       * Load Paystack first.
       * This fixes the "Payment could not be started" problem
       * caused by the Paystack script not being available.
       */
      await loadPaystack();

      if (!window.PaystackPop) {
        throw new Error("Paystack is unavailable.");
      }

      /*
       * Unique reference.
       */
      const reference = `SHP-${user.id.slice(
        0,
        8
      )}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`;

      /*
       * Do not create the order here.
       *
       * The order is created ONLY after Paystack callback.
       * This prevents unpaid orders from being treated as paid.
       */

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: checkout.customer_email.trim(),
        amount: Math.round(Number(cartTotal) * 100),
        currency: "NGN",
        ref: reference,

        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: checkout.customer_name.trim(),
            },
            {
              display_name: "Customer Phone",
              variable_name: "customer_phone",
              value: checkout.customer_phone.trim(),
            },
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user.id,
            },
          ],
        },

        callback: async (response) => {
          await completeSuccessfulPayment(response);
        },

        onClose: () => {
          setPlacingOrder(false);
          setCheckoutMessage(
            "Payment window closed. Your cart is still saved."
          );
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Paystack:", error);

      setCheckoutMessage(
        "Payment could not be started. Please refresh the page and try again."
      );

      setPlacingOrder(false);
    }
  };

  /* =========================================================
     PAYMENT SUCCESS
     ========================================================= */

  const completeSuccessfulPayment = async (paymentResponse) => {
    if (!user) {
      setPlacingOrder(false);
      return;
    }

    const paymentReference =
      paymentResponse?.reference ||
      paymentResponse?.trxref ||
      "";

    if (!paymentReference) {
      setCheckoutMessage(
        "Payment reference was not received. Please contact support."
      );
      setPlacingOrder(false);
      return;
    }

    try {
      /*
       * DUPLICATE PROTECTION
       */
      const { data: existingOrder, error: duplicateError } =
        await supabase
          .from("orders")
          .select("*")
          .eq("payment_reference", paymentReference)
          .maybeSingle();

      if (duplicateError) {
        console.error("Duplicate check:", duplicateError);
      }

      if (existingOrder) {
        await loadOrders(user);

        const refreshed = await getOrderById(existingOrder.id);

        /*
         * IMPORTANT:
         * Cart is cleared only after payment/order has already
         * been recorded.
         */
        await clearCart();

        setCheckoutOpen(false);
        setCartOpen(false);
        setPlacingOrder(false);

        setSelectedOrder(refreshed || existingOrder);
        setTrackingOpen(true);

        showNotice("Payment already recorded. Order confirmed.");
        return;
      }

      /*
       * Create tracking number.
       */
      const trackingNumber = makeTrackingNumber();

      /*
       * SAVE PAID ORDER
       */
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
        payment_reference: paymentReference,
        status: "processing",
        tracking_number: trackingNumber,
      };

      let { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();

      /*
       * Compatibility fallback if tracking_number column does
       * not yet exist.
       */
      if (
        orderError &&
        /tracking_number|column/i.test(
          String(orderError.message || "")
        )
      ) {
        const fallbackPayload = {
          user_id: user.id,
          customer_name: checkout.customer_name.trim(),
          customer_phone: checkout.customer_phone.trim(),
          customer_email: checkout.customer_email.trim(),
          delivery_address: checkout.delivery_address.trim(),
          delivery_state: checkout.delivery_state,
          delivery_city: checkout.delivery_city,
          total: Number(cartTotal),
          payment_status: "paid",
          payment_reference: paymentReference,
          status: "processing",
        };

        const fallbackResult = await supabase
          .from("orders")
          .insert(fallbackPayload)
          .select()
          .single();

        order = fallbackResult.data;
        orderError = fallbackResult.error;
      }

      if (orderError || !order) {
        console.error("Order save:", orderError);

        setCheckoutMessage(
          `Payment was received but your order could not be saved automatically. Keep this payment reference: ${paymentReference}`
        );

        setPlacingOrder(false);
        return;
      }

      /*
       * SAVE ORDER ITEMS
       */
      const orderItems = cartProducts.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        price: Number(item.product?.price || 0),
      }));

      const { error: itemError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemError) {
        console.error("Order items:", itemError);
      }

      /*
       * OPTIONAL STOCK UPDATE.
       *
       * This tries to decrease stock but does not prevent the
       * order from being saved if the current Supabase policies
       * do not allow customer stock updates.
       */
      for (const item of cartProducts) {
        try {
          const currentStock = Number(item.product?.stock || 0);
          const quantity = Number(item.quantity || 0);

          if (currentStock >= quantity) {
            await supabase
              .from("products")
              .update({
                stock: currentStock - quantity,
              })
              .eq("id", item.product_id);
          }
        } catch (stockError) {
          console.warn("Stock update skipped:", stockError);
        }
      }

      /*
       * CRITICAL:
       * Only clear customer's persistent cart AFTER the paid
       * order and order items have been saved.
       */
      await clearCart();

      /*
       * Refresh everything.
       */
      await loadOrders(user);
      await loadProducts();

      const refreshedOrder = await getOrderById(order.id);

      const localOrder = {
        ...order,
        tracking_number:
          order.tracking_number || trackingNumber,
        items:
          refreshedOrder?.items ||
          cartProducts.map((item) => ({
            product_id: item.product_id,
            quantity: Number(item.quantity),
            price: Number(item.product?.price || 0),
            product: item.product,
          })),
      };

      setOrders((prev) => {
        const withoutDuplicate = prev.filter(
          (existing) => existing.id !== localOrder.id
        );

        return [localOrder, ...withoutDuplicate];
      });

      setSelectedOrder(localOrder);

      setCheckoutOpen(false);
      setCartOpen(false);
      setPlacingOrder(false);
      setTrackingOpen(true);

      showNotice("Payment successful! Your order is confirmed.");
    } catch (error) {
      console.error("Complete payment:", error);

      setCheckoutMessage(
        `Payment was received. Keep your payment reference: ${paymentReference}`
      );

      setPlacingOrder(false);
    }
  };

  const getOrderById = async (orderId) => {
    if (!orderId) return null;

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order) return null;

    const { data: items } = await supabase
      .from("order_items")
      .select(`
        id,
        order_id,
        product_id,
        quantity,
        price,
        products:product_id (
          id,
          name,
          image_url,
          category,
          description
        )
      `)
      .eq("order_id", order.id);

    return {
      ...order,
      items: (items || []).map((item) => ({
        ...item,
        product: item.products,
      })),
    };
  };

  /* =========================================================
     FILTER PRODUCTS
     ========================================================= */

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = categoryMatches(
        product.category,
        category
      );

      const searchable = [
        product.name,
        product.description,
        product.category,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return matchesCategory && (!q || searchable.includes(q));
    });
  }, [products, category, search]);

  /* =========================================================
     TRACKING
     ========================================================= */

  const getTrackingStep = (order) => {
    const payment = getPaymentStatus(order);
    const status = getOrderStatus(order);

    if (payment !== "paid") return 0;

    if (
      status === "pending" ||
      status === "paid" ||
      status === "confirmed"
    ) {
      return 1;
    }

    if (status === "processing") return 2;
    if (status === "shipped") return 3;
    if (status === "in_transit") return 4;
    if (status === "out_for_delivery") return 5;
    if (status === "delivered") return 6;

    return 2;
  };

  const trackingSteps = [
    [
      "Order placed",
      "Your order has been received.",
    ],
    [
      "Payment confirmed",
      "Your payment has been successfully confirmed.",
    ],
    [
      "Processing",
      "Your items are being prepared.",
    ],
    [
      "Shipped",
      "Your order has left our store.",
    ],
    [
      "In transit",
      "Your package is on its way.",
    ],
    [
      "Out for delivery",
      "Your package is with the delivery team.",
    ],
    [
      "Delivered",
      "Your order has been delivered.",
    ],
  ];

  const openOrderTracking = async (order) => {
    setSelectedOrder(order);
    setOrdersOpen(false);
    setTrackingOpen(true);

    const fresh = await getOrderById(order.id);

    if (fresh) {
      setSelectedOrder(fresh);
    }
  };

  const openProductPreview = (product) => {
    setSelectedProduct(product);
    setProductOpen(true);
  };

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">S</div>
        <strong>SHINDARA PHONEFLAIR</strong>
        <span>Loading store...</span>
      </div>
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="app-shell">
      {/* =====================================================
          FLOWING ANNOUNCEMENT
          ===================================================== */}

      <div className="announcement">
        <div className="announcement-track">
          <span>
            SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS •
            QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE
            DELIVERY •
          </span>

          <span aria-hidden="true">
            SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS •
            QUALITY ACCESSORIES • SECURE CHECKOUT • NATIONWIDE
            DELIVERY •
          </span>
        </div>
      </div>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="header">
        <button
          className="logo-button"
          onClick={() => scrollTo("top")}
          aria-label="Shindara home"
        >
          <b>SHINDARA</b>
          <span
            style={{
              display: "block",
              color: "#6d28d9",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            PHONEFLAIR
          </span>
        </button>

        <nav className="desktop-nav">
          <button onClick={() => scrollTo("categories")}>
            Categories
          </button>

          <button onClick={() => scrollTo("shop")}>
            Shop
          </button>

          {user && (
            <button onClick={() => setOrdersOpen(true)}>
              Orders
            </button>
          )}
        </nav>

        <div className="header-actions">
          <button
            className="account-button"
            onClick={() => {
              if (user) {
                setSettingsOpen(true);
              } else {
                setAuthMode("login");
                setAuthMessage("");
                setAccountOpen(true);
              }
            }}
          >
            {user ? "Profile" : "Sign in"}
          </button>

          <button
            className="cart-button"
            onClick={() => {
              if (!user) {
                setAccountOpen(true);
                setAuthMode("login");
                setAuthMessage(
                  "Please sign in to access your saved cart."
                );
              } else {
                setCartOpen(true);
              }
            }}
          >
            🛒 {cartCount}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              SHINDARA PHONEFLAIR
            </div>

            <h1>
              Tech essentials.
              <br />
              <em>Done better.</em>
            </h1>

            <p>
              Premium phones, accessories and everyday technology
              selected for people who want quality without the
              unnecessary noise.
            </p>

            <button
              className="primary-button"
              onClick={() => scrollTo("shop")}
            >
              Shop now →
            </button>
          </div>

          <div className="hero-card">
            <span>THE SHINDARA EDIT</span>

            <strong>Better accessories.</strong>
            <strong>Better everyday.</strong>

            <div className="hero-line" />

            <p>
              Discover phone essentials, power, audio and
              accessories built around your everyday life.
            </p>
          </div>
        </section>

        {/* ===================================================
            CATEGORIES
            =================================================== */}

        <section
          className="categories-section"
          id="categories"
        >
          <div className="section-heading">
            <small>SHOP BY CATEGORY</small>
            <h2>Find your essentials.</h2>
          </div>

          <div className="category-scroll">
            {categories.map((item) => (
              <button
                key={item}
                className={`category ${
                  category === item ? "active" : ""
                }`}
                onClick={() => {
                  setCategory(item);
                  scrollTo("shop");
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* ===================================================
            SHOP
            =================================================== */}

        <section className="shop-section" id="shop">
          <div className="shop-top">
            <div>
              <small>THE COLLECTION</small>
              <h2>Shop Shindara.</h2>
            </div>

            <input
              className="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products..."
              type="search"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-products">
              <div style={{ fontSize: 40 }}>⌕</div>
              <h3>No products found</h3>
              <p>
                Try another search or choose a different category.
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const image = getProductImage(product);
                const stock = Number(product.stock || 0);

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openProductPreview(product)
                      }
                      style={{
                        width: "100%",
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      aria-label={`View ${product.name}`}
                    >
                      <div className="product-image">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name || "Product"}
                            loading="lazy"
                          />
                        ) : (
                          <div className="image-placeholder">
                            S
                          </div>
                        )}

                        {stock <= 0 && (
                          <div className="sold-out">
                            SOLD OUT
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="product-info">
                      <small>
                        {product.category || "SHINDARA"}
                      </small>

                      <h3>{product.name}</h3>

                      <p>
                        {product.description ||
                          "Premium everyday tech essential."}
                      </p>

                      <div className="product-bottom">
                        <strong>
                          {money(product.price)}
                        </strong>

                        <button
                          disabled={stock <= 0}
                          onClick={() => addToCart(product)}
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
      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="footer">
        <b>SHINDARA</b>
        <span>PHONEFLAIR</span>

        <p>
          Premium phone accessories and everyday technology.
        </p>

        <small>
          © {new Date().getFullYear()} Shindara Phoneflair.
          All rights reserved.
        </small>
      </footer>

      {/* =====================================================
          PRODUCT PREVIEW
          ===================================================== */}

      {productOpen && selectedProduct && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProductOpen(false);
            }
          }}
        >
          <div className="modal product-preview-modal">
            <button
              className="close"
              onClick={() => setProductOpen(false)}
            >
              ×
            </button>

            <div className="product-preview-image">
              {getProductImage(selectedProduct) ? (
                <img
                  src={getProductImage(selectedProduct)}
                  alt={selectedProduct.name}
                />
              ) : (
                <div className="image-placeholder">S</div>
              )}
            </div>

            <div className="modal-heading">
              <small>
                {selectedProduct.category || "PRODUCT"}
              </small>

              <h2>{selectedProduct.name}</h2>

              <p>
                {selectedProduct.description ||
                  "Premium Shindara Phoneflair product."}
              </p>
            </div>

            <div className="checkout-summary">
              <span>Price</span>
              <strong>
                {money(selectedProduct.price)}
              </strong>

              <span>Availability</span>
              <span>
                {Number(selectedProduct.stock || 0) > 0
                  ? `${selectedProduct.stock} available`
                  : "Sold out"}
              </span>
            </div>

            <button
              className="primary-button full"
              disabled={
                Number(selectedProduct.stock || 0) <= 0
              }
              onClick={() => {
                addToCart(selectedProduct);
                setProductOpen(false);
              }}
            >
              {Number(selectedProduct.stock || 0) > 0
                ? "Add to cart"
                : "Sold out"}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          AUTH
          ===================================================== */}

      {accountOpen && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAccountOpen(false);
            }
          }}
        >
          <div className="modal">
            <button
              className="close"
              onClick={() => setAccountOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>SHINDARA ACCOUNT</small>

              <h2>
                {authMode === "login"
                  ? "Welcome back."
                  : "Create your account."}
              </h2>

              <p>
                Save your cart, manage your profile and track
                every order from one place.
              </p>
            </div>

            {authMessage && (
              <div className="form-message">
                {authMessage}
              </div>
            )}

            <button
              className="google-button"
              disabled={authLoading}
              onClick={googleLogin}
            >
              Continue with Google
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "16px 0",
                color: "#999",
                fontSize: 10,
              }}
            >
              <span
                style={{
                  height: 1,
                  flex: 1,
                  background: "#eee",
                }}
              />
              OR CONTINUE WITH EMAIL
              <span
                style={{
                  height: 1,
                  flex: 1,
                  background: "#eee",
                }}
              />
            </div>

            <form onSubmit={submitAuth}>
              {authMode === "signup" && (
                <>
                  <label>
                    Full name
                    <input
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </label>

                  <label>
                    Phone number
                    <input
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
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
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 6 characters"
                  autoComplete={
                    authMode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                />
              </label>

              <button
                className="primary-button full"
                disabled={authLoading}
                type="submit"
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            <button
              className="switch-auth"
              onClick={() => {
                setAuthMode(
                  authMode === "login" ? "signup" : "login"
                );
                setAuthMessage("");
              }}
            >
              {authMode === "login"
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          CART
          ===================================================== */}

      {cartOpen && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCartOpen(false);
            }
          }}
        >
          <div className="modal cart-modal">
            <button
              className="close"
              onClick={() => setCartOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>YOUR BAG</small>
              <h2>Your cart.</h2>
              <p>
                Your cart is saved to your account, so you can
                leave and come back without losing your items.
              </p>
            </div>

            {cartLoading ? (
              <div className="empty-cart">
                <p>Loading your cart...</p>
              </div>
            ) : cartProducts.length === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>
                <h3>Your cart is empty</h3>
                <p>
                  Add something you love and it will stay here
                  until you remove it or complete your order.
                </p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    scrollTo("shop");
                  }}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartProducts.map((item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >
                      <div className="cart-item-image">
                        {getProductImage(item.product) ? (
                          <img
                            src={getProductImage(item.product)}
                            alt={item.product?.name || ""}
                          />
                        ) : (
                          "S"
                        )}
                      </div>

                      <div className="cart-item-details">
                        <b>{item.product?.name}</b>

                        <span>
                          {money(item.product?.price)}
                        </span>

                        <div className="quantity">
                          <button
                            onClick={() =>
                              updateQuantity(item, -1)
                            }
                          >
                            −
                          </button>

                          <strong>{item.quantity}</strong>

                          <button
                            onClick={() =>
                              updateQuantity(item, 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-right">
                        <b>{money(item.subtotal)}</b>

                        <button
                          className="remove"
                          onClick={() =>
                            removeFromCart(item)
                          }
                        >
                          REMOVE
                        </button>
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
                  onClick={openCheckout}
                >
                  Proceed to checkout →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          CHECKOUT
          ===================================================== */}

      {checkoutOpen && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !placingOrder
            ) {
              setCheckoutOpen(false);
            }
          }}
        >
          <div className="modal checkout-modal">
            <button
              className="close"
              disabled={placingOrder}
              onClick={() => setCheckoutOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>SECURE CHECKOUT</small>
              <h2>Almost there.</h2>
              <p>
                Enter your delivery details, then continue to
                secure payment with Paystack.
              </p>
            </div>

            {checkoutMessage && (
              <div className="form-message">
                {checkoutMessage}
              </div>
            )}

            <form onSubmit={startPaystackPayment}>
              <div className="checkout-grid">
                <label>
                  Full name
                  <input
                    value={checkout.customer_name}
                    onChange={(event) =>
                      updateCheckout(
                        "customer_name",
                        event.target.value
                      )
                    }
                    placeholder="Full name"
                    autoComplete="name"
                  />
                </label>

                <label>
                  Phone number
                  <input
                    value={checkout.customer_phone}
                    onChange={(event) =>
                      updateCheckout(
                        "customer_phone",
                        event.target.value
                      )
                    }
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
                    onChange={(event) =>
                      updateCheckout(
                        "customer_email",
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>

                <label>
                  State
                  <select
                    value={checkout.delivery_state}
                    onChange={(event) =>
                      updateCheckout(
                        "delivery_state",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select your state
                    </option>

                    {Object.keys(nigeriaLocations).map(
                      (state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  City / locality
                  <select
                    value={checkout.delivery_city}
                    disabled={!checkout.delivery_state}
                    onChange={(event) =>
                      updateCheckout(
                        "delivery_city",
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      {checkout.delivery_state
                        ? "Select city"
                        : "Select state first"}
                    </option>

                    {(nigeriaLocations[
                      checkout.delivery_state
                    ] || []).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Delivery address
                <textarea
                  value={checkout.delivery_address}
                  onChange={(event) =>
                    updateCheckout(
                      "delivery_address",
                      event.target.value
                    )
                  }
                  placeholder="House number, street, estate, landmark..."
                />
              </label>

              <div className="checkout-summary">
                <span>Items</span>
                <span>{cartCount}</span>

                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>

              <button
                className="primary-button pay-button"
                disabled={placingOrder}
                type="submit"
              >
                {placingOrder
                  ? "Opening secure payment..."
                  : `Pay ${money(cartTotal)} with Paystack`}
              </button>

              <span className="secure-note">
                🔒 Secure payment powered by Paystack
              </span>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ORDERS
          ===================================================== */}

      {ordersOpen && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOrdersOpen(false);
            }
          }}
        >
          <div className="modal">
            <button
              className="close"
              onClick={() => setOrdersOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>MY ORDERS</small>
              <h2>Your orders.</h2>
              <p>
                View your purchases and track delivery progress.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="empty-cart">
                <div>📦</div>
                <h3>No orders yet</h3>
                <p>
                  Your completed purchases will appear here.
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const payment = getPaymentStatus(order);
                  const status = getOrderStatus(order);

                  return (
                    <button
                      className="order-card"
                      key={order.id}
                      onClick={() =>
                        openOrderTracking(order)
                      }
                    >
                      <div>
                        <small>
                          {formatDate(order.created_at)}
                        </small>

                        <b>
                          {order.tracking_number ||
                            `Order #${String(
                              order.id
                            ).slice(0, 8)}`}
                        </b>

                        <small>
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) === 1
                            ? ""
                            : "s"}{" "}
                          • {money(order.total)}
                        </small>
                      </div>

                      <span
                        className={`status ${
                          payment === "paid"
                            ? "paid"
                            : "pending"
                        }`}
                      >
                        {payment}
                      </span>

                      <span className="order-arrow">
                        →
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          TRACKING
          ===================================================== */}

      {trackingOpen && selectedOrder && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setTrackingOpen(false);
            }
          }}
        >
          <div className="modal tracking-modal">
            <button
              className="close"
              onClick={() => setTrackingOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>ORDER TRACKING</small>

              <h2>
                {selectedOrder.tracking_number ||
                  "Order tracking"}
              </h2>

              <p>
                Keep this tracking number for your delivery.
              </p>
            </div>

            <div className="tracking-status-box">
              <div>
                <span>Payment</span>
                <strong>
                  {String(
                    selectedOrder.payment_status ||
                      "pending"
                  ).toUpperCase()}
                </strong>
              </div>

              <div>
                <span>Order status</span>
                <strong>
                  {String(
                    selectedOrder.status || "pending"
                  )
                    .replace(/_/g, " ")
                    .toUpperCase()}
                </strong>
              </div>

              <div>
                <span>Payment reference</span>
                <strong>
                  {selectedOrder.payment_reference || "—"}
                </strong>
              </div>

              <div>
                <span>Order date</span>
                <strong>
                  {formatDate(selectedOrder.created_at)}
                </strong>
              </div>
            </div>

            <div className="timeline">
              {trackingSteps.map(([title, description], index) => {
                const currentStep =
                  getTrackingStep(selectedOrder);

                const completed = index <= currentStep;

                return (
                  <div
                    className={`timeline-item ${
                      completed ? "completed" : ""
                    }`}
                    key={title}
                  >
                    <div className="timeline-dot">
                      {completed ? "✓" : index + 1}
                    </div>

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
                <p
                  style={{
                    color: "#888",
                    fontSize: 11,
                  }}
                >
                  Order item details are not available yet.
                </p>
              ) : (
                selectedOrder.items.map((item) => (
                  <div
                    className="detail-item"
                    key={item.id || `${item.product_id}-${item.quantity}`}
                  >
                    <div>
                      <b>
                        {item.product?.name ||
                          "Product"}
                      </b>

                      <span>
                        Qty: {item.quantity} ×{" "}
                        {money(item.price)}
                      </span>
                    </div>

                    <strong>
                      {money(
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                      )}
                    </strong>
                  </div>
                ))
              )}
            </div>

            <div className="tracking-total">
              <span>Total</span>
              <strong>
                {money(selectedOrder.total)}
              </strong>
            </div>

            <div className="delivery-box">
              <h3>Delivery address</h3>

              <p>
                <b>
                  {selectedOrder.customer_name || "—"}
                </b>
              </p>

              <p>
                {selectedOrder.customer_phone || "—"}
              </p>

              <p>
                {selectedOrder.delivery_address || "—"}
              </p>

              <p>
                {selectedOrder.delivery_city || "—"},{" "}
                {selectedOrder.delivery_state || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PROFILE SETTINGS
          ===================================================== */}

      {settingsOpen && user && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSettingsOpen(false);
            }
          }}
        >
          <div className="modal">
            <button
              className="close"
              onClick={() => setSettingsOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>ACCOUNT SETTINGS</small>
              <h2>Your profile.</h2>
              <p>
                Manage your customer information and display
                preferences.
              </p>
            </div>

            <label>
              Email
              <input
                value={user.email || ""}
                readOnly
              />
            </label>

            <label>
              Full name
              <input
                value={editName}
                onChange={(event) =>
                  setEditName(event.target.value)
                }
                placeholder="Your full name"
              />
            </label>

            <label>
              Phone number
              <input
                value={editPhone}
                onChange={(event) =>
                  setEditPhone(event.target.value)
                }
                placeholder="08012345678"
                inputMode="tel"
              />
            </label>

            <button
              className="primary-button full"
              disabled={savingProfile}
              onClick={saveProfile}
            >
              {savingProfile
                ? "Saving..."
                : "Save profile"}
            </button>

            <div
              style={{
                marginTop: 25,
                borderTop: "1px solid #eee9f1",
                paddingTop: 20,
              }}
            >
              <label>
                Appearance
                <select
                  value={theme}
                  onChange={(event) =>
                    setTheme(event.target.value)
                  }
                >
                  <option value="device">
                    Use device setting
                  </option>
                  <option value="light">
                    Light mode
                  </option>
                  <option value="dark">
                    Dark mode
                  </option>
                </select>
              </label>
            </div>

            <button
              className="secondary-button full"
              onClick={() => {
                setSettingsOpen(false);
                setOrdersOpen(true);
              }}
            >
              View my orders
            </button>

            <button
              className="logout-button"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          NOTICE
          ===================================================== */}

      {notice && <div className="notice">{notice}</div>}
    </div>
  );
}
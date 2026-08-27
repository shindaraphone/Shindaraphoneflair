import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient.js";
import "./shindara-redesign.css";

/* =========================================================
   SHINDARA PHONEFLAIR
   PAYSTACK + SUPABASE
   ========================================================= */

const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

const money = n =>
  `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
  })}`;

/* =========================================================
   NIGERIA STATES + CITIES
   ========================================================= */

const states = {
  Abia: [
    "Aba",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa",
    "Ohafia",
    "Osisioma",
    "Umuahia",
    "Umu Nneochi",
  ],

  Adamawa: [
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Hong",
    "Jimeta",
    "Mubi",
    "Numan",
    "Song",
    "Yola",
  ],

  Akwa_Ibom: [
    "Abak",
    "Eket",
    "Etinan",
    "Ikot Ekpene",
    "Ikot Abasi",
    "Ibeno",
    "Itu",
    "Oron",
    "Uyo",
  ],

  Anambra: [
    "Awka",
    "Ihiala",
    "Nnewi",
    "Nkpor",
    "Onitsha",
    "Otuocha",
    "Ogidi",
    "Ekwulobia",
  ],

  Bauchi: [
    "Azare",
    "Bauchi",
    "Dass",
    "Gamawa",
    "Jama'are",
    "Katagum",
    "Misau",
    "Ningi",
    "Toro",
  ],

  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Nembe",
    "Ogbia",
    "Sagbama",
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
  ],

  Borno: [
    "Bama",
    "Biu",
    "Dikwa",
    "Gamboru",
    "Jere",
    "Maiduguri",
    "Monguno",
  ],

  Cross_River: [
    "Akamkpa",
    "Calabar",
    "Ikom",
    "Obudu",
    "Ogoja",
    "Ugep",
  ],

  Delta: [
    "Asaba",
    "Agbor",
    "Effurun",
    "Ozoro",
    "Sapele",
    "Ughelli",
    "Warri",
  ],

  Ebonyi: [
    "Abakaliki",
    "Afikpo",
    "Ezza",
    "Ikwo",
    "Ishieke",
    "Onueke",
  ],

  Edo: [
    "Auchi",
    "Benin City",
    "Ekpoma",
    "Igarra",
    "Irrua",
    "Sabongida-Ora",
  ],

  Ekiti: [
    "Ado-Ekiti",
    "Aramoko",
    "Emure",
    "Ikere",
    "Ikole",
    "Ijero",
    "Ilawe",
    "Oye",
  ],

  Enugu: [
    "Agbani",
    "Enugu",
    "Nsukka",
    "Oji River",
    "Udi",
    "9th Mile",
  ],

  Gombe: [
    "Akko",
    "Billiri",
    "Deba",
    "Gombe",
    "Kaltungo",
    "Nafada",
  ],

  Imo: [
    "Ehime Mbano",
    "Ihitte Uboma",
    "Okigwe",
    "Orlu",
    "Owerri",
    "Mbaise",
    "Oguta",
  ],

  Jigawa: [
    "Birnin Kudu",
    "Dutse",
    "Gumel",
    "Hadejia",
    "Kazaure",
    "Ringim",
  ],

  Kaduna: [
    "Birnin Gwari",
    "Kaduna",
    "Kafanchan",
    "Kagarko",
    "Kachia",
    "Zaria",
  ],

  Kano: [
    "Bichi",
    "Dambatta",
    "Gaya",
    "Kano",
    "Kura",
    "Rano",
    "Wudil",
  ],

  Katsina: [
    "Daura",
    "Funtua",
    "Kankara",
    "Katsina",
    "Malumfashi",
    "Mani",
  ],

  Kebbi: [
    "Argungu",
    "Birnin Kebbi",
    "Bunza",
    "Jega",
    "Kebbe",
    "Yauri",
  ],

  Kogi: [
    "Ankpa",
    "Anyigba",
    "Idah",
    "Kabba",
    "Lokoja",
    "Okene",
  ],

  Kwara: [
    "Ilorin",
    "Jebba",
    "Kaiama",
    "Lafiagi",
    "Malete",
    "Offa",
    "Omu-Aran",
    "Pategi",
  ],

  Lagos: [
    "Agege",
    "Ajah",
    "Alimosho",
    "Badagry",
    "Epe",
    "Ibeju-Lekki",
    "Ikeja",
    "Ikorodu",
    "Isolo",
    "Lekki",
    "Lagos Island",
    "Maryland",
    "Mushin",
    "Oshodi",
    "Surulere",
    "Victoria Island",
    "Yaba",
  ],

  Nasarawa: [
    "Akwanga",
    "Keffi",
    "Lafia",
    "Nasarawa",
    "Obi",
    "Wamba",
  ],

  Niger: [
    "Bida",
    "Bosso",
    "Chanchaga",
    "Kontagora",
    "Minna",
    "Mokwa",
    "Suleja",
  ],

  Ogun: [
    "Abeokuta",
    "Agbara",
    "Ayetoro",
    "Ijebu Ode",
    "Ijebu East",
    "Ijebu South",
    "Ijebu North"'
    "Ilaro",
    "Ifo",
    "Sagamu",
    "Ota",
    "Owode",
  ],

  Ondo: [
    "Akoko",
    "Akure",
    "Ikare",
    "Okitipupa",
    "Ondo",
    "Owo",
    "Ore",
  ],

  Osun: [
    "Ede",
    "Ejigbo",
    "Ife",
    "Ijesa",
    "Ila Orangun",
    "Ilesa",
    "Ikire",
    "Ikirun",
    "Osogbo",
  ],

  Oyo: [
    "Ibadan",
    "Iseyin",
    "Kishi",
    "Ogbomoso",
    "Okeho",
    "Oyo",
    "Saki",
    "Eruwa",
  ],

  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Jos",
    "Jos South",
    "Langtang",
    "Pankshin",
    "Shendam",
  ],

  Rivers: [
    "Ahoada",
    "Bonny",
    "Eleme",
    "Obio-Akpor",
    "Okrika",
    "Omoku",
    "Port Harcourt",
    "Oyigbo",
  ],

  Sokoto: [
    "Binji",
    "Gwadabawa",
    "Illela",
    "Sokoto",
    "Tambuwal",
    "Wamakko",
  ],

  Taraba: [
    "Ardo-Kola",
    "Bali",
    "Gembu",
    "Jalingo",
    "Mayo-Belwa",
    "Wukari",
  ],

  Yobe: [
    "Damaturu",
    "Geidam",
    "Gujba",
    "Nguru",
    "Potiskum",
    "Yunusari",
  ],

  Zamfara: [
    "Anka",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Talata Mafara",
    "Tsafe",
  ],

  FCT: [
    "Abuja",
    "Asokoro",
    "Bwari",
    "Garki",
    "Gwarinpa",
    "Jabi",
    "Kubwa",
    "Maitama",
    "Nyanya",
    "Wuse",
  ],
};

const cleanStates = Object.fromEntries(
  Object.entries(states).map(([key, cities]) => [
    key.replaceAll("_", " "),
    cities,
  ])
);

const emptyCheckout = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  delivery_address: "",
  delivery_city: "",
  delivery_state: "",
};

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
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () =>
      reject(new Error("Paystack could not load."));

    document.body.appendChild(script);
  });

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [checkout, setCheckout] =
    useState(emptyCheckout);

  const [checkoutMessage, setCheckoutMessage] =
    useState("");

  const [notice, setNotice] = useState("");

  const [dark, setDark] = useState(false);

  /* =========================================================
     NOTICE
     ========================================================= */

  const showNotice = msg => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  };

  /* =========================================================
     THEME
     ========================================================= */

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const change = () =>
      setDark(media.matches);

    change();

    media.addEventListener?.(
      "change",
      change
    );

    return () =>
      media.removeEventListener?.(
        "change",
        change
      );
  }, []);

  /* =========================================================
     AUTH + INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setUser(session?.user || null);

      if (session?.user) {
        await loadUser(session.user);
      }

      await Promise.all([
        loadProducts(),
        loadCategories(),
      ]);

      if (mounted) {
        setLoading(false);
      }
    };

    start();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user || null);

          if (session?.user) {
            await loadUser(session.user);
          } else {
            setProfile(null);
            setCart([]);
            setOrders([]);
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     USER
     ========================================================= */

  const loadUser = async currentUser => {
    if (!currentUser) return;

    const {
      data: profileData,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    setProfile(profileData || null);

    const name =
      profileData?.full_name ||
      currentUser.user_metadata?.full_name ||
      "";

    const userPhone =
      profileData?.phone ||
      currentUser.user_metadata?.phone ||
      "";

    setEditName(name);
    setEditPhone(userPhone);

    setCheckout(old => ({
      ...old,
      customer_name:
        name || old.customer_name,
      customer_phone:
        userPhone || old.customer_phone,
      customer_email:
        currentUser.email ||
        old.customer_email,
    }));

    await Promise.all([
      loadCart(currentUser.id),
      loadOrders(currentUser.id),
    ]);
  };

  /* =========================================================
     PRODUCTS
     ========================================================= */

  const loadProducts = async () => {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setProducts(data || []);
    }
  };

  const loadCategories = async () => {
    const {
      data,
      error,
    } = await supabase
      .from("categories")
      .select("*");

    if (!error) {
      setCategories(data || []);
    }
  };

  /* =========================================================
     CART
     ========================================================= */

  const loadCart = async userId => {
    if (!userId) {
      setCart([]);
      return;
    }

    setCartLoading(true);

    const {
      data,
      error,
    } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: true,
      });

    if (!error) {
      setCart(data || []);
    }

    setCartLoading(false);
  };

  const loadOrders = async userId => {
    if (!userId) return;

    const {
      data,
      error,
    } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setOrders(data || []);
    }
  };

  const addToCart = async product => {
    if (!user) {
      setAccountOpen(true);
      setAuthMode("login");
      setAuthMessage(
        "Please login or create an account before shopping."
      );
      return;
    }

    if (Number(product.stock) <= 0) {
      showNotice(
        "This product is currently out of stock."
      );
      return;
    }

    const existing = cart.find(
      item =>
        item.product_id === product.id
    );

    if (existing) {
      const quantity =
        Number(existing.quantity) + 1;

      if (
        quantity >
        Number(product.stock)
      ) {
        showNotice(
          "You have reached the available stock."
        );
        return;
      }

      const { error } =
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", existing.id)
          .eq("user_id", user.id);

      if (error) {
        showNotice(
          "Could not update your cart."
        );
        return;
      }

      setCart(old =>
        old.map(item =>
          item.id === existing.id
            ? { ...item, quantity }
            : item
        )
      );
    } else {
      const {
        data,
        error,
      } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        })
        .select()
        .single();

      if (error || !data) {
        showNotice(
          "Could not add this item."
        );
        return;
      }

      setCart(old => [...old, data]);
    }

    showNotice(
      `${product.name} added to your cart.`
    );
  };

  const updateQuantity = async (
    item,
    change
  ) => {
    if (!user) return;

    const product = products.find(
      p =>
        p.id === item.product_id
    );

    if (!product) return;

    const quantity =
      Number(item.quantity) + change;

    if (quantity <= 0) {
      await removeFromCart(item);
      return;
    }

    if (
      quantity >
      Number(product.stock)
    ) {
      showNotice(
        "No more stock is available."
      );
      return;
    }

    const { error } =
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", item.id)
        .eq("user_id", user.id);

    if (!error) {
      setCart(old =>
        old.map(x =>
          x.id === item.id
            ? { ...x, quantity }
            : x
        )
      );
    }
  };

  const removeFromCart = async item => {
    if (!user) return;

    const { error } =
      await supabase
        .from("cart_items")
        .delete()
        .eq("id", item.id)
        .eq("user_id", user.id);

    if (!error) {
      setCart(old =>
        old.filter(
          x => x.id !== item.id
        )
      );
    }
  };

  const cartProducts = useMemo(
    () =>
      cart
        .map(item => {
          const product =
            products.find(
              p =>
                p.id === item.product_id
            );

          if (!product) return null;

          return {
            ...item,
            product,
            subtotal:
              Number(product.price) *
              Number(item.quantity),
          };
        })
        .filter(Boolean),
    [cart, products]
  );

  const cartCount = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0),
    0
  );

  const cartTotal =
    cartProducts.reduce(
      (sum, item) =>
        sum + item.subtotal,
      0
    );

  /* =========================================================
     AUTH
     ========================================================= */

  const login = async () => {
    setAuthLoading(true);
    setAuthMessage("");

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        }
      );

    if (error) {
      setAuthMessage(error.message);
      setAuthLoading(false);
      return;
    }

    if (data?.user) {
      await loadUser(data.user);
    }

    setPassword("");
    setEmail("");
    setAccountOpen(false);
    setAuthLoading(false);

    showNotice(
      "Welcome back 👋🏽"
    );
  };

  const signup = async () => {
    setAuthLoading(true);
    setAuthMessage("");

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password
    ) {
      setAuthMessage(
        "Please complete all fields."
      );
      setAuthLoading(false);
      return;
    }

    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name:
              fullName.trim(),
            phone:
              phone.trim(),
          },
        },
      });

    if (error) {
      setAuthMessage(error.message);
      setAuthLoading(false);
      return;
    }

    if (data?.user) {
      await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email: email.trim(),
          full_name:
            fullName.trim(),
          phone:
            phone.trim(),
        });

      if (data.session) {
        await loadUser(data.user);
        setAccountOpen(false);
      } else {
        setAuthMessage(
          "Account created. Check your email to confirm your account."
        );
      }
    }

    setPassword("");
    setAuthLoading(false);
  };

  const googleLogin = async () => {
    setAuthLoading(true);
    setAuthMessage("");

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            window.location.origin,
        },
      });

    if (error) {
      setAuthMessage(error.message);
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setCart([]);
    setOrders([]);
    setProfile(null);
    setAccountOpen(false);
    setCartOpen(false);

    showNotice(
      "You have been logged out."
    );
  };

  const submitAuth = async e => {
    e.preventDefault();

    authMode === "signup"
      ? await signup()
      : await login();
  };

  /* =========================================================
     PROFILE
     ========================================================= */

  const saveProfile = async () => {
    if (!user) return;

    if (
      !editName.trim() ||
      !editPhone.trim()
    ) {
      showNotice(
        "Please enter your name and phone."
      );
      return;
    }

    setSavingProfile(true);

    const { error } =
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name:
            editName.trim(),
          phone:
            editPhone.trim(),
        });

    setSavingProfile(false);

    if (error) {
      showNotice(
        "Could not save your profile."
      );
      return;
    }

    setProfile(old => ({
      ...(old || {}),
      full_name:
        editName.trim(),
      phone:
        editPhone.trim(),
      email: user.email,
    }));

    setCheckout(old => ({
      ...old,
      customer_name:
        editName.trim(),
      customer_phone:
        editPhone.trim(),
    }));

    showNotice(
      "Account details saved."
    );
  };

  /* =========================================================
     CATEGORIES
     ========================================================= */

  const categoryNames = useMemo(() => {
    const names =
      categories
        .map(
          c =>
            c.name ||
            c.title ||
            c.category
        )
        .filter(Boolean);

    const productNames =
      products
        .map(p => p.category)
        .filter(Boolean);

    return [
      "All",
      ...new Set([
        ...names,
        ...productNames,
      ]),
    ].filter(
      x =>
        !String(x)
          .toLowerCase()
          .includes("smartphone")
    );
  }, [categories, products]);

  const filteredProducts =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        product => {
          const text =
            `${product.name || ""} ${
              product.description || ""
            } ${
              product.category || ""
            }`.toLowerCase();

          const matchesSearch =
            !q ||
            text.includes(q);

          const matchesCategory =
            category === "All" ||
            product.category ===
              category;

          return (
            matchesSearch &&
            matchesCategory
          );
        }
      );
    }, [
      products,
      search,
      category,
    ]);

  /* =========================================================
     CHECKOUT
     ========================================================= */

  const openCheckout = () => {
    if (!user) {
      setCartOpen(false);
      setAccountOpen(true);
      setAuthMessage(
        "Please login before checkout."
      );
      return;
    }

    if (!cartProducts.length) {
      showNotice(
        "Your cart is empty."
      );
      return;
    }

    setCheckoutMessage("");
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  /* =========================================================
     PAYSTACK PAYMENT
     ========================================================= */

  const startPaystackPayment =
    async e => {
      e.preventDefault();

      if (!user) {
        setCheckoutMessage(
          "Please login first."
        );
        return;
      }

      if (!cartProducts.length) {
        setCheckoutMessage(
          "Your cart is empty."
        );
        return;
      }

      if (
        !checkout.customer_name.trim() ||
        !checkout.customer_phone.trim() ||
        !checkout.delivery_address.trim() ||
        !checkout.delivery_city ||
        !checkout.delivery_state
      ) {
        setCheckoutMessage(
          "Please complete your delivery information."
        );
        return;
      }

      if (
        !checkout.customer_email.trim() &&
        !user.email
      ) {
        setCheckoutMessage(
          "A valid email address is required for payment."
        );
        return;
      }

      setPlacingOrder(true);
      setCheckoutMessage("");

      try {
        await loadPaystack();

        if (!window.PaystackPop) {
          throw new Error(
            "Paystack could not load."
          );
        }

        const reference =
          `SFP-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`;

        const amountInKobo =
          Math.round(
            cartTotal * 100
          );

        const popup =
          new window.PaystackPop();

        popup.newTransaction({
          key:
            PAYSTACK_PUBLIC_KEY,

          email:
            checkout.customer_email.trim() ||
            user.email,

          amount:
            amountInKobo,

          currency: "NGN",

          reference,

          firstName:
            checkout.customer_name
              .trim()
              .split(" ")[0] || "",

          phone:
            checkout.customer_phone.trim(),

          channels: [
            "card",
            "bank",
            "ussd",
            "qr",
            "bank_transfer",
          ],

          metadata: {
            user_id: user.id,
            customer_name:
              checkout.customer_name.trim(),
            customer_phone:
              checkout.customer_phone.trim(),
            delivery_state:
              checkout.delivery_state,
            delivery_city:
              checkout.delivery_city,
          },

          onLoad: () => {
            setPlacingOrder(false);
          },

          onCancel: () => {
            setPlacingOrder(false);
            setCheckoutMessage(
              "Payment was cancelled. Your cart is still saved."
            );
          },

          onSuccess:
            async transaction => {
              await verifyPaymentAndCreateOrder(
                transaction.reference ||
                  reference
              );
            },
        });
      } catch (error) {
        console.error(error);

        setPlacingOrder(false);

        setCheckoutMessage(
          error?.message ||
            "Unable to start payment."
        );
      }
    };

  /* =========================================================
     VERIFY PAYMENT
     ========================================================= */

  const verifyPaymentAndCreateOrder =
    async reference => {
      try {
        setPlacingOrder(true);
        setCheckoutMessage(
          "Confirming your payment..."
        );

        /*
         * IMPORTANT:
         * This calls your Supabase Edge Function.
         *
         * The Paystack SECRET KEY must be inside
         * the verify-payment function.
         */
        const {
          data,
          error,
        } =
          await supabase.functions.invoke(
            "verify-payment",
            {
              body: {
                reference,
                amount:
                  Math.round(
                    cartTotal * 100
                  ),
              },
            }
          );

        if (error) {
          console.error(
            "VERIFY FUNCTION ERROR:",
            error
          );

          throw new Error(
            error.message ||
              "Payment verification failed."
          );
        }

        if (
          !data ||
          data.success !== true
        ) {
          throw new Error(
            data?.message ||
              "Payment could not be verified."
          );
        }

        if (
          data.status &&
          data.status !== "success"
        ) {
          throw new Error(
            "Paystack payment was not successful."
          );
        }

        if (
          data.amount &&
          Number(data.amount) !==
            Math.round(
              cartTotal * 100
            )
        ) {
          throw new Error(
            "Payment amount does not match the order total."
          );
        }

        setCheckoutMessage(
          "Payment confirmed. Creating your order..."
        );

        await createPaidOrder(
          reference,
          data
        );
      } catch (error) {
        console.error(error);

        setPlacingOrder(false);

        setCheckoutMessage(
          error?.message ||
            "We could not verify your payment. Please contact support if you were charged."
        );
      }
    };

  /* =========================================================
     CREATE ORDER ONLY AFTER PAYMENT SUCCESS
     ========================================================= */

  const createPaidOrder =
    async (
      paymentReference,
      verificationData
    ) => {
      const deliveryFee = 0;

      const total =
        cartTotal +
        deliveryFee;

      const {
        data: existingOrder,
      } =
        await supabase
          .from("orders")
          .select("*")
          .eq(
            "payment_reference",
            paymentReference
          )
          .maybeSingle();

      if (existingOrder) {
        setCart([]);

        await loadOrders(user.id);

        setCheckoutOpen(false);
        setCheckout(
          emptyCheckout
        );

        setPlacingOrder(false);
        setOrdersOpen(true);

        showNotice(
          "Payment already processed successfully."
        );

        return;
      }

      const {
        data: order,
        error: orderError,
      } =
        await supabase
          .from("orders")
          .insert({
            user_id: user.id,

            customer_name:
              checkout.customer_name.trim(),

            customer_phone:
              checkout.customer_phone.trim(),

            customer_email:
              checkout.customer_email.trim() ||
              user.email ||
              null,

            delivery_address:
              checkout.delivery_address.trim(),

            delivery_city:
              checkout.delivery_city,

            delivery_state:
              checkout.delivery_state,

            total,

            delivery_fee:
              deliveryFee,

            status:
              "paid",

            payment_reference:
              paymentReference,

            payment_status:
              "paid",

            payment_method:
              "paystack",
          })
          .select()
          .single();

      if (orderError || !order) {
        throw new Error(
          orderError?.message ||
            "Payment succeeded but the order could not be created. Please contact support."
        );
      }

      const items =
        cartProducts.map(
          item => ({
            order_id:
              order.id,

            product_id:
              item.product.id,

            product_name:
              item.product.name,

            price:
              Number(
                item.product.price
              ),

            quantity:
              Number(
                item.quantity
              ),

            image_url:
              item.product.image_url ||
              null,
          })
        );

      const {
        error: itemsError,
      } =
        await supabase
          .from("order_items")
          .insert(items);

      if (itemsError) {
        throw new Error(
          itemsError.message
        );
      }

      /*
       * Cart is cleared ONLY after:
       * 1. Paystack verification succeeds
       * 2. Order is created
       * 3. Order items are created
       */
      const {
        error: cartError,
      } =
        await supabase
          .from("cart_items")
          .delete()
          .eq(
            "user_id",
            user.id
          );

      if (cartError) {
        console.warn(
          "Cart clear warning:",
          cartError
        );
      }

      setCart([]);

      await loadOrders(user.id);

      setCheckoutOpen(false);

      setCheckout(
        emptyCheckout
      );

      setPlacingOrder(false);

      setOrdersOpen(true);

      showNotice(
        `Payment successful 🎉 Order ${String(
          order.id
        ).slice(0, 8)} has been placed.`
      );
    };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          ...styles.loading,
          background: dark
            ? "#08050d"
            : "#12091d",
        }}
      >
        <div
          style={
            styles.loadingLogo
          }
        >
          S
        </div>

        <strong>
          Shindara Phoneflair
        </strong>

        <span>
          Loading your store...
        </span>
      </div>
    );
  }

  const theme =
    dark
      ? darkTheme
      : lightTheme;

  /* =========================================================
     UI
     ========================================================= */

  return (
    <div
      className="app"
      style={{
        ...styles.app,
        ...theme.app,
      }}
    >
      <style>{`
        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0}
        button,input,textarea,select{font:inherit}

        .shindara-marquee{
          display:flex;
          width:max-content;
          animation:shindaraMove 22s linear infinite;
        }

        .shindara-marquee span{
          white-space:nowrap;
          padding-right:70px;
        }

        @keyframes shindaraMove{
          from{transform:translateX(0)}
          to{transform:translateX(-50%)}
        }

        .mobile-menu{
          display:none;
        }

        @media(max-width:760px){

          .desktop-nav{
            display:none!important;
          }

          .mobile-menu{
            display:flex;
          }

          .shindara-header{
            padding:12px 15px!important;
            gap:8px!important;
          }

          .hero{
            min-height:auto!important;
            padding:55px 18px 45px!important;
            display:block!important;
          }

          .hero h1{
            font-size:47px!important;
            letter-spacing:-3px!important;
          }

          .hero-card{
            width:100%!important;
            min-height:260px!important;
            margin-top:30px;
          }

          .section{
            padding:55px 15px!important;
          }

          .shop-top{
            display:block!important;
          }

          .search{
            margin-top:20px!important;
            width:100%!important;
          }

          .category-grid{
            grid-template-columns:repeat(2,1fr)!important;
          }

          .product-grid{
            grid-template-columns:repeat(2,minmax(0,1fr))!important;
            gap:10px!important;
          }

          .product-image{
            height:175px!important;
          }

          .product-info{
            padding:11px!important;
          }

          .product-bottom{
            display:block!important;
          }

          .add-button{
            width:100%!important;
            margin-top:9px!important;
          }

          .trust{
            grid-template-columns:1fr!important;
            padding:40px 15px!important;
          }

          .header-actions{
            gap:5px!important;
          }

          .account-button,
          .cart-button{
            padding:8px 10px!important;
            font-size:10px!important;
          }

          .two-inputs{
            grid-template-columns:1fr!important;
          }

          .account-cards{
            grid-template-columns:1fr!important;
          }

          .drawer{
            width:100%!important;
            padding:18px!important;
          }

          .modal{
            width:calc(100% - 20px)!important;
            padding:21px!important;
          }

          .cart-item{
            grid-template-columns:55px 1fr!important;
          }

          .cart-item>strong{
            grid-column:2;
          }
        }
      `}</style>

      {/* =====================================================
          ANNOUNCEMENT
          ===================================================== */}

      <div style={styles.announcement}>
        <div className="shindara-marquee">
          <span>
            PREMIUM PHONE ACCESSORIES •
            CHARGERS • POWER BANKS • AUDIO •
            CABLES • CASES • GADGETS •
            SCREEN PROTECTORS •
          </span>

          <span>
            PREMIUM PHONE ACCESSORIES •
            CHARGERS • POWER BANKS • AUDIO •
            CABLES • CASES • GADGETS •
            SCREEN PROTECTORS •
          </span>
        </div>
      </div>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className="shindara-header"
        style={{
          ...styles.header,
          ...theme.header,
        }}
      >
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          style={
            styles.logoButton
          }
        >
          <span
            style={
              styles.logoMain
            }
          >
            SHINDARA
          </span>

          <span
            style={
              styles.logoSub
            }
          >
            PHONEFLAIR
          </span>
        </button>

        <nav
          className="desktop-nav"
          style={styles.nav}
        >
          {[
            "Home",
            "Shop",
            "Categories",
          ].map(item => (
            <button
              key={item}
              style={{
                ...styles.navButton,
                color:
                  theme.muted,
              }}
              onClick={() => {
                const id =
                  item === "Home"
                    ? null
                    : item.toLowerCase();

                id
                  ? document
                      .getElementById(id)
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      })
                  : window.scrollTo({
                      top: 0,
                      behavior:
                        "smooth",
                    });
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div
          style={
            styles.headerActions
          }
        >
          <button
            className="account-button"
            style={{
              ...styles.accountButton,
              ...theme.button,
            }}
            onClick={() => {
              setAccountOpen(
                true
              );
              setAuthMessage("");
            }}
          >
            {user
              ? "Account"
              : "Login"}
          </button>

          <button
            className="cart-button"
            style={
              styles.cartButton
            }
            onClick={() => {
              if (!user) {
                setAccountOpen(
                  true
                );

                setAuthMessage(
                  "Please login to access your cart."
                );
              } else {
                setCartOpen(
                  true
                );
              }
            }}
          >
            Cart
            {user && cartCount
              ? ` (${cartCount})`
              : ""}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className="hero"
        style={{
          ...styles.hero,
          ...theme.hero,
        }}
      >
        <div
          style={
            styles.heroGlow
          }
        />

        <div
          className="hero-content"
          style={
            styles.heroContent
          }
        >
          <div
            style={
              styles.eyebrow
            }
          >
            SHINDARA PHONEFLAIR
          </div>

          <h1
            style={{
              ...styles.heroTitle,
              color:
                theme.heading,
            }}
          >
            Technology,
            <br />
            beautifully selected.
          </h1>

          <p
            style={{
              ...styles.heroText,
              color:
                theme.muted,
            }}
          >
            Premium phone accessories,
            chargers, audio products,
            power banks, cables, cases
            and everyday gadgets made
            for the way you live.
          </p>

          <button
            style={
              styles.shopButton
            }
            onClick={() =>
              document
                .getElementById(
                  "shop"
                )
                ?.scrollIntoView({
                  behavior:
                    "smooth",
                })
            }
          >
            Shop accessories →
          </button>
        </div>

        <div
          className="hero-card"
          style={
            styles.heroCard
          }
        >
          <span
            style={
              styles.heroCardSmall
            }
          >
            THE SHINDARA EDIT
          </span>

          <strong>
            Better accessories.
          </strong>

          <strong>
            Better everyday.
          </strong>

          <span
            style={
              styles.heroCardLine
            }
          />

          <span
            style={
              styles.heroCardText
            }
          >
            Curated tech essentials
            for your phone and your
            lifestyle.
          </span>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
          ===================================================== */}

      <section
        id="categories"
        className="section"
        style={styles.section}
      >
        <span
          style={styles.kicker}
        >
          EXPLORE
        </span>

        <h2
          style={{
            ...styles.sectionTitle,
            color:
              theme.heading,
          }}
        >
          Shop by category
        </h2>

        <div
          className="category-grid"
          style={
            styles.categoryGrid
          }
        >
          {categoryNames
            .slice(0, 9)
            .map(name => (
              <button
                key={name}
                style={{
                  ...styles.categoryCard,
                  ...theme.card,
                }}
                onClick={() => {
                  setCategory(name);

                  document
                    .getElementById(
                      "shop"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    });
                }}
              >
                <span
                  style={
                    styles.categoryIcon
                  }
                >
                  {categoryIcon(
                    name
                  )}
                </span>

                <strong>
                  {name}
                </strong>

                <span
                  style={
                    styles.categoryArrow
                  }
                >
                  →
                </span>
              </button>
            ))}
        </div>
      </section>

      {/* =====================================================
          SHOP
          ===================================================== */}

      <section
        id="shop"
        className="section"
        style={
          styles.shopSection
        }
      >
        <div
          className="shop-top"
          style={styles.shopTop}
        >
          <div>
            <span
              style={
                styles.kicker
              }
            >
              SHINDARA STORE
            </span>

            <h2
              style={{
                ...styles.sectionTitle,
                color:
                  theme.heading,
              }}
            >
              Popular picks
            </h2>
          </div>

          <div
            className="search"
            style={{
              ...styles.searchWrap,
              ...theme.input,
            }}
          >
            <span>⌕</span>

            <input
              value={search}
              onChange={e =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search accessories..."
              style={{
                ...styles.searchInput,
                color:
                  theme.heading,
              }}
            />
          </div>
        </div>

        <div
          style={styles.filters}
        >
          {categoryNames
            .slice(0, 8)
            .map(name => (
              <button
                key={name}
                onClick={() =>
                  setCategory(name)
                }
                style={{
                  ...styles.filter,
                  ...theme.button,
                  ...(category ===
                  name
                    ? styles.filterActive
                    : {}),
                }}
              >
                {name}
              </button>
            ))}
        </div>

        {filteredProducts.length ===
        0 ? (
          <div
            style={{
              ...styles.emptyProducts,
              ...theme.card,
            }}
          >
            <div
              style={
                styles.emptyIcon
              }
            >
              ⌕
            </div>

            <h3>
              No products found
            </h3>

            <p>
              Try another search or
              category.
            </p>
          </div>
        ) : (
          <div
            className="product-grid"
            style={
              styles.productGrid
            }
          >
            {filteredProducts
              .slice(0, 12)
              .map(product => (
                <article
                  key={
                    product.id
                  }
                  style={
                    styles.productCard
                  }
                >
                  <div
                    className="product-image"
                    style={{
                      ...styles.productImage,
                      ...theme.image,
                    }}
                  >
                    {product.image_url ? (
                      <img
                        src={
                          product.image_url
                        }
                        alt={
                          product.name
                        }
                        style={
                          styles.productImg
                        }
                      />
                    ) : (
                      <div
                        style={
                          styles.noImage
                        }
                      >
                        S
                      </div>
                    )}

                    {Number(
                      product.stock
                    ) <= 0 && (
                      <span
                        style={
                          styles.outStock
                        }
                      >
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  <div
                    className="product-info"
                    style={
                      styles.productInfo
                    }
                  >
                    <span
                      style={
                        styles.productCategory
                      }
                    >
                      {product.category ||
                        "ACCESSORY"}
                    </span>

                    <h3
                      style={{
                        ...styles.productName,
                        color:
                          theme.heading,
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        ...styles.productDescription,
                        color:
                          theme.muted,
                      }}
                    >
                      {product.description ||
                        "Premium tech essential."}
                    </p>

                    <div
                      className="product-bottom"
                      style={
                        styles.productBottom
                      }
                    >
                      <strong
                        style={
                          styles.price
                        }
                      >
                        {money(
                          product.price
                        )}
                      </strong>

                      <button
                        className="add-button"
                        style={
                          styles.addButton
                        }
                        disabled={
                          Number(
                            product.stock
                          ) <= 0
                        }
                        onClick={() =>
                          addToCart(
                            product
                          )
                        }
                      >
                        {Number(
                          product.stock
                        ) <= 0
                          ? "Sold out"
                          : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      {/* =====================================================
          TRUST
          ===================================================== */}

      <section
        className="trust"
        style={styles.trust}
      >
        {[
          [
            "✦",
            "Reliable delivery",
            "Your order is handled with care from store to doorstep.",
          ],
          [
            "⌾",
            "Secure shopping",
            "Your account and shopping experience stay protected.",
          ],
          [
            "◌",
            "Customer support",
            "We're here whenever you need help with your order.",
          ],
        ].map(
          ([icon, title, text]) => (
            <div
              key={title}
              style={
                styles.trustItem
              }
            >
              <span
                style={
                  styles.trustIcon
                }
              >
                {icon}
              </span>

              <h3>{title}</h3>

              <p>{text}</p>
            </div>
          )
        )}
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer
        style={styles.footer}
      >
        <div
          style={
            styles.footerLogo
          }
        >
          SHINDARA PHONEFLAIR
        </div>

        <p
          style={
            styles.footerText
          }
        >
          Premium phone accessories
          and everyday technology.
        </p>

        <div
          style={
            styles.footerLinks
          }
        >
          <button
            style={
              styles.footerButton
            }
            onClick={() =>
              setAccountOpen(
                true
              )
            }
          >
            My account
          </button>

          <button
            style={
              styles.footerButton
            }
            onClick={() => {
              if (!user) {
                setAccountOpen(
                  true
                );

                setAuthMessage(
                  "Please login to access your cart."
                );
              } else {
                setCartOpen(
                  true
                );
              }
            }}
          >
            My cart
          </button>
        </div>

        <div
          style={
            styles.footerBottom
          }
        >
          © 2026 Shindara
          Phoneflair
        </div>
      </footer>

      {notice && (
        <div
          style={
            styles.notice
          }
        >
          {notice}
        </div>
      )}

      {/* =====================================================
          CART
          ===================================================== */}

      {cartOpen && user && (
        <div
          style={
            styles.overlay
          }
          onClick={() =>
            setCartOpen(false)
          }
        >
          <aside
            className="drawer"
            style={{
              ...styles.drawer,
              ...theme.surface,
            }}
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div
              style={
                styles.drawerHeader
              }
            >
              <div>
                <span
                  style={
                    styles.kicker
                  }
                >
                  YOUR SHOPPING
                </span>

                <h2
                  style={{
                    ...styles.drawerTitle,
                    color:
                      theme.heading,
                  }}
                >
                  Cart
                </h2>
              </div>

              <button
                style={
                  styles.close
                }
                onClick={() =>
                  setCartOpen(
                    false
                  )
                }
              >
                ×
              </button>
            </div>

            {cartLoading ? (
              <div
                style={
                  styles.emptyCart
                }
              >
                Loading cart...
              </div>
            ) : cartProducts.length ===
              0 ? (
              <div
                style={
                  styles.emptyCart
                }
              >
                <div
                  style={
                    styles.emptyCartIcon
                  }
                >
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add something
                  beautiful to get
                  started.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={
                    styles.cartList
                  }
                >
                  {cartProducts.map(
                    item => (
                      <div
                        className="cart-item"
                        style={{
                          ...styles.cartItem,
                          borderColor:
                            theme.border,
                        }}
                        key={item.id}
                      >
                        <div
                          style={
                            styles.cartImage
                          }
                        >
                          {item.product
                            .image_url ? (
                            <img
                              src={
                                item
                                  .product
                                  .image_url
                              }
                              alt={
                                item
                                  .product
                                  .name
                              }
                              style={
                                styles.cartImg
                              }
                            />
                          ) : (
                            "S"
                          )}
                        </div>

                        <div
                          style={
                            styles.cartInfo
                          }
                        >
                          <strong
                            style={{
                              color:
                                theme.heading,
                            }}
                          >
                            {
                              item
                                .product
                                .name
                            }
                          </strong>

                          <span
                            style={{
                              color:
                                theme.muted,
                            }}
                          >
                            {money(
                              item
                                .product
                                .price
                            )}
                          </span>

                          <div
                            style={
                              styles.quantity
                            }
                          >
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item,
                                  -1
                                )
                              }
                            >
                              −
                            </button>

                            <b>
                              {
                                item.quantity
                              }
                            </b>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item,
                                  1
                                )
                              }
                            >
                              +
                            </button>

                            <button
                              style={
                                styles.remove
                              }
                              onClick={() =>
                                removeFromCart(
                                  item
                                )
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <strong
                          style={{
                            color:
                              theme.heading,
                          }}
                        >
                          {money(
                            item.subtotal
                          )}
                        </strong>
                      </div>
                    )
                  )}
                </div>

                <div
                  style={
                    styles.cartSummary
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      color:
                        theme.heading,
                    }}
                  >
                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {money(
                        cartTotal
                      )}
                    </strong>
                  </div>

                  <button
                    style={
                      styles.checkoutButton
                    }
                    onClick={
                      openCheckout
                    }
                  >
                    Continue to
                    checkout →
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* =====================================================
          ACCOUNT
          ===================================================== */}

      {accountOpen && (
        <div
          style={
            styles.overlay
          }
          onClick={() =>
            setAccountOpen(
              false
            )
          }
        >
          <div
            className="modal"
            style={{
              ...styles.modal,
              ...theme.surface,
            }}
            onClick={e =>
              e.stopPropagation()
            }
          >
            <button
              style={
                styles.modalClose
              }
              onClick={() =>
                setAccountOpen(
                  false
                )
              }
            >
              ×
            </button>

            {user ? (
              <>
                <span
                  style={
                    styles.kicker
                  }
                >
                  CUSTOMER ACCOUNT
                </span>

                <h2
                  style={{
                    ...styles.modalTitle,
                    color:
                      theme.heading,
                  }}
                >
                  My account
                </h2>

                <p
                  style={{
                    ...styles.modalText,
                    color:
                      theme.muted,
                  }}
                >
                  {user.email}
                </p>

                <label
                  style={
                    styles.label
                  }
                >
                  Full name
                </label>

                <input
                  value={editName}
                  onChange={e =>
                    setEditName(
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.input,
                    ...theme.input,
                  }}
                />

                <label
                  style={
                    styles.label
                  }
                >
                  Phone number
                </label>

                <input
                  value={editPhone}
                  onChange={e =>
                    setEditPhone(
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.input,
                    ...theme.input,
                  }}
                />

                <button
                  style={
                    styles.authButton
                  }
                  disabled={
                    savingProfile
                  }
                  onClick={
                    saveProfile
                  }
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save account details"}
                </button>

                <div
                  className="account-cards"
                  style={
                    styles.accountCards
                  }
                >
                  <button
                    style={{
                      ...styles.accountCard,
                      ...theme.card,
                    }}
                    onClick={() => {
                      setAccountOpen(
                        false
                      );
                      setCartOpen(
                        true
                      );
                    }}
                  >
                    🛒
                    <span>
                      My cart
                    </span>
                    <small>
                      {cartCount} items
                    </small>
                  </button>

                  <button
                    style={{
                      ...styles.accountCard,
                      ...theme.card,
                    }}
                    onClick={() => {
                      setAccountOpen(
                        false
                      );
                      setOrdersOpen(
                        true
                      );
                    }}
                  >
                    📦
                    <span>
                      My orders
                    </span>
                    <small>
                      {orders.length}{" "}
                      orders
                    </small>
                  </button>
                </div>

                <button
                  style={
                    styles.logout
                  }
                  onClick={
                    logout
                  }
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <span
                  style={
                    styles.kicker
                  }
                >
                  SHINDARA ACCOUNT
                </span>

                <h2
                  style={{
                    ...styles.modalTitle,
                    color:
                      theme.heading,
                  }}
                >
                  {authMode ===
                  "login"
                    ? "Welcome back."
                    : "Create your account."}
                </h2>

                <p
                  style={{
                    ...styles.modalText,
                    color:
                      theme.muted,
                  }}
                >
                  Login to shop and
                  keep your personal
                  cart saved.
                </p>

                <button
                  style={
                    styles.googleButton
                  }
                  onClick={
                    googleLogin
                  }
                  disabled={
                    authLoading
                  }
                >
                  <span
                    style={
                      styles.googleG
                    }
                  >
                    G
                  </span>

                  Continue with
                  Google
                </button>

                <div
                  style={
                    styles.or
                  }
                >
                  <span />
                  OR
                  <span />
                </div>

                <form
                  onSubmit={
                    submitAuth
                  }
                >
                  {authMode ===
                    "signup" && (
                    <>
                      <label
                        style={
                          styles.label
                        }
                      >
                        Full name
                      </label>

                      <input
                        value={
                          fullName
                        }
                        onChange={e =>
                          setFullName(
                            e.target
                              .value
                          )
                        }
                        style={{
                          ...styles.input,
                          ...theme.input,
                        }}
                        placeholder="Your full name"
                      />

                      <label
                        style={
                          styles.label
                        }
                      >
                        Phone number
                      </label>

                      <input
                        value={
                          phone
                        }
                        onChange={e =>
                          setPhone(
                            e.target
                              .value
                          )
                        }
                        style={{
                          ...styles.input,
                          ...theme.input,
                        }}
                        placeholder="080..."
                      />
                    </>
                  )}

                  <label
                    style={
                      styles.label
                    }
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={e =>
                      setEmail(
                        e.target
                          .value
                      )
                    }
                    style={{
                      ...styles.input,
                      ...theme.input,
                    }}
                    placeholder="you@example.com"
                  />

                  <label
                    style={
                      styles.label
                    }
                  >
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={e =>
                      setPassword(
                        e.target
                          .value
                      )
                    }
                    style={{
                      ...styles.input,
                      ...theme.input,
                    }}
                    placeholder="Your password"
                  />

                  {authMessage && (
                    <div
                      style={
                        styles.authMessage
                      }
                    >
                      {authMessage}
                    </div>
                  )}

                  <button
                    style={
                      styles.authButton
                    }
                    disabled={
                      authLoading
                    }
                  >
                    {authLoading
                      ? "Please wait..."
                      : authMode ===
                        "login"
                      ? "Login"
                      : "Create account"}
                  </button>
                </form>

                <button
                  style={
                    styles.switchAuth
                  }
                  onClick={() => {
                    setAuthMessage(
                      ""
                    );

                    setAuthMode(
                      authMode ===
                        "login"
                        ? "signup"
                        : "login"
                    );
                  }}
                >
                  {authMode ===
                  "login"
                    ? "New to Shindara? Create an account"
                    : "Already have an account? Login"}
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
          style={
            styles.overlay
          }
        >
          <div
            className="modal"
            style={{
              ...styles.checkoutModal,
              ...theme.surface,
            }}
          >
            <button
              style={
                styles.modalClose
              }
              onClick={() =>
                setCheckoutOpen(
                  false
                )
              }
            >
              ×
            </button>

            <span
              style={
                styles.kicker
              }
            >
              SHINDARA CHECKOUT
            </span>

            <h2
              style={{
                ...styles.modalTitle,
                color:
                  theme.heading,
              }}
            >
              Delivery details
            </h2>

            <p
              style={{
                ...styles.modalText,
                color:
                  theme.muted,
              }}
            >
              Total:{" "}
              <strong>
                {money(cartTotal)}
              </strong>
            </p>

            <form
              onSubmit={
                startPaystackPayment
              }
            >
              <label
                style={
                  styles.label
                }
              >
                Full name
              </label>

              <input
                value={
                  checkout.customer_name
                }
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    customer_name:
                      e.target.value,
                  })
                }
                style={{
                  ...styles.input,
                  ...theme.input,
                }}
              />

              <label
                style={
                  styles.label
                }
              >
                Phone
              </label>

              <input
                value={
                  checkout.customer_phone
                }
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    customer_phone:
                      e.target.value,
                  })
                }
                style={{
                  ...styles.input,
                  ...theme.input,
                }}
              />

              <label
                style={
                  styles.label
                }
              >
                Email
              </label>

              <input
                type="email"
                value={
                  checkout.customer_email
                }
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    customer_email:
                      e.target.value,
                  })
                }
                style={{
                  ...styles.input,
                  ...theme.input,
                }}
              />

              <label
                style={
                  styles.label
                }
              >
                Delivery address
              </label>

              <textarea
                value={
                  checkout.delivery_address
                }
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    delivery_address:
                      e.target.value,
                  })
                }
                style={{
                  ...styles.textarea,
                  ...theme.input,
                }}
                placeholder="House number, street..."
              />

              <div
                className="two-inputs"
                style={
                  styles.twoInputs
                }
              >
                <div>
                  <label
                    style={
                      styles.label
                    }
                  >
                    State
                  </label>

                  <select
                    value={
                      checkout.delivery_state
                    }
                    onChange={e =>
                      setCheckout({
                        ...checkout,
                        delivery_state:
                          e.target
                            .value,
                        delivery_city:
                          "",
                      })
                    }
                    style={{
                      ...styles.input,
                      ...theme.input,
                    }}
                  >
                    <option value="">
                      Select state
                    </option>

                    {Object.keys(
                      cleanStates
                    ).map(state => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={
                      styles.label
                    }
                  >
                    City
                  </label>

                  <select
                    value={
                      checkout.delivery_city
                    }
                    disabled={
                      !checkout.delivery_state
                    }
                    onChange={e =>
                      setCheckout({
                        ...checkout,
                        delivery_city:
                          e.target
                            .value,
                      })
                    }
                    style={{
                      ...styles.input,
                      ...theme.input,
                    }}
                  >
                    <option value="">
                      {checkout.delivery_state
                        ? "Select city"
                        : "Select state first"}
                    </option>

                    {(
                      cleanStates[
                        checkout
                          .delivery_state
                      ] || []
                    ).map(
                      city => (
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

              {checkoutMessage && (
                <div
                  style={
                    styles.authMessage
                  }
                >
                  {checkoutMessage}
                </div>
              )}

              <button
                style={
                  styles.checkoutButton
                }
                disabled={
                  placingOrder
                }
              >
                {placingOrder
                  ? "Processing payment..."
                  : `Pay ${money(
                      cartTotal
                    )} with Paystack →`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          ORDERS
          ===================================================== */}

      {ordersOpen && (
        <div
          style={
            styles.overlay
          }
          onClick={() =>
            setOrdersOpen(
              false
            )
          }
        >
          <div
            className="modal"
            style={{
              ...styles.ordersModal,
              ...theme.surface,
            }}
            onClick={e =>
              e.stopPropagation()
            }
          >
            <button
              style={
                styles.modalClose
              }
              onClick={() =>
                setOrdersOpen(
                  false
                )
              }
            >
              ×
            </button>

            <span
              style={
                styles.kicker
              }
            >
              SHINDARA
            </span>

            <h2
              style={{
                ...styles.modalTitle,
                color:
                  theme.heading,
              }}
            >
              Your orders
            </h2>

            {orders.length ===
            0 ? (
              <div
                style={
                  styles.emptyCart
                }
              >
                <div
                  style={
                    styles.emptyCartIcon
                  }
                >
                  📦
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Your orders will
                  appear here.
                </p>
              </div>
            ) : (
              <div
                style={
                  styles.ordersList
                }
              >
                {orders.map(
                  order => (
                    <div
                      key={
                        order.id
                      }
                      style={{
                        ...styles.orderCard,
                        ...theme.card,
                      }}
                    >
                      <div>
                        <strong>
                          Order #
                          {String(
                            order.id
                          ).slice(
                            0,
                            8
                          )}
                        </strong>

                        <span
                          style={
                            styles.orderDate
                          }
                        >
                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-NG"
                          )}
                        </span>

                        {order.payment_reference && (
                          <span
                            style={{
                              display:
                                "block",
                              marginTop:
                                5,
                              fontSize:
                                8,
                              color:
                                theme.muted,
                            }}
                          >
                            Ref:{" "}
                            {
                              order.payment_reference
                            }
                          </span>
                        )}
                      </div>

                      <div
                        style={
                          styles.orderRight
                        }
                      >
                        <strong>
                          {money(
                            order.total
                          )}
                        </strong>

                        <span
                          style={
                            styles.status
                          }
                        >
                          {order.payment_status ===
                          "paid"
                            ? "PAID"
                            : order.status ||
                              "pending"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CATEGORY ICON
   ========================================================= */

function categoryIcon(name) {
  const v =
    String(name).toLowerCase();

  if (v.includes("case"))
    return "◈";

  if (v.includes("charger"))
    return "⚡";

  if (v.includes("audio"))
    return "◉";

  if (v.includes("power"))
    return "◒";

  if (v.includes("watch"))
    return "⌚";

  if (v.includes("cable"))
    return "⌁";

  if (v.includes("ear"))
    return "◉";

  if (v.includes("screen"))
    return "▣";

  if (v.includes("gadget"))
    return "✦";

  return "✦";
}

/* =========================================================
   THEMES
   ========================================================= */

const lightTheme = {
  app: {
    background: "#fff",
    color: "#211b29",
  },

  header: {
    background: "#fff",
  },

  hero: {
    background: "#fff",
  },

  surface: {
    background: "#fff",
    color: "#211b29",
  },

  card: {
    background: "#fff",
    color: "#211b29",
  },

  input: {
    background: "#faf9fd",
    color: "#211b29",
    borderColor:
      "rgba(54,29,78,.12)",
  },

  heading: "#17131d",
  muted: "#777080",

  border:
    "rgba(54,29,78,.1)",

  image: {
    background: "#faf9fd",
  },

  button: {
    background: "#fff",
    color: "#211b29",
  },
};

const darkTheme = {
  app: {
    background: "#09070d",
    color: "#f8f4ff",
  },

  header: {
    background: "#0d0913",
  },

  hero: {
    background: "#09070d",
  },

  surface: {
    background: "#15101d",
    color: "#f8f4ff",
  },

  card: {
    background: "#15101d",
    color: "#f8f4ff",
    borderColor:
      "rgba(255,255,255,.09)",
  },

  input: {
    background: "#21182b",
    color: "#fff",
    borderColor:
      "rgba(255,255,255,.13)",
  },

  heading: "#fff",
  muted: "#b5aaba",

  border:
    "rgba(255,255,255,.1)",

  image: {
    background: "#18121f",
  },

  button: {
    background: "#18121f",
    color: "#fff",
    borderColor:
      "rgba(255,255,255,.12)",
  },
};

/* =========================================================
   STYLES
   ========================================================= */

const styles = {
  app: {
    minHeight: "100vh",
    overflowX: "hidden",
    fontFamily:
      "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    transition:
      "background .25s,color .25s",
  },

  loading: {
    minHeight: "100vh",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background:
      "linear-gradient(135deg,#7c3aed,#4c1d95)",
    display: "grid",
    placeItems: "center",
    fontSize: 30,
    fontWeight: 900,
  },

  announcement: {
    height: 32,
    overflow: "hidden",
    background: "#32105f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 2,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: 20,
    padding: "14px 6%",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom:
      "1px solid rgba(54,29,78,.06)",
  },

  logoButton: {
    border: 0,
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },

  logoMain: {
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: -0.8,
  },

  logoSub: {
    color: "#6d28d9",
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 2,
  },

  nav: {
    display: "flex",
    gap: 22,
  },

  navButton: {
    border: 0,
    background: "transparent",
    fontWeight: 650,
    fontSize: 12,
    cursor: "pointer",
  },

  headerActions: {
    display: "flex",
    gap: 8,
  },

  accountButton: {
    borderRadius: 999,
    padding: "9px 14px",
    fontWeight: 750,
    fontSize: 11,
    cursor: "pointer",
  },

  cartButton: {
    border: 0,
    background: "#6d28d9",
    color: "#fff",
    borderRadius: 999,
    padding: "9px 14px",
    fontWeight: 800,
    fontSize: 11,
    cursor: "pointer",
  },

  hero: {
    minHeight: 650,
    padding: "90px 7%",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: 50,
    position: "relative",
    overflow: "hidden",
  },

  heroGlow: {
    position: "absolute",
    width: 520,
    height: 520,
    right: -160,
    top: 50,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(109,40,217,.19),transparent 65%)",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: 760,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 3,
    color: "#6d28d9",
    marginBottom: 18,
  },

  heroTitle: {
    margin: 0,
    fontSize:
      "clamp(50px,8vw,94px)",
    lineHeight: 0.94,
    letterSpacing: -5,
    fontWeight: 900,
  },

  heroText: {
    maxWidth: 590,
    fontSize: 16,
    lineHeight: 1.7,
    margin: "28px 0",
  },

  shopButton: {
    border: 0,
    background: "#6d28d9",
    color: "#fff",
    padding: "15px 22px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  heroCard: {
    position: "relative",
    zIndex: 2,
    width: 310,
    minHeight: 370,
    borderRadius: 32,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    color: "#fff",
    background:
      "linear-gradient(145deg,#7c3aed,#4c1d95 55%,#24123e)",
    boxShadow:
      "0 35px 70px rgba(76,29,149,.25)",
  },

  heroCardSmall: {
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: 800,
    opacity: 0.7,
    marginBottom: "auto",
  },

  heroCardLine: {
    width: 45,
    height: 2,
    background: "#d8b4fe",
    margin: "20px 0",
  },

  heroCardText: {
    fontSize: 12,
    lineHeight: 1.6,
    opacity: 0.72,
  },

  section: {
    padding: "75px 7%",
  },

  shopSection: {
    paddingTop: 30,
    paddingBottom: 90,
  },

  kicker: {
    color: "#6d28d9",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 2.5,
  },

  sectionTitle: {
    margin: "8px 0 30px",
    fontSize:
      "clamp(31px,5vw,50px)",
    lineHeight: 1,
    letterSpacing: -2,
    fontWeight: 900,
  },

  categoryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(145px,1fr))",
    gap: 14,
  },

  categoryCard: {
    position: "relative",
    minHeight: 145,
    border:
      "1px solid rgba(54,29,78,.1)",
    borderRadius: 20,
    cursor: "pointer",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent:
      "space-between",
    textAlign: "left",
  },

  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    background: "#f3edff",
    color: "#6d28d9",
    display: "grid",
    placeItems: "center",
    fontSize: 21,
  },

  categoryArrow: {
    position: "absolute",
    right: 18,
    bottom: 18,
    color: "#a99fb0",
  },

  shopTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "end",
    gap: 25,
    marginBottom: 20,
  },

  searchWrap: {
    minWidth: 260,
    height: 46,
    border:
      "1px solid rgba(54,29,78,.1)",
    borderRadius: 999,
    padding: "0 15px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    width: "100%",
    border: 0,
    outline: 0,
    background: "transparent",
    fontSize: 12,
  },

  filters: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 18,
  },

  filter: {
    whiteSpace: "nowrap",
    border:
      "1px solid rgba(54,29,78,.1)",
    borderRadius: 999,
    padding: "9px 14px",
    fontSize: 10,
    fontWeight: 750,
    cursor: "pointer",
  },

  filterActive: {
    background: "#6d28d9",
    color: "#fff",
    borderColor: "#6d28d9",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: 18,
  },

  productCard: {
    overflow: "hidden",
  },

  productImage: {
    position: "relative",
    height: 260,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    borderRadius: 20,
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: 18,
  },

  noImage: {
    width: 70,
    height: 70,
    borderRadius: 22,
    display: "grid",
    placeItems: "center",
    background: "#6d28d9",
    color: "#fff",
    fontSize: 30,
    fontWeight: 900,
  },

  outStock: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "#24123e",
    color: "#fff",
    borderRadius: 999,
    padding: "6px 9px",
    fontSize: 8,
    fontWeight: 800,
  },

  productInfo: {
    padding: "15px 3px",
  },

  productCategory: {
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 1.5,
    color: "#6d28d9",
  },

  productName: {
    fontSize: 15,
    margin: "8px 0",
    lineHeight: 1.3,
  },

  productDescription: {
    fontSize: 11,
    lineHeight: 1.5,
    minHeight: 34,
  },

  productBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: 8,
    marginTop: 15,
  },

  price: {
    color: "#6d28d9",
    fontSize: 16,
    whiteSpace: "nowrap",
  },

  addButton: {
    border: 0,
    background: "#6d28d9",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  emptyProducts: {
    padding: "70px 20px",
    textAlign: "center",
    borderRadius: 25,
  },

  emptyIcon: {
    fontSize: 35,
    color: "#6d28d9",
  },

  trust: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3,1fr)",
    gap: 15,
    padding: "65px 7%",
    background: "#24123e",
  },

  trustItem: {
    padding: 28,
    borderRadius: 22,
    background:
      "rgba(255,255,255,.07)",
    border:
      "1px solid rgba(255,255,255,.1)",
    color: "#fff",
  },

  trustIcon: {
    color: "#d8b4fe",
    fontSize: 25,
  },

  footer: {
    padding: "60px 7% 25px",
    background: "#160d24",
    color: "#fff",
  },

  footerLogo: {
    fontSize: 17,
    fontWeight: 900,
  },

  footerText: {
    color:
      "rgba(255,255,255,.55)",
    maxWidth: 400,
    fontSize: 12,
    lineHeight: 1.6,
  },

  footerLinks: {
    display: "flex",
    gap: 10,
    margin: "30px 0",
  },

  footerButton: {
    border:
      "1px solid rgba(255,255,255,.12)",
    background:
      "rgba(255,255,255,.05)",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 13px",
    cursor: "pointer",
  },

  footerBottom: {
    borderTop:
      "1px solid rgba(255,255,255,.08)",
    paddingTop: 20,
    color:
      "rgba(255,255,255,.4)",
    fontSize: 10,
  },

  notice: {
    position: "fixed",
    zIndex: 1000,
    left: "50%",
    bottom: 25,
    transform:
      "translateX(-50%)",
    background: "#24123e",
    color: "#fff",
    padding: "13px 18px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    maxWidth: "90%",
    textAlign: "center",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 500,
    background:
      "rgba(18,8,28,.68)",
    backdropFilter:
      "blur(12px)",
    display: "flex",
    justifyContent:
      "flex-end",
  },

  drawer: {
    width: "min(520px,100%)",
    height: "100%",
    padding: 25,
    overflowY: "auto",
  },

  drawerHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "start",
    marginBottom: 25,
  },

  drawerTitle: {
    margin: "7px 0",
    fontSize: 35,
  },

  close: {
    border: 0,
    background: "#f3edff",
    color: "#4c1d95",
    width: 40,
    height: 40,
    borderRadius: "50%",
    fontSize: 24,
    cursor: "pointer",
  },

  emptyCart: {
    padding: "70px 20px",
    textAlign: "center",
    color: "#8a8090",
  },

  emptyCartIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  cartList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  cartItem: {
    display: "grid",
    gridTemplateColumns:
      "65px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: "12px 0",
    borderBottom:
      "1px solid",
  },

  cartImage: {
    width: 65,
    height: 65,
    borderRadius: 15,
    background: "#f3edff",
    display: "grid",
    placeItems: "center",
    color: "#6d28d9",
    fontWeight: 900,
  },

  cartImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 15,
  },

  cartInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    minWidth: 0,
  },

  quantity: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },

  remove: {
    border: 0,
    background: "transparent",
    color: "#c02675",
    fontSize: 9,
    cursor: "pointer",
    marginLeft: 5,
  },

  cartSummary: {
    marginTop: 25,
    paddingTop: 20,
    borderTop:
      "1px solid rgba(54,29,78,.1)",
  },

  checkoutButton: {
    width: "100%",
    border: 0,
    background: "#6d28d9",
    color: "#fff",
    padding: 15,
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 18,
  },

  modal: {
    width:
      "min(460px,calc(100% - 30px))",
    maxHeight: "92vh",
    overflowY: "auto",
    margin: "auto",
    borderRadius: 25,
    padding: 28,
    position: "relative",
  },

  checkoutModal: {
    width:
      "min(560px,calc(100% - 25px))",
    maxHeight: "92vh",
    overflowY: "auto",
    margin: "auto",
    borderRadius: 25,
    padding: 28,
    position: "relative",
  },

  ordersModal: {
    width:
      "min(650px,calc(100% - 25px))",
    maxHeight: "85vh",
    overflowY: "auto",
    margin: "auto",
    borderRadius: 25,
    padding: 28,
    position: "relative",
  },

  modalClose: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 38,
    height: 38,
    border: 0,
    borderRadius: "50%",
    background: "#f3edff",
    color: "#4c1d95",
    fontSize: 22,
    cursor: "pointer",
  },

  modalTitle: {
    margin: "8px 0",
    fontSize: 34,
    lineHeight: 1,
  },

  modalText: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 22,
  },

  label: {
    display: "block",
    color: "#6d6470",
    fontSize: 10,
    fontWeight: 800,
    margin: "13px 0 6px",
  },

  input: {
    width: "100%",
    height: 45,
    padding: "0 13px",
    border: "1px solid",
    borderRadius: 11,
    outline: 0,
  },

  textarea: {
    width: "100%",
    minHeight: 85,
    padding: 13,
    border: "1px solid",
    borderRadius: 11,
    outline: 0,
    resize: "vertical",
  },

  twoInputs: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 10,
  },

  authButton: {
    width: "100%",
    marginTop: 18,
    border: 0,
    borderRadius: 12,
    padding: 14,
    background: "#6d28d9",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  googleButton: {
    width: "100%",
    border:
      "1px solid rgba(54,29,78,.14)",
    background: "#fff",
    color: "#211b29",
    borderRadius: 12,
    padding: 13,
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    gap: 10,
  },

  googleG: {
    fontSize: 18,
    fontWeight: 900,
  },

  or: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#918795",
    fontSize: 9,
    margin: "18px 0",
  },

  authMessage: {
    marginTop: 12,
    padding: 11,
    borderRadius: 10,
    background: "#fff0f6",
    color: "#9b2c70",
    fontSize: 11,
    lineHeight: 1.5,
  },

  switchAuth: {
    display: "block",
    width: "100%",
    marginTop: 16,
    border: 0,
    background: "transparent",
    color: "#6d28d9",
    fontSize: 11,
    fontWeight: 750,
    cursor: "pointer",
  },

  accountCards: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 10,
    margin: "25px 0",
  },

  accountCard: {
    textAlign: "left",
    border:
      "1px solid rgba(54,29,78,.1)",
    borderRadius: 15,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    gap: 7,
    cursor: "pointer",
  },

  logout: {
    width: "100%",
    border:
      "1px solid rgba(155,44,112,.2)",
    background: "transparent",
    color: "#c02675",
    borderRadius: 12,
    padding: 13,
    fontWeight: 800,
    cursor: "pointer",
  },

  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 25,
  },

  orderCard: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 15,
    padding: 15,
    borderRadius: 15,
    border:
      "1px solid rgba(54,29,78,.08)",
  },

  orderDate: {
    display: "block",
    marginTop: 5,
    color: "#89808e",
    fontSize: 9,
  },

  orderRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "end",
    gap: 6,
  },

  status: {
    background: "#f3edff",
    color: "#6d28d9",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 8,
    fontWeight: 800,
  },
};
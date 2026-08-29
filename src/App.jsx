import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient.js";

const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

const money = (value) =>
  `₦${Number(value || 0).toLocaleString("en-NG")}`;

const makeTrackingNumber = () =>
  `SHP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

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
    "Ijebu-North",
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

const categories = [
  "All",
  "Gadgets",
  "Phone Cases",
  "Chargers & Cables",
  "Power Banks",
  "Audio",
  "Smart Watches",
  "Screen Protectors",
];

const trackingSteps = [
  ["Order placed", "Your order has been received."],
  ["Payment confirmed", "Payment has been successfully confirmed."],
  ["Processing", "Your items are being prepared."],
  ["Shipped", "Your order has left our store."],
  ["In transit", "Your package is on its way."],
  ["Out for delivery", "Your package is with the delivery team."],
  ["Delivered", "Your order has been delivered."],
];

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

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

  const [checkout, setCheckout] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    delivery_state: "",
    delivery_city: "",
  });

  const [checkoutMessage, setCheckoutMessage] = useState("");

  const notify = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 3500);
  };

  /* =========================================================
     INITIALIZATION
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        await loadProducts();

        const { data } = await supabase.auth.getSession();
        const currentUser = data?.session?.user || null;

        if (currentUser) {
          setUser(currentUser);
          await loadCustomerData(currentUser);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    start();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user || null;

      setUser(nextUser);

      if (nextUser) {
        await loadCustomerData(nextUser);
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
  }, []);

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProducts(data || []);
    } else {
      console.error("Products:", error);
    }
  };

  /* =========================================================
     CUSTOMER DATA
  ========================================================= */

  const loadCustomerData = async (currentUser) => {
    await Promise.all([
      loadProfile(currentUser),
      loadCart(currentUser),
      loadOrders(currentUser),
    ]);
  };

  const loadProfile = async (currentUser) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Profile:", error);
      return;
    }

    if (data) {
      setProfile(data);
      setEditName(data.full_name || "");
      setEditPhone(data.phone || "");

      setCheckout((prev) => ({
        ...prev,
        customer_name:
          data.full_name ||
          currentUser.user_metadata?.full_name ||
          "",
        customer_phone:
          data.phone ||
          currentUser.user_metadata?.phone ||
          "",
        customer_email: currentUser.email || "",
      }));
    }
  };

  /* =========================================================
     CART
  ========================================================= */

  const loadCart = async (currentUser) => {
    if (!currentUser) return;

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
      setCart([]);
      return;
    }

    setCart(
      (data || [])
        .filter((item) => item.products)
        .map((item) => ({
          ...item,
          product: item.products,
          subtotal:
            Number(item.products.price || 0) *
            Number(item.quantity || 0),
        }))
    );
  };

  const addToCart = async (product) => {
    if (!user) {
      setAccountOpen(true);
      setAuthMessage("Please login before adding items to your cart.");
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      notify("This product is out of stock.");
      return;
    }

    const existing = cart.find(
      (item) => item.product_id === product.id
    );

    if (existing) {
      const quantity = Number(existing.quantity) + 1;

      if (quantity > Number(product.stock)) {
        notify("You cannot add more than available stock.");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", existing.id)
        .eq("user_id", user.id);

      if (error) {
        notify("Unable to update cart.");
        return;
      }
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        });

      if (error) {
        console.error(error);
        notify("Unable to add product to cart.");
        return;
      }
    }

    await loadCart(user);
    notify(`${product.name} added to cart.`);
  };

  const updateQuantity = async (item, amount) => {
    if (!user) return;

    const next = Number(item.quantity) + amount;

    if (next <= 0) {
      await removeFromCart(item);
      return;
    }

    if (
      item.product &&
      Number(item.product.stock) < next
    ) {
      notify("You cannot exceed available stock.");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: next })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (!error) {
      await loadCart(user);
    }
  };

  const removeFromCart = async (item) => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (!error) {
      await loadCart(user);
      notify("Item removed.");
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setCart([]);
    }
  };

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.subtotal || 0),
        0
      ),
    [cart]
  );

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  /* =========================================================
     ORDERS
  ========================================================= */

  const loadOrders = async (currentUser) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders:", error);
      setOrders([]);
      return;
    }

    const complete = [];

    for (const order of data || []) {
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
            category
          )
        `)
        .eq("order_id", order.id);

      if (itemError) {
        console.error("Order items:", itemError);
      }

      complete.push({
        ...order,
        items: (items || []).map((item) => ({
          ...item,
          product: item.products,
        })),
      });
    }

    setOrders(complete);
  };

  /* =========================================================
     AUTH
  ========================================================= */

  const submitAuth = async (e) => {
    e.preventDefault();

    setAuthBusy(true);
    setAuthMessage("");

    if (!email.trim() || !password) {
      setAuthMessage("Enter your email and password.");
      setAuthBusy(false);
      return;
    }

    if (authMode === "signup") {
      if (!fullName.trim() || !phone.trim()) {
        setAuthMessage(
          "Enter your full name and phone number."
        );
        setAuthBusy(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
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
        setAuthBusy(false);
        return;
      }

      if (data?.user) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
          { onConflict: "id" }
        );
      }

      setAuthMessage(
        "Account created. Check your email if verification is required."
      );
    } else {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setAuthMessage(error.message);
      } else {
        setAccountOpen(false);
        setEmail("");
        setPassword("");
      }
    }

    setAuthBusy(false);
  };

  const googleLogin = async () => {
    setAuthBusy(true);

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

    if (error) {
      setAuthMessage(error.message);
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setCart([]);
    setOrders([]);

    setAccountOpen(false);
    setCartOpen(false);
    setOrdersOpen(false);
    setTrackingOpen(false);
  };

  /* =========================================================
     PROFILE
  ========================================================= */

  const saveProfile = async () => {
    if (!user) return;

    setBusy(true);

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: editName.trim(),
          phone: editPhone.trim(),
        },
        { onConflict: "id" }
      );

    setBusy(false);

    if (error) {
      notify("Could not save account details.");
      return;
    }

    setProfile((old) => ({
      ...(old || {}),
      full_name: editName.trim(),
      phone: editPhone.trim(),
    }));

    setCheckout((old) => ({
      ...old,
      customer_name: editName.trim(),
      customer_phone: editPhone.trim(),
    }));

    notify("Account details saved.");
  };

  /* =========================================================
     CHECKOUT
  ========================================================= */

  const openCheckout = () => {
    if (!user) {
      setCartOpen(false);
      setAccountOpen(true);
      setAuthMessage("Please login before checkout.");
      return;
    }

    if (!cart.length) {
      notify("Your cart is empty.");
      return;
    }

    setCheckoutMessage("");

    setCheckout((old) => ({
      ...old,
      customer_name:
        old.customer_name ||
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "",
      customer_phone:
        old.customer_phone ||
        profile?.phone ||
        user.user_metadata?.phone ||
        "",
      customer_email:
        old.customer_email ||
        user.email ||
        "",
    }));

    setCartOpen(false);
    setCheckoutOpen(true);
  };

  /* =========================================================
   PAYSTACK PAYMENT
   ========================================================= */

const loadPaystack = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop);
        } else {
          reject(new Error("Paystack failed to initialize."));
        }
      });

      existing.addEventListener(
        "error",
        () => reject(new Error("Unable to load Paystack.")),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;

    script.onload = () => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
      } else {
        reject(new Error("Paystack failed to initialize."));
      }
    };

    script.onerror = () => {
      reject(new Error("Unable to load Paystack."));
    };

    document.body.appendChild(script);
  });
};


const startPaystackPayment = async e => {
  e.preventDefault();

  if (placingOrder) return;

  if (!user) {
    setCheckoutMessage("Please login again.");
    return;
  }

  if (!cartProducts || cartProducts.length === 0) {
    setCheckoutMessage("Your cart is empty.");
    return;
  }

  /* ---------------------------------------------
     VALIDATE CHECKOUT
     --------------------------------------------- */

  if (
    !checkout.customer_name?.trim() ||
    !checkout.customer_phone?.trim() ||
    !checkout.customer_email?.trim() ||
    !checkout.delivery_address?.trim() ||
    !checkout.delivery_state ||
    !checkout.delivery_city
  ) {
    setCheckoutMessage(
      "Please complete all delivery details before payment."
    );
    return;
  }

  /* ---------------------------------------------
     CHECK STOCK
     --------------------------------------------- */

  for (const item of cartProducts) {
    const stock = Number(item.product?.stock || 0);
    const quantity = Number(item.quantity || 0);

    if (!item.product || stock < quantity) {
      setCheckoutMessage(
        `${item.product?.name || "This product"} does not have enough stock.`
      );

      await loadCart(user);
      return;
    }
  }

  const amount = Number(cartTotal);

  if (!Number.isFinite(amount) || amount <= 0) {
    setCheckoutMessage("Invalid payment amount.");
    return;
  }

  setPlacingOrder(true);
  setCheckoutMessage("");

  try {
    /* ---------------------------------------------
       LOAD PAYSTACK
       --------------------------------------------- */

    const PaystackPop = await loadPaystack();

    if (!PaystackPop) {
      throw new Error("Paystack payment system is unavailable.");
    }

    /* ---------------------------------------------
       CREATE UNIQUE REFERENCE
       --------------------------------------------- */

    const reference =
      `SHP-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    console.log("Starting Paystack:", {
      reference,
      amount,
      email: checkout.customer_email,
    });

    /* ---------------------------------------------
       OPEN PAYSTACK
       --------------------------------------------- */

    const paystack = new PaystackPop();

    paystack.newTransaction({

      key: PAYSTACK_PUBLIC_KEY,

      email: checkout.customer_email.trim(),

      amount: Math.round(amount * 100),

      currency: "NGN",

      reference,

      metadata: {
        user_id: user.id,
        customer_name:
          checkout.customer_name.trim(),
        customer_phone:
          checkout.customer_phone.trim(),
        delivery_address:
          checkout.delivery_address.trim(),
        delivery_state:
          checkout.delivery_state,
        delivery_city:
          checkout.delivery_city,
      },

      onSuccess: async transaction => {
        console.log(
          "PAYSTACK PAYMENT SUCCESS:",
          transaction
        );

        await completeSuccessfulPayment(
          transaction
        );
      },

      onCancel: () => {
        console.log("Paystack payment cancelled.");

        setPlacingOrder(false);

        setCheckoutMessage(
          "Payment cancelled. Your cart has not been cleared."
        );
      },

      onError: error => {
        console.error(
          "PAYSTACK PAYMENT ERROR:",
          error
        );

        setPlacingOrder(false);

        setCheckoutMessage(
          error?.message ||
            "Paystack could not start the payment. Please try again."
        );
      },

    });

  } catch (error) {

    console.error(
      "PAYSTACK START ERROR:",
      error
    );

    setPlacingOrder(false);

    setCheckoutMessage(
      error?.message ||
        "Payment could not be started."
    );
  }
};

  /* =========================================================
     TRACKING
  ========================================================= */

  const getTrackingStep = (order) => {
    if (!order) return 0;

    const payment =
      String(order.payment_status || "").toLowerCase();

    const status =
      String(order.status || "").toLowerCase();

    if (status === "delivered") return 7;
    if (status === "out_for_delivery") return 6;
    if (
      status === "in_transit" ||
      status === "in transit"
    )
      return 5;
    if (status === "shipped") return 4;

    if (
      payment === "paid" &&
      ["processing", "confirmed", "paid"].includes(
        status
      )
    )
      return 3;

    if (payment === "paid") return 2;

    return 1;
  };

  const openTracking = (order) => {
    setSelectedOrder(order);
    setOrdersOpen(false);
    setTrackingOpen(true);
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      const productCategory = String(
        product.category || ""
      ).toLowerCase();

      const matchesCategory =
        category === "All" ||
        productCategory.includes(
          category.toLowerCase().replace("phone ", "")
        );

      const matchesSearch =
        !q ||
        String(product.name || "")
          .toLowerCase()
          .includes(q) ||
        String(product.description || "")
          .toLowerCase()
          .includes(q) ||
        productCategory.includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <>
        <style>{globalCSS}</style>

        <div className="loading-screen">
          <div className="loading-logo">S</div>
          <strong>SHINDARA PHONEFLAIR</strong>
          <span>Loading store...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalCSS}</style>

      {/* FLOWING ANNOUNCEMENT */}
      <div className="announcement">
        <div className="announcement-track">
          <span>
            ✦ SHINDARA PHONEFLAIR ✦ PREMIUM TECH
            ESSENTIALS ✦ FAST DELIVERY ✦ SECURE
            PAYMENT ✦ SHOP WITH CONFIDENCE ✦
          </span>

          <span>
            ✦ SHINDARA PHONEFLAIR ✦ PREMIUM TECH
            ESSENTIALS ✦ FAST DELIVERY ✦ SECURE
            PAYMENT ✦ SHOP WITH CONFIDENCE ✦
          </span>
        </div>
      </div>

      {/* HEADER */}
      <header className="header">
        <button
          className="logo-button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <b>SHINDARA</b>
          <small>PHONEFLAIR</small>
        </button>

        <nav className="desktop-nav">
          <button
            onClick={() =>
              document
                .getElementById("categories")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Categories
          </button>

          <button
            onClick={() =>
              document
                .getElementById("shop")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Shop
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="account-button"
            onClick={() => setAccountOpen(true)}
          >
            {user ? "Account" : "Login"}
          </button>

          <button
            className="cart-button"
            onClick={() => {
              if (!user) {
                setAccountOpen(true);
                setAuthMessage(
                  "Please login to access your cart."
                );
              } else {
                setCartOpen(true);
              }
            }}
          >
            🛒 <span>{cartCount}</span>
          </button>
        </div>
      </header>

      {/* HERO */}
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
            Premium phone accessories and everyday
            technology designed to fit your lifestyle.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("shop")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
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
            Premium technology. Beautifully selected.
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        className="categories-section"
        id="categories"
      >
        <div className="section-heading">
          <div>
            <small>EXPLORE</small>
            <h2>Shop by category</h2>
          </div>
        </div>

        <div className="category-scroll">
          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category active"
                  : "category"
              }
              onClick={() => {
                setCategory(item);

                document
                  .getElementById("shop")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
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
            <h2>Shop essentials</h2>
          </div>

          <input
            className="search"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products..."
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-products">
            <h3>No products found</h3>
            <p>
              Try another category or search term.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const stock = Number(product.stock || 0);

              return (
                <article
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-image">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                      />
                    ) : (
                      <div className="image-placeholder">
                        S
                      </div>
                    )}

                    {stock <= 0 && (
                      <span className="sold-out">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  <div className="product-info">
                    <small>
                      {product.category ||
                        "TECH ESSENTIAL"}
                    </small>

                    <h3>{product.name}</h3>

                    <p>
                      {product.description ||
                        "Premium quality tech essential."}
                    </p>

                    <div className="product-bottom">
                      <strong>
                        {money(product.price)}
                      </strong>

                      <button
                        disabled={stock <= 0}
                        onClick={() =>
                          addToCart(product)
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

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <b>SHINDARA</b>
          <span>PHONEFLAIR</span>
        </div>

        <p>
          Premium tech essentials for everyday life.
        </p>

        <small>
          © {new Date().getFullYear()} Shindara
          Phoneflair. All rights reserved.
        </small>
      </footer>

      {/* NOTICE */}
      {notice && (
        <div className="notice">
          ✓ {notice}
        </div>
      )}

      {/* =====================================================
          ACCOUNT MODAL
      ===================================================== */}

      {accountOpen && (
        <div
          className="overlay"
          onClick={() => setAccountOpen(false)}
        >
          <div
            className="modal account-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setAccountOpen(false)}
            >
              ×
            </button>

            {user ? (
              <>
                <div className="modal-heading">
                  <small>MY ACCOUNT</small>
                  <h2>Hello 👋</h2>
                  <p>{user.email}</p>
                </div>

                <label>
                  Full name
                  <input
                    value={editName}
                    onChange={(e) =>
                      setEditName(e.target.value)
                    }
                  />
                </label>

                <label>
                  Phone number
                  <input
                    value={editPhone}
                    onChange={(e) =>
                      setEditPhone(e.target.value)
                    }
                  />
                </label>

                <button
                  className="primary-button full"
                  onClick={saveProfile}
                  disabled={busy}
                >
                  {busy
                    ? "Saving..."
                    : "Save account details"}
                </button>

                <button
                  className="secondary-button full"
                  onClick={() => {
                    setAccountOpen(false);
                    setOrdersOpen(true);
                  }}
                >
                  My orders
                </button>

                <button
                  className="logout-button"
                  onClick={logout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <div className="modal-heading">
                  <small>
                    SHINDARA PHONEFLAIR
                  </small>

                  <h2>
                    {authMode === "login"
                      ? "Welcome back"
                      : "Create account"}
                  </h2>

                  <p>
                    {authMode === "login"
                      ? "Login to continue shopping."
                      : "Create an account to shop with us."}
                  </p>
                </div>

                <form onSubmit={submitAuth}>
                  {authMode === "signup" && (
                    <>
                      <label>
                        Full name
                        <input
                          value={fullName}
                          onChange={(e) =>
                            setFullName(e.target.value)
                          }
                          placeholder="Your full name"
                        />
                      </label>

                      <label>
                        Phone number
                        <input
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          placeholder="08012345678"
                        />
                      </label>
                    </>
                  )}

                  <label>
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Password"
                    />
                  </label>

                  {authMessage && (
                    <div className="form-message">
                      {authMessage}
                    </div>
                  )}

                  <button
                    className="primary-button full"
                    disabled={authBusy}
                  >
                    {authBusy
                      ? "Please wait..."
                      : authMode === "login"
                      ? "Login"
                      : "Create account"}
                  </button>
                </form>

                <button
                  className="google-button"
                  onClick={googleLogin}
                  disabled={authBusy}
                >
                  Continue with Google
                </button>

                <button
                  className="switch-auth"
                  onClick={() => {
                    setAuthMode(
                      authMode === "login"
                        ? "signup"
                        : "login"
                    );
                    setAuthMessage("");
                  }}
                >
                  {authMode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Login"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          CART
      ===================================================== */}

      {cartOpen && (
        <div
          className="overlay"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="modal cart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setCartOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>YOUR BAG</small>
              <h2>Shopping cart</h2>
              <p>
                {cartCount} item
                {cartCount === 1 ? "" : "s"}
              </p>
            </div>

            {!cart.length ? (
              <div className="empty-cart">
                <div>🛒</div>
                <h3>Your cart is empty</h3>
                <p>
                  Add products from the shop to
                  continue.
                </p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div
                      className="cart-item"
                      key={item.id}
                    >
                      <div className="cart-item-image">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                          />
                        ) : (
                          "S"
                        )}
                      </div>

                      <div className="cart-item-details">
                        <b>
                          {item.product?.name}
                        </b>

                        <span>
                          {money(
                            item.product?.price
                          )}
                        </span>

                        <div className="quantity">
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

                          <b>{item.quantity}</b>

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
                        </div>
                      </div>

                      <div className="cart-item-right">
                        <b>
                          {money(item.subtotal)}
                        </b>

                        <button
                          className="remove"
                          onClick={() =>
                            removeFromCart(item)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <strong>
                    {money(cartTotal)}
                  </strong>
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
        <div className="overlay">
          <div className="modal checkout-modal">
            <button
              className="close"
              onClick={() => {
                if (!busy)
                  setCheckoutOpen(false);
              }}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>CHECKOUT</small>
              <h2>Delivery details</h2>
              <p>
                Complete your information before
                payment.
              </p>
            </div>

            <form onSubmit={startPayment}>
              <div className="checkout-grid">
                <label>
                  Full name
                  <input
                    value={checkout.customer_name}
                    onChange={(e) =>
                      setCheckout({
                        ...checkout,
                        customer_name:
                          e.target.value,
                      })
                    }
                    placeholder="Full name"
                  />
                </label>

                <label>
                  Phone number
                  <input
                    value={checkout.customer_phone}
                    onChange={(e) =>
                      setCheckout({
                        ...checkout,
                        customer_phone:
                          e.target.value,
                      })
                    }
                    placeholder="08012345678"
                  />
                </label>
              </div>

              <label>
                Email
                <input
                  type="email"
                  value={checkout.customer_email}
                  onChange={(e) =>
                    setCheckout({
                      ...checkout,
                      customer_email:
                        e.target.value,
                    })
                  }
                  placeholder="you@example.com"
                />
              </label>

              <label>
                Delivery address
                <textarea
                  value={checkout.delivery_address}
                  onChange={(e) =>
                    setCheckout({
                      ...checkout,
                      delivery_address:
                        e.target.value,
                    })
                  }
                  placeholder="House number, street, area..."
                />
              </label>

              <div className="checkout-grid">
                <label>
                  State
                  <select
                    value={checkout.delivery_state}
                    onChange={(e) =>
                      setCheckout({
                        ...checkout,
                        delivery_state:
                          e.target.value,
                        delivery_city: "",
                      })
                    }
                  >
                    <option value="">
                      Select state
                    </option>

                    {Object.keys(states).map(
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
                </label>

                <label>
                  City
                  <select
                    value={checkout.delivery_city}
                    onChange={(e) =>
                      setCheckout({
                        ...checkout,
                        delivery_city:
                          e.target.value,
                      })
                    }
                    disabled={
                      !checkout.delivery_state
                    }
                  >
                    <option value="">
                      Select city
                    </option>

                    {(
                      states[
                        checkout.delivery_state
                      ] || []
                    ).map((city) => (
                      <option
                        key={city}
                        value={city}
                      >
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="checkout-summary">
                <span>Items</span>
                <b>{cartCount}</b>

                <span>Total</span>
                <strong>
                  {money(cartTotal)}
                </strong>
              </div>

              {checkoutMessage && (
                <div className="form-message">
                  {checkoutMessage}
                </div>
              )}

              <button
                className="primary-button full pay-button"
                disabled={busy}
              >
                {busy
                  ? "Processing payment..."
                  : `Pay ${money(cartTotal)} securely`}
              </button>

              <small className="secure-note">
                🔒 Secure payment powered by Paystack
              </small>
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
          onClick={() => setOrdersOpen(false)}
        >
          <div
            className="modal orders-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setOrdersOpen(false)}
            >
              ×
            </button>

            <div className="modal-heading">
              <small>MY ACCOUNT</small>
              <h2>My orders</h2>
              <p>
                View your paid and pending orders.
              </p>
            </div>

            {!orders.length ? (
              <div className="empty-cart">
                <div>📦</div>
                <h3>No orders yet</h3>
                <p>
                  Your orders will appear here after
                  checkout.
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <button
                    className="order-card"
                    key={order.id}
                    onClick={() =>
                      openTracking(order)
                    }
                  >
                    <div>
                      <small>
                        ORDER #{String(
                          order.id
                        ).slice(0, 8)}
                      </small>

                      <b>
                        {money(order.total)}
                      </b>
                    </div>

                    <div>
                      <span
                        className={
                          order.payment_status ===
                          "paid"
                            ? "status paid"
                            : "status pending"
                        }
                      >
                        {order.payment_status ||
                          "pending"}
                      </span>

                      <small>
                        {order.created_at
                          ? new Date(
                              order.created_at
                            ).toLocaleDateString(
                              "en-NG"
                            )
                          : ""}
                      </small>
                    </div>

                    <div className="order-arrow">
                      →
                    </div>
                  </button>
                ))}
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
          onClick={() => setTrackingOpen(false)}
        >
          <div
            className="modal tracking-modal"
            onClick={(e) => e.stopPropagation()}
          >
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
                  "Tracking number pending"}
              </h2>

              <p>
                {selectedOrder.created_at
                  ? new Date(
                      selectedOrder.created_at
                    ).toLocaleString("en-NG")
                  : ""}
              </p>
            </div>

            <div className="tracking-status-box">
              <span>Payment</span>
              <strong>
                {selectedOrder.payment_status ||
                  "pending"}
              </strong>

              <span>Reference</span>
              <strong>
                {selectedOrder.payment_reference ||
                  "—"}
              </strong>

              <span>Order status</span>
              <strong>
                {selectedOrder.status ||
                  "pending"}
              </strong>
            </div>

            <div className="timeline">
              {trackingSteps.map(
                ([title, description], index) => {
                  const current =
                    getTrackingStep(
                      selectedOrder
                    );

                  const completed =
                    index + 1 <= current;

                  return (
                    <div
                      className={
                        completed
                          ? "timeline-item completed"
                          : "timeline-item"
                      }
                      key={title}
                    >
                      <div className="timeline-dot">
                        {completed ? "✓" : ""}
                      </div>

                      <div>
                        <b>{title}</b>
                        <p>{description}</p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="order-details">
              <h3>Order details</h3>

              {(selectedOrder.items || []).map(
                (item, index) => (
                  <div
                    className="detail-item"
                    key={
                      item.id ||
                      `${item.product_id}-${index}`
                    }
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
                          Number(
                            item.quantity || 0
                          )
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>

            <div className="delivery-box">
              <h3>Delivery address</h3>

              <p>
                {selectedOrder.customer_name}
              </p>

              <p>
                {selectedOrder.customer_phone}
              </p>

              <p>
                {selectedOrder.delivery_address}
              </p>

              <p>
                {selectedOrder.delivery_city},{" "}
                {selectedOrder.delivery_state}
              </p>
            </div>

            <div className="tracking-total">
              <span>Total paid</span>
              <strong>
                {money(selectedOrder.total)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ===========================================================
   RESPONSIVE CSS
   Everything needed for mobile is included here so the
   website cannot get stuck in desktop-only layout.
=========================================================== */

const globalCSS = `
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #ffffff;
  color: #211b29;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

.loading-screen {
  min-height: 100vh;
  background: #09070d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
}

.loading-screen span {
  opacity: .55;
  font-size: 12px;
}

.loading-logo {
  width: 65px;
  height: 65px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    #7c3aed,
    #4c1d95
  );
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 900;
}

/* ================= FLOWING TOP ================= */

.announcement {
  height: 34px;
  overflow: hidden;
  background: #32105f;
  color: white;
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 2px;
}

.announcement-track {
  display: flex;
  width: max-content;
  animation: marquee 18s linear infinite;
}

.announcement-track span {
  padding-right: 70px;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

/* ================= HEADER ================= */

.header {
  height: 72px;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 0 6%;
  background: rgba(255,255,255,.94);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(54,29,78,.08);
}

.logo-button {
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0;
}

.logo-button b {
  display: block;
  color: #17131d;
  font-size: 17px;
  letter-spacing: -.5px;
}

.logo-button small {
  color: #6d28d9;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 2px;
}

.desktop-nav {
  display: flex;
  gap: 25px;
}

.desktop-nav button {
  border: 0;
  background: transparent;
  color: #4a4350;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.account-button,
.cart-button {
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
}

.account-button {
  border: 1px solid rgba(54,29,78,.12);
  background: white;
}

.cart-button {
  border: 0;
  background: #6d28d9;
  color: white;
}

/* ================= HERO ================= */

.hero {
  min-height: 620px;
  padding: 80px 7%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
  background:
    radial-gradient(
      circle at 90% 20%,
      rgba(109,40,217,.13),
      transparent 35%
    ),
    #fff;
}

.hero-copy {
  max-width: 760px;
}

.eyebrow {
  color: #6d28d9;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 3px;
  margin-bottom: 18px;
}

.hero h1 {
  margin: 0;
  font-size: clamp(50px, 8vw, 94px);
  line-height: .94;
  letter-spacing: -5px;
  font-weight: 900;
  color: #17131d;
}

.hero h1 em {
  color: #6d28d9;
  font-style: normal;
}

.hero-copy p {
  max-width: 590px;
  font-size: 16px;
  line-height: 1.7;
  color: #777080;
  margin: 28px 0;
}

.primary-button {
  border: 0;
  background: #6d28d9;
  color: white;
  padding: 15px 22px;
  border-radius: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: transform .2s, opacity .2s;
}

.primary-button:hover {
  transform: translateY(-2px);
}

.primary-button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.primary-button.full {
  width: 100%;
}

.hero-card {
  flex: 0 0 310px;
  min-height: 370px;
  border-radius: 32px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: white;
  background:
    linear-gradient(
      145deg,
      #7c3aed,
      #4c1d95 55%,
      #24123e
    );
  box-shadow:
    0 35px 70px rgba(76,29,149,.25);
}

.hero-card > span {
  margin-bottom: auto;
  font-size: 9px;
  letter-spacing: 2px;
  font-weight: 800;
  opacity: .7;
}

.hero-card strong {
  font-size: 27px;
  line-height: 1.1;
}

.hero-line {
  width: 50px;
  height: 2px;
  background: rgba(255,255,255,.7);
  margin: 20px 0;
}

.hero-card p {
  margin: 0;
  opacity: .7;
  font-size: 12px;
  line-height: 1.6;
}

/* ================= SECTIONS ================= */

.categories-section,
.shop-section {
  padding: 75px 7%;
}

.categories-section {
  background: #faf8fc;
}

.section-heading small,
.shop-top small {
  color: #6d28d9;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 2px;
}

.section-heading h2,
.shop-top h2 {
  margin: 8px 0 0;
  font-size: 36px;
  letter-spacing: -2px;
}

.category-scroll {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 5px;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category {
  flex: 0 0 auto;
  border: 1px solid rgba(54,29,78,.12);
  background: white;
  color: #514858;
  border-radius: 999px;
  padding: 12px 17px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.category.active {
  background: #6d28d9;
  border-color: #6d28d9;
  color: white;
}

.shop-top {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 25px;
  margin-bottom: 35px;
}

.search {
  width: 280px;
  max-width: 100%;
  border: 1px solid #e5dfeb;
  border-radius: 999px;
  padding: 13px 17px;
  outline: none;
}

.search:focus {
  border-color: #6d28d9;
}

.product-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  overflow: hidden;
  border: 1px solid #eee9f1;
  border-radius: 20px;
  background: white;
  transition:
    transform .2s,
    box-shadow .2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 45px rgba(30,15,45,.09);
}

.product-image {
  position: relative;
  height: 260px;
  background: #f5f1f8;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  font-size: 45px;
  font-weight: 900;
  color: #6d28d9;
}

.sold-out {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #17131d;
  color: white;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 900;
}

.product-info {
  padding: 18px;
}

.product-info small {
  color: #6d28d9;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 1px;
}

.product-info h3 {
  margin: 7px 0;
  font-size: 16px;
}

.product-info p {
  color: #837b88;
  font-size: 11px;
  line-height: 1.5;
  min-height: 34px;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 15px;
}

.product-bottom strong {
  font-size: 15px;
}

.product-bottom button {
  border: 0;
  background: #17131d;
  color: white;
  border-radius: 9px;
  padding: 9px 10px;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
}

.product-bottom button:disabled {
  opacity: .4;
}

/* ================= FOOTER ================= */

.footer {
  background: #17131d;
  color: white;
  padding: 55px 7%;
}

.footer b {
  display: block;
  font-size: 20px;
}

.footer span {
  color: #a855f7;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 2px;
}

.footer p {
  color: #aaa1b0;
  font-size: 12px;
}

.footer small {
  color: #6f6775;
}

/* ================= OVERLAY / MODALS ================= */

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(12,7,17,.62);
  backdrop-filter: blur(7px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
}

.modal {
  position: relative;
  width: min(560px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: white;
  border-radius: 25px;
  padding: 30px;
  box-shadow:
    0 30px 90px rgba(0,0,0,.25);
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #f4f1f6;
  font-size: 23px;
  cursor: pointer;
}

.modal-heading {
  margin-bottom: 25px;
  padding-right: 35px;
}

.modal-heading small {
  color: #6d28d9;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 2px;
}

.modal-heading h2 {
  margin: 7px 0;
  font-size: 30px;
  letter-spacing: -1.5px;
}

.modal-heading p {
  margin: 0;
  color: #817987;
  font-size: 12px;
  line-height: 1.5;
}

label {
  display: block;
  margin-bottom: 14px;
  color: #39313e;
  font-size: 10px;
  font-weight: 900;
}

label input,
label textarea,
label select {
  width: 100%;
  margin-top: 7px;
  border: 1px solid #e4dfe7;
  border-radius: 11px;
  background: white;
  padding: 13px;
  outline: none;
  color: #211b29;
}

label textarea {
  min-height: 90px;
  resize: vertical;
}

label input:focus,
label textarea:focus,
label select:focus {
  border-color: #6d28d9;
}

.secondary-button {
  margin-top: 10px;
  border: 1px solid #e4dfe7;
  background: white;
  color: #211b29;
  padding: 13px;
  border-radius: 11px;
  font-weight: 900;
  cursor: pointer;
}

.secondary-button.full {
  width: 100%;
}

.logout-button {
  width: 100%;
  margin-top: 10px;
  border: 0;
  background: transparent;
  color: #dc2626;
  padding: 12px;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.google-button {
  width: 100%;
  margin-top: 10px;
  border: 1px solid #e3dfe5;
  background: white;
  border-radius: 11px;
  padding: 13px;
  font-weight: 800;
  cursor: pointer;
}

.switch-auth {
  width: 100%;
  border: 0;
  background: transparent;
  color: #6d28d9;
  margin-top: 17px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.form-message {
  background: #faf2ff;
  color: #5b21b6;
  border: 1px solid #ead7fb;
  border-radius: 10px;
  padding: 11px;
  margin: 12px 0;
  font-size: 10px;
  line-height: 1.5;
}

/* ================= CART ================= */

.cart-modal {
  width: min(650px, 100%);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-item {
  display: grid;
  grid-template-columns: 65px 1fr auto;
  gap: 12px;
  align-items: center;
  border: 1px solid #eee9f1;
  border-radius: 14px;
  padding: 10px;
}

.cart-item-image {
  width: 65px;
  height: 65px;
  overflow: hidden;
  border-radius: 10px;
  background: #f4f0f6;
  display: grid;
  place-items: center;
  color: #6d28d9;
  font-weight: 900;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-details {
  min-width: 0;
}

.cart-item-details b {
  display: block;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-details > span {
  display: block;
  color: #6d28d9;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 800;
}

.quantity {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 8px;
  border: 1px solid #e8e2eb;
  border-radius: 999px;
  padding: 3px;
}

.quantity button {
  border: 0;
  background: #f4f1f6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.cart-item-right {
  text-align: right;
}

.cart-item-right b {
  display: block;
  font-size: 12px;
}

.remove {
  border: 0;
  background: transparent;
  color: #dc2626;
  font-size: 8px;
  font-weight: 900;
  margin-top: 7px;
  cursor: pointer;
}

.cart-total,
.tracking-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  margin-top: 15px;
  border-top: 1px solid #eee9f1;
}

.cart-total strong,
.tracking-total strong {
  font-size: 20px;
}

.empty-cart,
.empty-products {
  text-align: center;
  padding: 50px 20px;
}

.empty-cart > div {
  font-size: 35px;
}

.empty-cart h3 {
  margin: 12px 0 5px;
}

.empty-cart p,
.empty-products p {
  color: #837b88;
  font-size: 12px;
}

/* ================= CHECKOUT ================= */

.checkout-modal {
  width: min(680px, 100%);
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkout-summary {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  margin: 20px 0;
  padding: 18px;
  background: #faf8fc;
  border-radius: 15px;
  font-size: 11px;
}

.checkout-summary strong {
  color: #6d28d9;
  font-size: 20px;
}

.pay-button {
  padding: 16px;
}

.secure-note {
  display: block;
  text-align: center;
  margin-top: 10px;
  color: #8b8390;
  font-size: 9px;
}

/* ================= ORDERS ================= */

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-card {
  position: relative;
  width: 100%;
  border: 1px solid #eee8f1;
  background: white;
  border-radius: 15px;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr auto 20px;
  gap: 10px;
  align-items: center;
}

.order-card:hover {
  border-color: #c8a7e8;
}

.order-card small {
  display: block;
  color: #8b8290;
  font-size: 8px;
  margin-bottom: 5px;
}

.order-card b {
  display: block;
  font-size: 14px;
}

.status {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
}

.status.paid {
  background: #dcfce7;
  color: #166534;
}

.status.pending {
  background: #fef3c7;
  color: #92400e;
}

.order-arrow {
  font-size: 20px;
  color: #6d28d9;
}

/* ================= TRACKING ================= */

.tracking-modal {
  width: min(650px, 100%);
}

.tracking-status-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: #faf8fc;
  border-radius: 15px;
  padding: 16px;
  margin-bottom: 25px;
}

.tracking-status-box span {
  color: #8b8290;
  font-size: 9px;
}

.tracking-status-box strong {
  font-size: 10px;
  overflow-wrap: anywhere;
}

.timeline {
  margin: 10px 0 25px;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 12px;
  min-height: 75px;
}

.timeline-item:not(:last-child)::after {
  content: "";
  position: absolute;
  width: 2px;
  left: 16px;
  top: 34px;
  bottom: 0;
  background: #e6e0e9;
}

.timeline-item.completed:not(:last-child)::after {
  background: #8b5cf6;
}

.timeline-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eee9f2;
  color: white;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 900;
  z-index: 1;
}

.timeline-item.completed .timeline-dot {
  background: #6d28d9;
}

.timeline-item b {
  font-size: 12px;
}

.timeline-item p {
  color: #8b8290;
  font-size: 10px;
  margin: 5px 0 0;
  line-height: 1.5;
}

.order-details,
.delivery-box {
  border-top: 1px solid #eee9f1;
  padding-top: 20px;
  margin-top: 20px;
}

.order-details h3,
.delivery-box h3 {
  font-size: 13px;
  margin-top: 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 12px 0;
  border-bottom: 1px solid #f1edf3;
}

.detail-item b {
  display: block;
  font-size: 11px;
}

.detail-item span {
  display: block;
  color: #8b8290;
  font-size: 9px;
  margin-top: 4px;
}

.detail-item > strong {
  font-size: 11px;
  white-space: nowrap;
}

.delivery-box p {
  margin: 4px 0;
  color: #665d6b;
  font-size: 10px;
}

.notice {
  position: fixed;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 2000;
  background: #17131d;
  color: white;
  padding: 13px 18px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  box-shadow: 0 15px 40px rgba(0,0,0,.25);
  max-width: calc(100% - 30px);
  text-align: center;
}

/* ===========================================================
   MOBILE
=========================================================== */

@media (max-width: 900px) {
  .header {
    padding: 0 4%;
  }

  .desktop-nav {
    display: none;
  }

  .hero {
    min-height: auto;
    padding: 60px 5%;
    flex-direction: column;
    align-items: stretch;
    gap: 35px;
  }

  .hero h1 {
    font-size: clamp(47px, 15vw, 75px);
    letter-spacing: -4px;
  }

  .hero-card {
    width: 100%;
    min-height: 330px;
    flex-basis: auto;
  }

  .product-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .product-image {
    height: 210px;
  }

  .categories-section,
  .shop-section {
    padding: 55px 5%;
  }

  .shop-top {
    display: block;
  }

  .search {
    width: 100%;
    margin-top: 20px;
  }
}

@media (max-width: 600px) {
  .announcement {
    height: 30px;
    font-size: 8px;
  }

  .header {
    height: 62px;
  }

  .logo-button b {
    font-size: 15px;
  }

  .account-button,
  .cart-button {
    padding: 8px 11px;
  }

  .hero {
    padding: 50px 5% 45px;
  }

  .hero h1 {
    font-size: 48px;
    letter-spacing: -3px;
  }

  .hero-copy p {
    font-size: 14px;
  }

  .hero-card {
    min-height: 280px;
    padding: 25px;
    border-radius: 25px;
  }

  .hero-card strong {
    font-size: 23px;
  }

  .section-heading h2,
  .shop-top h2 {
    font-size: 30px;
  }

  .product-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .product-image {
    height: 175px;
  }

  .product-info {
    padding: 12px;
  }

  .product-info h3 {
    font-size: 13px;
  }

  .product-info p {
    font-size: 9px;
    min-height: 28px;
  }

  .product-bottom {
    display: block;
  }

  .product-bottom strong {
    display: block;
    margin-bottom: 8px;
  }

  .product-bottom button {
    width: 100%;
  }

  .overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    width: 100%;
    max-height: 94vh;
    border-radius: 25px 25px 0 0;
    padding: 24px 18px;
  }

  .modal-heading h
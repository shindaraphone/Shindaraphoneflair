import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient.js";
import "./shindara-redesign.css";

/* =========================================================
   SHINDARA PHONEFLAIR
   SUPABASE + PAYSTACK
   COMPLETE CUSTOMER ORDER / TRACKING FLOW
   ========================================================= */

const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

const money = value =>
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

const categoryNames = [
  "All",
  "Phone Cases",
  "Chargers",
  "Power Banks",
  "Audio",
  "Smart Watches",
  "Screen Protectors",
  "Gadgets",
];

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

  const showNotice = message => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3500);
  };

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        if (data?.session?.user) {
          setUser(data.session.user);
          await loadCustomerData(data.session.user);
        }

        await loadProducts();
      } finally {
        if (mounted) setLoading(false);
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

    if (!error) {
      setProducts(data || []);
    }
  };

  /* =========================================================
     CUSTOMER DATA
     ========================================================= */

  const loadCustomerData = async currentUser => {
    if (!currentUser) return;

    await Promise.all([
      loadProfile(currentUser),
      loadCart(currentUser),
      loadOrders(currentUser),
    ]);
  };

  const loadProfile = async currentUser => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setEditName(data.full_name || "");
      setEditPhone(data.phone || "");

      setCheckout(prev => ({
        ...prev,
        customer_name:
          data.full_name ||
          currentUser.user_metadata?.full_name ||
          "",
        customer_phone: data.phone || "",
        customer_email: currentUser.email || "",
      }));
    }
  };

  /* =========================================================
     CART
     ========================================================= */

  const loadCart = async currentUser => {
    if (!currentUser) return;

    setCartLoading(true);

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

    if (!error) {
      const formatted = (data || [])
        .filter(item => item.products)
        .map(item => ({
          ...item,
          product: item.products,
          subtotal:
            Number(item.products.price || 0) *
            Number(item.quantity || 0),
        }));

      setCartProducts(formatted);
    } else {
      setCartProducts([]);
    }

    setCartLoading(false);
  };

  const addToCart = async product => {
    if (!user) {
      setAccountOpen(true);
      setAuthMessage("Please login to add products to your cart.");
      return;
    }

    if (Number(product.stock) <= 0) {
      showNotice("This product is out of stock.");
      return;
    }

    const existing = cartProducts.find(
      item => item.product_id === product.id
    );

    if (existing) {
      const newQuantity = Number(existing.quantity) + 1;

      if (newQuantity > Number(product.stock)) {
        showNotice("You cannot add more than available stock.");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existing.id)
        .eq("user_id", user.id);

      if (error) {
        showNotice("Unable to update cart.");
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
        showNotice("Unable to add product to cart.");
        return;
      }
    }

    await loadCart(user);
    showNotice(`${product.name} added to cart.`);
  };

  const updateQuantity = async (item, change) => {
    const nextQuantity = Number(item.quantity) + change;

    if (nextQuantity <= 0) {
      await removeFromCart(item);
      return;
    }

    if (
      item.product &&
      Number(item.product.stock) > 0 &&
      nextQuantity > Number(item.product.stock)
    ) {
      showNotice("You cannot exceed available stock.");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (!error) {
      await loadCart(user);
    }
  };

  const removeFromCart = async item => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (!error) {
      await loadCart(user);
      showNotice("Item removed from cart.");
    }
  };

  const clearCart = async () => {
    if (!user) return;

    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    setCartProducts([]);
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

  const loadOrders = async currentUser => {
    if (!currentUser) return;

    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      setOrders([]);
      return;
    }

    const result = [];

    for (const order of orderData || []) {
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
            category
          )
        `)
        .eq("order_id", order.id);

      result.push({
        ...order,
        items: (items || []).map(item => ({
          ...item,
          product: item.products,
        })),
      });
    }

    setOrders(result);
  };

  /* =========================================================
     PROFILE
     ========================================================= */

  const saveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);

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

    setSavingProfile(false);

    if (error) {
      showNotice("Could not save account details.");
      return;
    }

    setProfile(prev => ({
      ...(prev || {}),
      full_name: editName.trim(),
      phone: editPhone.trim(),
    }));

    setCheckout(prev => ({
      ...prev,
      customer_name: editName.trim(),
      customer_phone: editPhone.trim(),
    }));

    showNotice("Account details saved.");
  };

  /* =========================================================
     AUTH
     ========================================================= */

  const submitAuth = async e => {
    e.preventDefault();

    setAuthLoading(true);
    setAuthMessage("");

    if (!email.trim() || !password) {
      setAuthMessage("Please enter your email and password.");
      setAuthLoading(false);
      return;
    }

    if (authMode === "signup") {
      if (!fullName.trim() || !phone.trim()) {
        setAuthMessage("Please enter your full name and phone number.");
        setAuthLoading(false);
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
        setAuthLoading(false);
        return;
      }

      if (data.user) {
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
      const { error } = await supabase.auth.signInWithPassword({
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

    setAuthLoading(false);
  };

  const googleLogin = async () => {
    setAuthLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthMessage(error.message);
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setAccountOpen(false);
    setCartOpen(false);
    setOrdersOpen(false);
    setTrackingOpen(false);
    setCartProducts([]);
    setOrders([]);
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

    if (!cartProducts.length) {
      showNotice("Your cart is empty.");
      return;
    }

    setCheckoutMessage("");

    setCheckout(prev => ({
      ...prev,
      customer_name:
        prev.customer_name ||
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "",
      customer_phone:
        prev.customer_phone ||
        profile?.phone ||
        user.user_metadata?.phone ||
        "",
      customer_email:
        prev.customer_email ||
        user.email ||
        "",
    }));

    setCartOpen(false);
    setCheckoutOpen(true);
  };

  /* =========================================================
     PAYSTACK
     ========================================================= */

  const startPaystackPayment = async e => {
    e.preventDefault();

    if (placingOrder) return;

    if (!user) {
      setCheckoutMessage("Please login again.");
      return;
    }

    if (!cartProducts.length) {
      setCheckoutMessage("Your cart is empty.");
      return;
    }

    if (
      !checkout.customer_name.trim() ||
      !checkout.customer_phone.trim() ||
      !checkout.customer_email.trim() ||
      !checkout.delivery_address.trim() ||
      !checkout.delivery_state ||
      !checkout.delivery_city
    ) {
      setCheckoutMessage("Please complete all delivery details.");
      return;
    }

    for (const item of cartProducts) {
      if (
        !item.product ||
        Number(item.product.stock) < Number(item.quantity)
      ) {
        setCheckoutMessage(
          `${item.product?.name || "A product"} no longer has enough stock.`
        );
        await loadCart(user);
        return;
      }
    }

    setPlacingOrder(true);
    setCheckoutMessage("");

    try {
      const reference = `SHP-${user.id.slice(0, 8)}-${Date.now()}`;

      const { data: duplicate } = await supabase
        .from("orders")
        .select("id,payment_status,payment_reference")
        .eq("payment_reference", reference)
        .maybeSingle();

      if (duplicate) {
        setPlacingOrder(false);
        setCheckoutMessage("This payment has already been processed.");
        return;
      }

      if (!window.PaystackPop) {
        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;

        document.body.appendChild(script);

        await new Promise(resolve => {
          script.onload = resolve;
          script.onerror = resolve;
        });
      }

      if (!window.PaystackPop) {
        setCheckoutMessage(
          "Payment system could not load. Please refresh and try again."
        );
        setPlacingOrder(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: checkout.customer_email.trim(),
        amount: Math.round(cartTotal * 100),
        currency: "NGN",
        ref: reference,

        metadata: {
          user_id: user.id,
          customer_name: checkout.customer_name.trim(),
          customer_phone: checkout.customer_phone.trim(),
        },

        callback: async response => {
          await completeSuccessfulPayment(response);
        },

        onClose: () => {
          setPlacingOrder(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error(error);
      setCheckoutMessage("Payment could not be started.");
      setPlacingOrder(false);
    }
  };

  /* =========================================================
     PAYMENT SUCCESS
     ========================================================= */

  const completeSuccessfulPayment = async paymentResponse => {
    try {
      const paymentReference =
        paymentResponse?.reference || "";

      if (!paymentReference) {
        setCheckoutMessage("Payment reference was not received.");
        setPlacingOrder(false);
        return;
      }

      /* Prevent duplicate order */
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("payment_reference", paymentReference)
        .maybeSingle();

      if (existingOrder) {
        await clearCart();
        await loadOrders(user);

        setCheckoutOpen(false);
        setPlacingOrder(false);

        const fullExisting = orders.find(
          order => order.id === existingOrder.id
        );

        setSelectedOrder(fullExisting || existingOrder);
        setOrdersOpen(true);

        showNotice("Payment already recorded. Order confirmed.");
        return;
      }

      const trackingNumber = makeTrackingNumber();

      /*
       * Order is created as PAID only after Paystack
       * returns a successful transaction reference.
       */
      const orderPayload = {
        user_id: user.id,
        customer_name: checkout.customer_name.trim(),
        customer_phone: checkout.customer_phone.trim(),
        customer_email: checkout.customer_email.trim(),
        delivery_address: checkout.delivery_address.trim(),
        delivery_state: checkout.delivery_state,
        delivery_city: checkout.delivery_city,
        total: cartTotal,
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
       * Fallback for older orders table where tracking_number
       * has not yet been added.
       */
      if (
        orderError &&
        String(orderError.message || "")
          .toLowerCase()
          .includes("tracking_number")
      ) {
        const fallbackPayload = {
          user_id: user.id,
          customer_name: checkout.customer_name.trim(),
          customer_phone: checkout.customer_phone.trim(),
          customer_email: checkout.customer_email.trim(),
          delivery_address: checkout.delivery_address.trim(),
          delivery_state: checkout.delivery_state,
          delivery_city: checkout.delivery_city,
          total: cartTotal,
          payment_status: "paid",
          payment_reference: paymentReference,
          status: "processing",
        };

        const result = await supabase
          .from("orders")
          .insert(fallbackPayload)
          .select()
          .single();

        order = result.data;
        orderError = result.error;
      }

      if (orderError || !order) {
        console.error(orderError);
        setCheckoutMessage(
          "Payment was received, but the order could not be saved. Please contact support with your payment reference: " +
            paymentReference
        );
        setPlacingOrder(false);
        return;
      }

      /* =====================================================
         SAVE ORDER ITEMS
         ===================================================== */

      const orderItems = cartProducts.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: Number(item.quantity),
        price: Number(item.product.price),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error(itemsError);
      }

      /* =====================================================
         CLEAR CART ONLY AFTER ORDER WAS SUCCESSFULLY CREATED
         ===================================================== */

      await clearCart();

      /* =====================================================
         UPDATE LOCAL STATE IMMEDIATELY
         ===================================================== */

      const completeOrder = {
        ...order,
        tracking_number:
          order.tracking_number || trackingNumber,
        items: cartProducts.map(item => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
          price: Number(item.product.price),
          product: item.product,
        })),
      };

      setOrders(prev => [completeOrder, ...prev]);

      setCheckoutOpen(false);
      setCartOpen(false);
      setPlacingOrder(false);

      setSelectedOrder(completeOrder);
      setTrackingOpen(true);

      showNotice("Payment successful! Your order is confirmed.");

      await loadOrders(user);
      await loadProducts();
    } catch (error) {
      console.error(error);

      setCheckoutMessage(
        "Your payment was received. Please contact support with your payment reference."
      );

      setPlacingOrder(false);
    }
  };

  /* =========================================================
     FILTERED PRODUCTS
     ========================================================= */

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter(product => {
      const matchesCategory =
        category === "All" ||
        String(product.category || "")
          .toLowerCase()
          .includes(category.toLowerCase().replace("phone ", ""));

      const matchesSearch =
        !q ||
        String(product.name || "")
          .toLowerCase()
          .includes(q) ||
        String(product.description || "")
          .toLowerCase()
          .includes(q) ||
        String(product.category || "")
          .toLowerCase()
          .includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  /* =========================================================
     TRACKING
     ========================================================= */

  const openOrderTracking = order => {
    setSelectedOrder(order);
    setOrdersOpen(false);
    setTrackingOpen(true);
  };

  const getTrackingStep = order => {
    const status = String(
      order?.status || "pending"
    ).toLowerCase();

    if (
      order?.payment_status === "paid" &&
      ["paid", "confirmed", "processing"].includes(status)
    ) {
      return 2;
    }

    if (
      ["shipped", "in_transit", "out_for_delivery", "delivered"].includes(
        status
      )
    ) {
      return status === "shipped"
        ? 3
        : status === "in_transit"
        ? 4
        : status === "out_for_delivery"
        ? 5
        : 6;
    }

    return 1;
  };

  const trackingSteps = [
    ["Order placed", "Your order has been received."],
    ["Payment confirmed", "Payment has been successfully confirmed."],
    ["Processing", "Your items are being prepared."],
    ["Shipped", "Your order has left our store."],
    ["In transit", "Your package is on its way."],
    ["Out for delivery", "Your package is with the delivery team."],
    ["Delivered", "Your order has been delivered."],
  ];

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#09070d",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            width: 65,
            height: 65,
            borderRadius: 20,
            background:
              "linear-gradient(135deg,#7c3aed,#4c1d95)",
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          S
        </div>
        <strong>SHINDARA PHONEFLAIR</strong>
        <span style={{ opacity: 0.6, fontSize: 12 }}>
          Loading store...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#211b29",
        fontFamily:
          "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      {/* =====================================================
          ANNOUNCEMENT
          ===================================================== */}

      <div
        style={{
          height: 32,
          background: "#32105f",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: 2,
        }}
      >
        SHINDARA PHONEFLAIR • PREMIUM TECH ESSENTIALS
      </div>

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 15,
          padding: "14px 6%",
          background: "#fff",
          borderBottom: "1px solid rgba(54,29,78,.08)",
        }}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <strong
            style={{
              display: "block",
              fontSize: 17,
              color: "#17131d",
            }}
          >
            SHINDARA
          </strong>
          <span
            style={{
              color: "#6d28d9",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            PHONEFLAIR
          </span>
        </button>

        <nav
          style={{
            display: "flex",
            gap: 18,
          }}
        >
          <button
            style={navButtonStyle}
            onClick={() =>
              document
                .getElementById("categories")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Categories
          </button>

          <button
            style={navButtonStyle}
            onClick={() =>
              document
                .getElementById("shop")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Shop
          </button>
        </nav>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setAccountOpen(true)}
            style={{
              border: "1px solid rgba(54,29,78,.12)",
              background: "#fff",
              borderRadius: 999,
              padding: "9px 13px",
              fontWeight: 800,
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            {user ? "Account" : "Login"}
          </button>

          <button
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
            style={{
              border: 0,
              background: "#6d28d9",
              color: "#fff",
              borderRadius: 999,
              padding: "9px 13px",
              fontWeight: 900,
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            🛒 {cartCount}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        style={{
          minHeight: 620,
          padding: "80px 7%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          background:
            "radial-gradient(circle at 90% 20%,rgba(109,40,217,.12),transparent 35%),#fff",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div
            style={{
              color: "#6d28d9",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 3,
              marginBottom: 18,
            }}
          >
            SHINDARA PHONEFLAIR
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(50px,8vw,94px)",
              lineHeight: 0.94,
              letterSpacing: -5,
              fontWeight: 900,
              color: "#17131d",
            }}
          >
            Tech essentials.
            <br />
            Done better.
          </h1>

          <p
            style={{
              maxWidth: 590,
              fontSize: 16,
              lineHeight: 1.7,
              color: "#777080",
              margin: "28px 0",
            }}
          >
            Premium phone accessories and everyday technology
            designed to fit your lifestyle.
          </p>

          <button
            onClick={() =>
              document
                .getElementById("shop")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            style={{
              border: 0,
              background: "#6d28d9",
              color: "#fff",
              padding: "15px 22px",
              borderRadius: 12,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Shop now →
          </button>
        </div>

        <div
          style={{
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
            boxShadow: "0 35px 70px rgba(76,29,149,.25)",
          }}
        >
          <span
            style={{
              fontSize: 9,
              letterSpacing: 2,
              fontWeight: 800,
              opacity: 0.7,
              marginBottom: "auto",
            }}
          >
            THE SHINDARA EDIT
          </span>

          <strong style={{ fontSize: 25 }}>
            Better accessories.
          </strong>

          <strong style={{ fontSize: 25 }}>
            Better everyday.
          </strong>

          <span
            style={{
              width: 45,
              height: 2,
              background: "#d8b4fe",
              margin: "20px 0",
            }}
          />

          <span
            style={{
              fontSize: 12,
              lineHeight: 1.6,
              opacity: 0.72,
            }}
          >
            Curated tech essentials for your phone and your lifestyle.
          </span>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
          ===================================================== */}

      <section
        id="categories"
        style={{
          padding: "75px 7%",
        }}
      >
        <span style={kickerStyle}>EXPLORE</span>

        <h2 style={sectionTitleStyle}>
          Shop by category
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(145px,1fr))",
            gap: 14,
          }}
        >
          {categoryNames.slice(0, 9).map(name => (
            <button
              key={name}
              onClick={() => {
                setCategory(name);
                document
                  .getElementById("shop")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                minHeight: 145,
                border: "1px solid rgba(54,29,78,.1)",
                borderRadius: 20,
                background: "#fff",
                cursor: "pointer",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 14,
                  background: "#f3edff",
                  color: "#6d28d9",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 21,
                }}
              >
                {categoryIcon(name)}
              </span>

              <strong>{name}</strong>

              <span style={{ color: "#a99fb0" }}>→</span>
            </button>
          ))}
        </div>
      </section>

      {/* =====================================================
          SHOP
          ===================================================== */}

      <section
        id="shop"
        style={{
          padding: "30px 7% 90px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: 25,
            marginBottom: 20,
          }}
        >
          <div>
            <span style={kickerStyle}>SHINDARA STORE</span>

            <h2 style={sectionTitleStyle}>
              Popular picks
            </h2>
          </div>

          <div
            style={{
              minWidth: 260,
              height: 46,
              border: "1px solid rgba(54,29,78,.1)",
              borderRadius: 999,
              padding: "0 15px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⌕</span>

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search accessories..."
              style={{
                width: "100%",
                border: 0,
                outline: 0,
                background: "transparent",
                fontSize: 12,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 18,
          }}
        >
          {categoryNames.slice(0, 8).map(name => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              style={{
                whiteSpace: "nowrap",
                border:
                  category === name
                    ? "1px solid #6d28d9"
                    : "1px solid rgba(54,29,78,.1)",
                borderRadius: 999,
                padding: "9px 14px",
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
                background:
                  category === name ? "#6d28d9" : "#fff",
                color:
                  category === name ? "#fff" : "#211b29",
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              padding: "70px 20px",
              textAlign: "center",
              borderRadius: 25,
              background: "#faf9fd",
            }}
          >
            <div
              style={{
                fontSize: 35,
                color: "#6d28d9",
              }}
            >
              ⌕
            </div>

            <h3>No products found</h3>

            <p style={{ color: "#777080" }}>
              Try another search or category.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(210px,1fr))",
              gap: 18,
            }}
          >
            {filteredProducts.slice(0, 12).map(product => (
              <article key={product.id}>
                <div
                  style={{
                    position: "relative",
                    height: 260,
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                    borderRadius: 20,
                    background: "#faf9fd",
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: 18,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 22,
                        display: "grid",
                        placeItems: "center",
                        background: "#6d28d9",
                        color: "#fff",
                        fontSize: 30,
                        fontWeight: 900,
                      }}
                    >
                      S
                    </div>
                  )}

                  {Number(product.stock) <= 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        background: "#24123e",
                        color: "#fff",
                        borderRadius: 999,
                        padding: "6px 9px",
                        fontSize: 8,
                        fontWeight: 800,
                      }}
                    >
                      OUT OF STOCK
                    </span>
                  )}
                </div>

                <div style={{ padding: "15px 3px" }}>
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: 1.5,
                      color: "#6d28d9",
                    }}
                  >
                    {product.category || "ACCESSORY"}
                  </span>

                  <h3
                    style={{
                      fontSize: 15,
                      margin: "8px 0",
                      color: "#17131d",
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      fontSize: 11,
                      lineHeight: 1.5,
                      minHeight: 34,
                      color: "#777080",
                    }}
                  >
                    {product.description ||
                      "Premium tech essential."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      marginTop: 15,
                    }}
                  >
                    <strong
                      style={{
                        color: "#6d28d9",
                        fontSize: 16,
                      }}
                    >
                      {money(product.price)}
                    </strong>

                    <button
                      disabled={Number(product.stock) <= 0}
                      onClick={() => addToCart(product)}
                      style={{
                        border: 0,
                        background:
                          Number(product.stock) <= 0
                            ? "#aaa"
                            : "#6d28d9",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontSize: 9,
                        fontWeight: 800,
                        cursor:
                          Number(product.stock) <= 0
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {Number(product.stock) <= 0
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 15,
          padding: "65px 7%",
          background: "#24123e",
        }}
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
        ].map(([icon, title, text]) => (
          <div
            key={title}
            style={{
              padding: 28,
              borderRadius: 22,
              background: "rgba(255,255,255,.07)",
              border:
                "1px solid rgba(255,255,255,.1)",
              color: "#fff",
            }}
          >
            <span
              style={{
                color: "#d8b4fe",
                fontSize: 25,
              }}
            >
              {icon}
            </span>

            <h3>{title}</h3>

            <p style={{ opacity: 0.65 }}>
              {text}
            </p>
          </div>
        ))}
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer
        style={{
          padding: "60px 7% 25px",
          background: "#160d24",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 900,
          }}
        >
          SHINDARA PHONEFLAIR
        </div>

        <p
          style={{
            color: "rgba(255,255,255,.55)",
            maxWidth: 400,
            fontSize: 12,
          }}
        >
          Premium phone accessories and everyday technology.
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            margin: "30px 0",
          }}
        >
          <button
            onClick={() => setAccountOpen(true)}
            style={footerButtonStyle}
          >
            My account
          </button>

          <button
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
            style={footerButtonStyle}
          >
            My cart
          </button>
        </div>

        <div
          style={{
            borderTop:
              "1px solid rgba(255,255,255,.08)",
            paddingTop: 20,
            color: "rgba(255,255,255,.4)",
            fontSize: 10,
          }}
        >
          © 2026 Shindara Phoneflair
        </div>
      </footer>

      {notice && (
        <div
          style={{
            position: "fixed",
            zIndex: 1000,
            left: "50%",
            bottom: 25,
            transform: "translateX(-50%)",
            background: "#24123e",
            color: "#fff",
            padding: "13px 18px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          {notice}
        </div>
      )}

      {/* =====================================================
          CART
          ===================================================== */}

      {cartOpen && user && (
        <div
          style={overlayStyle}
          onClick={() => setCartOpen(false)}
        >
          <aside
            style={{
              width: "min(520px,100%)",
              height: "100%",
              background: "#fff",
              padding: 25,
              overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 25,
              }}
            >
              <div>
                <span style={kickerStyle}>
                  YOUR SHOPPING
                </span>

                <h2
                  style={{
                    margin: "7px 0",
                    fontSize: 35,
                  }}
                >
                  Cart
                </h2>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                style={closeStyle}
              >
                ×
              </button>
            </div>

            {cartLoading ? (
              <div style={emptyStyle}>
                Loading cart...
              </div>
            ) : cartProducts.length === 0 ? (
              <div style={emptyStyle}>
                <div style={{ fontSize: 40 }}>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add something beautiful to get started.</p>
              </div>
            ) : (
              <>
                {cartProducts.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "65px 1fr auto",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >
                    <div
                      style={{
                        width: 65,
                        height: 65,
                        borderRadius: 15,
                        background: "#f3edff",
                      }}
                    >
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: 15,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "grid",
                            placeItems: "center",
                            color: "#6d28d9",
                            fontWeight: 900,
                          }}
                        >
                          S
                        </div>
                      )}
                    </div>

                    <div>
                      <strong>
                        {item.product?.name}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          color: "#777080",
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {money(item.product?.price)}
                      </span>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginTop: 7,
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item, -1)
                          }
                        >
                          −
                        </button>

                        <b>{item.quantity}</b>

                        <button
                          onClick={() =>
                            updateQuantity(item, 1)
                          }
                        >
                          +
                        </button>

                        <button
                          onClick={() =>
                            removeFromCart(item)
                          }
                          style={{
                            border: 0,
                            background: "transparent",
                            color: "#c02675",
                            fontSize: 9,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <strong>
                      {money(item.subtotal)}
                    </strong>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: 25,
                    paddingTop: 20,
                    borderTop:
                      "1px solid #eee",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>Subtotal</span>
                    <strong>
                      {money(cartTotal)}
                    </strong>
                  </div>

                  <button
                    onClick={openCheckout}
                    style={checkoutButtonStyle}
                  >
                    Continue to checkout →
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
          style={overlayStyle}
          onClick={() => setAccountOpen(false)}
        >
          <div
            style={modalStyle}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setAccountOpen(false)}
              style={modalCloseStyle}
            >
              ×
            </button>

            {user ? (
              <>
                <span style={kickerStyle}>
                  CUSTOMER ACCOUNT
                </span>

                <h2 style={modalTitleStyle}>
                  My account
                </h2>

                <p style={{ color: "#777080" }}>
                  {user.email}
                </p>

                <label style={labelStyle}>
                  Full name
                </label>

                <input
                  value={editName}
                  onChange={e =>
                    setEditName(e.target.value)
                  }
                  style={inputStyle}
                />

                <label style={labelStyle}>
                  Phone number
                </label>

                <input
                  value={editPhone}
                  onChange={e =>
                    setEditPhone(e.target.value)
                  }
                  style={inputStyle}
                />

                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  style={authButtonStyle}
                >
                  {savingProfile
                    ? "Saving..."
                    : "Save account details"}
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 10,
                    margin: "25px 0",
                  }}
                >
                  <button
                    style={accountCardStyle}
                    onClick={() => {
                      setAccountOpen(false);
                      setCartOpen(true);
                    }}
                  >
                    🛒
                    <strong>My cart</strong>
                    <small>{cartCount} items</small>
                  </button>

                  <button
                    style={accountCardStyle}
                    onClick={() => {
                      setAccountOpen(false);
                      setOrdersOpen(true);
                    }}
                  >
                    📦
                    <strong>My orders</strong>
                    <small>{orders.length} orders</small>
                  </button>
                </div>

                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    border:
                      "1px solid rgba(155,44,112,.2)",
                    background: "transparent",
                    color: "#c02675",
                    borderRadius: 12,
                    padding: 13,
                    fontWeight: 800,
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <span style={kickerStyle}>
                  SHINDARA ACCOUNT
                </span>

                <h2 style={modalTitleStyle}>
                  {authMode === "login"
                    ? "Welcome back."
                    : "Create your account."}
                </h2>

                <p style={{ color: "#777080" }}>
                  Login to shop and keep your personal cart saved.
                </p>

                <button
                  onClick={googleLogin}
                  disabled={authLoading}
                  style={googleButtonStyle}
                >
                  <b style={{ fontSize: 18 }}>G</b>
                  Continue with Google
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#918795",
                    fontSize: 9,
                    margin: "18px 0",
                  }}
                >
                  <span style={{ flex: 1, height: 1, background: "#eee" }} />
                  OR
                  <span style={{ flex: 1, height: 1, background: "#eee" }} />
                </div>

                <form onSubmit={submitAuth}>
                  {authMode === "signup" && (
                    <>
                      <label style={labelStyle}>
                        Full name
                      </label>

                      <input
                        value={fullName}
                        onChange={e =>
                          setFullName(e.target.value)
                        }
                        placeholder="Your full name"
                        style={inputStyle}
                      />

                      <label style={labelStyle}>
                        Phone number
                      </label>

                      <input
                        value={phone}
                        onChange={e =>
                          setPhone(e.target.value)
                        }
                        placeholder="080..."
                        style={inputStyle}
                      />
                    </>
                  )}

                  <label style={labelStyle}>
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={e =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    style={inputStyle}
                  />

                  <label style={labelStyle}>
                    Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={e =>
                      setPassword(e.target.value)
                    }
                    placeholder="Your password"
                    style={inputStyle}
                  />

                  {authMessage && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 11,
                        borderRadius: 10,
                        background: "#fff0f6",
                        color: "#9b2c70",
                        fontSize: 11,
                      }}
                    >
                      {authMessage}
                    </div>
                  )}

                  <button
                    disabled={authLoading}
                    style={authButtonStyle}
                  >
                    {authLoading
                      ? "Please wait..."
                      : authMode === "login"
                      ? "Login"
                      : "Create account"}
                  </button>
                </form>

                <button
                  onClick={() => {
                    setAuthMessage("");
                    setAuthMode(
                      authMode === "login"
                        ? "signup"
                        : "login"
                    );
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 16,
                    border: 0,
                    background: "transparent",
                    color: "#6d28d9",
                    fontSize: 11,
                    fontWeight: 750,
                  }}
                >
                  {authMode === "login"
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
        <div style={overlayStyle}>
          <div style={checkoutModalStyle}>
            <button
              onClick={() => setCheckoutOpen(false)}
              style={modalCloseStyle}
            >
              ×
            </button>

            <span style={kickerStyle}>
              SHINDARA CHECKOUT
            </span>

            <h2 style={modalTitleStyle}>
              Delivery details
            </h2>

            <p style={{ color: "#777080" }}>
              Total: <strong>{money(cartTotal)}</strong>
            </p>

            <form onSubmit={startPaystackPayment}>
              <label style={labelStyle}>
                Full name
              </label>

              <input
                value={checkout.customer_name}
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    customer_name: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <label style={labelStyle}>
                Phone
              </label>

              <input
                value={checkout.customer_phone}
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    customer_phone: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <label style={labelStyle}>
                Email
              </label>

              <input
                type="email"
                value={checkout.customer_email}
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    customer_email: e.target.value,
                  })
                }
                style={inputStyle}
              />

              <label style={labelStyle}>
                Delivery address
              </label>

              <textarea
                value={checkout.delivery_address}
                onChange={e =>
                  setCheckout({
                    ...checkout,
                    delivery_address: e.target.value,
                  })
                }
                placeholder="House number, street..."
                style={{
                  ...inputStyle,
                  height: 85,
                  padding: 13,
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    State
                  </label>

                  <select
                    value={checkout.delivery_state}
                    onChange={e =>
                      setCheckout({
                        ...checkout,
                        delivery_state: e.target.value,
                        delivery_city: "",
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Select state
                    </option>

                    {Object.keys(cleanStates).map(state => (
                      <option key={state} value={state}>
                        {state.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    City
                  </label>

                  <select
                    value={checkout.delivery_city}
                    disabled={!checkout.delivery_state}
                    onChange={e =>
                      setCheckout({
                        ...checkout,
                        delivery_city: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      {checkout.delivery_state
                        ? "Select city"
                        : "Select state first"}
                    </option>

                    {(
                      cleanStates[
                        checkout.delivery_state
                      ] || []
                    ).map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {checkoutMessage && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 11,
                    borderRadius: 10,
                    background: "#fff0f6",
                    color: "#9b2c70",
                    fontSize: 11,
                    lineHeight: 1.5,
                  }}
                >
                  {checkoutMessage}
                </div>
              )}

              <button
                disabled={placingOrder}
                style={checkoutButtonStyle}
              >
                {placingOrder
                  ? "Processing payment..."
                  : `Pay ${money(cartTotal)} with Paystack →`}
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
          style={overlayStyle}
          onClick={() => setOrdersOpen(false)}
        >
          <div
            style={ordersModalStyle}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOrdersOpen(false)}
              style={modalCloseStyle}
            >
              ×
            </button>

            <span style={kickerStyle}>
              SHINDARA
            </span>

            <h2 style={modalTitleStyle}>
              Your orders
            </h2>

            {orders.length === 0 ? (
              <div style={emptyStyle}>
                <div style={{ fontSize: 40 }}>📦</div>
                <h3>No orders yet</h3>
                <p>Your orders will appear here.</p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 25,
                }}
              >
                {orders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      border:
                        "1px solid rgba(54,29,78,.1)",
                      borderRadius: 18,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <strong>
                          Order #
                          {String(order.id).slice(0, 8)}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: 5,
                            color: "#89808e",
                            fontSize: 9,
                          }}
                        >
                          {order.created_at
                            ? new Date(
                                order.created_at
                              ).toLocaleDateString(
                                "en-NG",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Date unavailable"}
                        </span>

                        <span
                          style={{
                            display: "block",
                            marginTop: 5,
                            color: "#6d28d9",
                            fontSize: 9,
                            fontWeight: 800,
                          }}
                        >
                          Tracking:{" "}
                          {order.tracking_number ||
                            "Being generated"}
                        </span>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <strong>
                          {money(order.total)}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: 6,
                            background:
                              order.payment_status ===
                              "paid"
                                ? "#e9f8ef"
                                : "#fff4df",
                            color:
                              order.payment_status ===
                              "paid"
                                ? "#168447"
                                : "#a66b00",
                            borderRadius: 999,
                            padding:
                              "5px 8px",
                            fontSize: 8,
                            fontWeight: 900,
                          }}
                        >
                          {String(
                            order.payment_status ||
                              order.status ||
                              "pending"
                          ).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {order.payment_reference && (
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 9,
                          color: "#777080",
                        }}
                      >
                        Payment reference:{" "}
                        <strong>
                          {order.payment_reference}
                        </strong>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        openOrderTracking(order)
                      }
                      style={{
                        width: "100%",
                        marginTop: 14,
                        border: 0,
                        background: "#6d28d9",
                        color: "#fff",
                        borderRadius: 11,
                        padding: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      View full order & track →
                    </button>
                  </div>
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
          style={overlayStyle}
          onClick={() => setTrackingOpen(false)}
        >
          <div
            style={{
              width:
                "min(700px,calc(100% - 25px))",
              maxHeight: "92vh",
              overflowY: "auto",
              margin: "auto",
              borderRadius: 25,
              padding: 28,
              background: "#fff",
              position: "relative",
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setTrackingOpen(false)}
              style={modalCloseStyle}
            >
              ×
            </button>

            <span style={kickerStyle}>
              SHINDARA ORDER TRACKING
            </span>

            <h2 style={modalTitleStyle}>
              Track your order
            </h2>

            <div
              style={{
                padding: 18,
                borderRadius: 18,
                background: "#f7f3ff",
                marginTop: 20,
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#777080",
                  fontSize: 9,
                  fontWeight: 800,
                }}
              >
                TRACKING NUMBER
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: 5,
                  color: "#6d28d9",
                  fontSize: 20,
                  letterSpacing: 1,
                }}
              >
                {selectedOrder.tracking_number ||
                  "Being generated"}
              </strong>
            </div>

            {/* TIMELINE */}

            <div
              style={{
                marginTop: 30,
              }}
            >
              {trackingSteps.map(
                ([title, text], index) => {
                  const current =
                    getTrackingStep(selectedOrder);

                  const done = index <= current;

                  return (
                    <div
                      key={title}
                      style={{
                        display: "flex",
                        gap: 14,
                        minHeight:
                          index ===
                          trackingSteps.length - 1
                            ? 55
                            : 75,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 27,
                            height: 27,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            background: done
                              ? "#6d28d9"
                              : "#eee",
                            color: done
                              ? "#fff"
                              : "#999",
                            fontSize: 11,
                            fontWeight: 900,
                          }}
                        >
                          {done ? "✓" : index + 1}
                        </div>

                        {index <
                          trackingSteps.length - 1 && (
                          <div
                            style={{
                              width: 2,
                              flex: 1,
                              background:
                                index <
                                current
                                  ? "#6d28d9"
                                  : "#eee",
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <strong
                          style={{
                            color: done
                              ? "#17131d"
                              : "#aaa",
                          }}
                        >
                          {title}
                        </strong>

                        <p
                          style={{
                            margin:
                              "4px 0 0",
                            fontSize: 10,
                            color:
                              done
                                ? "#777080"
                                : "#aaa",
                          }}
                        >
                          {text}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* ORDER DETAILS */}

            <div
              style={{
                marginTop: 25,
                paddingTop: 25,
                borderTop:
                  "1px solid #eee",
              }}
            >
              <h3>Order details</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: 10,
                  fontSize: 11,
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#999",
                      fontSize: 8,
                    }}
                  >
                    ORDER DATE
                  </span>

                  <strong>
                    {selectedOrder.created_at
                      ? new Date(
                          selectedOrder.created_at
                        ).toLocaleString(
                          "en-NG"
                        )
                      : "-"}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#999",
                      fontSize: 8,
                    }}
                  >
                    PAYMENT
                  </span>

                  <strong>
                    {String(
                      selectedOrder.payment_status ||
                        "pending"
                    ).toUpperCase()}
                  </strong>
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: "#999",
                      fontSize: 8,
                    }}
                  >
                    PAYMENT REFERENCE
                  </span>

                  <strong>
                    {selectedOrder.payment_reference ||
                      "-"}
                  </strong>
                </div>

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: "#999",
                      fontSize: 8,
                    }}
                  >
                    DELIVERY ADDRESS
                  </span>

                  <strong>
                    {selectedOrder.delivery_address}
                    {selectedOrder.delivery_city
                      ? `, ${selectedOrder.delivery_city}`
                      : ""}
                    {selectedOrder.delivery_state
                      ? `, ${String(
                          selectedOrder.delivery_state
                        ).replace("_", " ")}`
                      : ""}
                  </strong>
                </div>
              </div>
            </div>

            {/* ITEMS */}

            <div
              style={{
                marginTop: 25,
                paddingTop: 25,
                borderTop:
                  "1px solid #eee",
              }}
            >
              <h3>Items purchased</h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {(selectedOrder.items || []).map(
                  item => (
                    <div
                      key={item.id || item.product_id}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "55px 1fr auto",
                        gap: 12,
                        alignItems:
                          "center",
                        padding:
                          "10px 0",
                        borderBottom:
                          "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          width: 55,
                          height: 55,
                          borderRadius: 12,
                          background:
                            "#f7f3ff",
                        }}
                      >
                        {item.product?.image_url ? (
                          <img
                            src={
                              item.product
                                .image_url
                            }
                            alt={
                              item.product
                                .name
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "contain",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              height:
                                "100%",
                              display:
                                "grid",
                              placeItems:
                                "center",
                              color:
                                "#6d28d9",
                              fontWeight:
                                900,
                            }}
                          >
                            S
                          </div>
                        )}
                      </div>

                      <div>
                        <strong>
                          {item.product?.name ||
                            "Product"}
                        </strong>

                        <span
                          style={{
                            display:
                              "block",
                            marginTop:
                              4,
                            color:
                              "#777080",
                            fontSize:
                              10,
                          }}
                        >
                          Quantity:{" "}
                          {item.quantity}
                        </span>

                        <span
                          style={{
                            display:
                              "block",
                            color:
                              "#777080",
                            fontSize:
                              10,
                          }}
                        >
                          Unit price:{" "}
                          {money(
                            item.price
                          )}
                        </span>
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

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginTop: 18,
                  fontSize: 16,
                }}
              >
                <strong>Total</strong>

                <strong
                  style={{
                    color: "#6d28d9",
                  }}
                >
                  {money(
                    selectedOrder.total
                  )}
                </strong>
              </div>
            </div>

            <button
              onClick={() => {
                setTrackingOpen(false);
                setOrdersOpen(true);
              }}
              style={{
                width: "100%",
                marginTop: 25,
                border:
                  "1px solid #6d28d9",
                background: "#fff",
                color: "#6d28d9",
                borderRadius: 12,
                padding: 13,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ← Back to my orders
            </button>
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
  const v = String(name).toLowerCase();

  if (v.includes("case")) return "◈";
  if (v.includes("charger")) return "⚡";
  if (v.includes("audio")) return "◉";
  if (v.includes("power")) return "◒";
  if (v.includes("watch")) return "⌚";
  if (v.includes("cable")) return "⌁";
  if (v.includes("ear")) return "◉";
  if (v.includes("screen")) return "▣";
  if (v.includes("phone")) return "▱";

  return "✦";
}

/* =========================================================
   UI STYLES
   ========================================================= */

const navButtonStyle = {
  border: 0,
  background: "transparent",
  fontWeight: 700,
  fontSize: 11,
  cursor: "pointer",
};

const kickerStyle = {
  color: "#6d28d9",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: 2.5,
};

const sectionTitleStyle = {
  margin: "8px 0 30px",
  fontSize: "clamp(31px,5vw,50px)",
  lineHeight: 1,
  letterSpacing: -2,
  fontWeight: 900,
  color: "#17131d",
};

const footerButtonStyle = {
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.05)",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 13px",
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 500,
  background: "rgba(18,8,28,.68)",
  backdropFilter: "blur(12px)",
  display: "flex",
  justifyContent: "flex-end",
};

const closeStyle = {
  border: 0,
  background: "#f3edff",
  color: "#4c1d95",
  width: 40,
  height: 40,
  borderRadius: "50%",
  fontSize: 24,
  cursor: "pointer",
};

const emptyStyle = {
  padding: "70px 20px",
  textAlign: "center",
  color: "#8a8090",
};

const modalStyle = {
  width: "min(460px,calc(100% - 30px))",
  maxHeight: "92vh",
  overflowY: "auto",
  margin: "auto",
  borderRadius: 25,
  padding: 28,
  position: "relative",
  background: "#fff",
};

const checkoutModalStyle = {
  width: "min(560px,calc(100% - 25px))",
  maxHeight: "92vh",
  overflowY: "auto",
  margin: "auto",
  borderRadius: 25,
  padding: 28,
  position: "relative",
  background: "#fff",
};

const ordersModalStyle = {
  width: "min(650px,calc(100% - 25px))",
  maxHeight: "85vh",
  overflowY: "auto",
  margin: "auto",
  borderRadius: 25,
  padding: 28,
  position: "relative",
  background: "#fff",
};

const modalCloseStyle = {
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
};

const modalTitleStyle = {
  margin: "8px 0",
  fontSize: 34,
  lineHeight: 1,
  color: "#17131d",
};

const labelStyle = {
  display: "block",
  color: "#6d6470",
  fontSize: 10,
  fontWeight: 800,
  margin: "13px 0 6px",
};

const inputStyle = {
  width: "100%",
  height: 45,
  padding: "0 13px",
  border: "1px solid rgba(54,29,78,.14)",
  borderRadius: 11,
  outline: 0,
  background: "#faf9fd",
  color: "#211b29",
  boxSizing: "border-box",
};

const authButtonStyle = {
  width: "100%",
  marginTop: 18,
  border: 0,
  borderRadius: 12,
  padding: 14,
  background: "#6d28d9",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const googleButtonStyle = {
  width: "100%",
  border: "1px solid rgba(54,29,78,.14)",
  background: "#fff",
  color: "#211b29",
  borderRadius: 12,
  padding: 13,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
};

const accountCardStyle = {
  textAlign: "left",
  border: "1px solid rgba(54,29,78,.1)",
  borderRadius: 15,
  padding: 15,
  display: "flex",
  flexDirection: "column",
  gap: 7,
  cursor: "pointer",
  background: "#fff",
};

const checkoutButtonStyle = {
  width: "100%",
  border: 0,
  background: "#6d28d9",
  color: "#fff",
  padding: 15,
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
  marginTop: 18,
};
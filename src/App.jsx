import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP = "2348118294548";
const TIKTOK = "https://www.tiktok.com/@shindara.communication";
const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

const NIGERIA = {
  Abia: ["Aba", "Umuahia"],
  Adamawa: ["Yola", "Mubi", "Jimeta"],
  Anambra: ["Awka", "Onitsha", "Nnewi"],
  Bauchi: ["Bauchi", "Azare"],
  Bayelsa: ["Yenagoa"],
  Benue: ["Makurdi", "Gboko", "Otukpo"],
  Borno: ["Maiduguri", "Biu"],
  CrossRiver: ["Calabar", "Ikom", "Ogoja"],
  Delta: ["Asaba", "Warri", "Sapele"],
  Ebonyi: ["Abakaliki"],
  Edo: ["Benin City", "Auchi", "Ekpoma"],
  Ekiti: ["Ado-Ekiti", "Ikere"],
  Enugu: ["Enugu", "Nsukka"],
  FCT: ["Abuja", "Gwagwalada", "Kuje", "Bwari"],
  Gombe: ["Gombe", "Kaltungo"],
  Imo: ["Owerri", "Orlu", "Okigwe"],
  Jigawa: ["Dutse", "Hadejia"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan"],
  Kano: ["Kano", "Wudil"],
  Katsina: ["Katsina", "Funtua", "Daura"],
  Kebbi: ["Birnin Kebbi", "Argungu"],
  Kogi: ["Lokoja", "Okene", "Idah"],
  Kwara: ["Ilorin", "Offa", "Omu-Aran"],
  Lagos: [
    "Ikeja",
    "Lagos Island",
    "Lekki",
    "Victoria Island",
    "Surulere",
    "Yaba",
    "Agege",
    "Alimosho",
    "Ikorodu",
    "Badagry",
  ],
  Nasarawa: ["Lafia", "Keffi", "Akwanga"],
  Niger: ["Minna", "Suleja", "Bida"],
  Ogun: ["Abeokuta", "Ijebu-Ode", "Sagamu", "Ota"],
  Ondo: ["Akure", "Ondo", "Owo"],
  Osun: ["Osogbo", "Ile-Ife", "Ilesa"],
  Oyo: ["Ibadan", "Ogbomosho", "Oyo", "Iseyin"],
  Plateau: ["Jos", "Bukuru", "Pankshin"],
  Rivers: ["Port Harcourt", "Bonny", "Obio-Akpor"],
  Sokoto: ["Sokoto", "Tambuwal"],
  Taraba: ["Jalingo", "Wukari"],
  Yobe: ["Damaturu", "Potiskum"],
  Zamfara: ["Gusau", "Kaura Namoda"],
};

const STATES = Object.keys(NIGERIA).map((s) =>
  s === "FCT" ? "Federal Capital Territory" : s
);

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function citiesForState(state) {
  if (!state) return [];
  const key =
    state === "Federal Capital Territory" ? "FCT" : state;
  return NIGERIA[key] || [];
}

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve(window.PaystackPop);

    const existing = document.querySelector(
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () =>
        window.PaystackPop
          ? resolve(window.PaystackPop)
          : reject(new Error("Paystack could not be loaded."))
      );
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;

    script.onload = () =>
      window.PaystackPop
        ? resolve(window.PaystackPop)
        : reject(new Error("Paystack could not be loaded."));

    script.onerror = () =>
      reject(new Error("Unable to load Paystack."));

    document.body.appendChild(script);
  });
}

function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState("profile");

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileState, setProfileState] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");

  const cartCount = useMemo(
    () => cart.reduce((a, x) => a + Number(x.quantity || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (a, x) =>
          a +
          Number(x.price || 0) *
            Number(x.quantity || 0),
        0
      ),
    [cart]
  );

  const checkoutCities = citiesForState(deliveryState);
  const profileCities = citiesForState(profileState);

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
        loadProducts
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const current = data?.user || null;
      setUser(current);

      if (current) await loadProfile(current.id);
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;

      const current = session?.user || null;
      setUser(current);

      if (current) {
        await loadProfile(current.id);
      } else {
        setProfile(null);
        setOrders([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setProductsError("We couldn't load our products right now.");
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
      console.error("Profile error:", error);
      return;
    }

    setProfile(data || null);

    if (data) {
      setProfileName(data.name || "");
      setProfilePhone(data.phone || "");
      setProfileCity(data.city || "");
      setProfileState(data.state || "");

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
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setOrdersError("We couldn't load your orders right now.");
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  }

  async function openAccount() {
    setAuthMessage("");
    setSettingsMessage("");
    setAccountOpen(true);

    if (user) {
      await loadProfile(user.id);
      await loadOrders();
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "signup") {
        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim();

        if (!cleanName || !cleanPhone || !cleanEmail) {
          setAuthMessage("Please complete all fields.");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone,
            },
          },
        });

        if (error) throw error;

        if (data?.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              name: cleanName,
              phone: cleanPhone,
              city: "",
              state: "",
              email: cleanEmail,
            });

          if (profileError) console.error(profileError);
        }

        setAuthMessage(
          data?.session
            ? "Account created successfully!"
            : "Account created! Please check your email to confirm your account."
        );

        setPassword("");

        if (data?.session) {
          setAccountOpen(false);
          setFullName("");
          setEmail("");
          setPhone("");
        }

        return;
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      if (data?.user) await loadProfile(data.user.id);

      setEmail("");
      setPassword("");
      setAccountOpen(false);
    } catch (error) {
      setAuthMessage(error?.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function signInWithProvider(provider) {
    setAuthLoading(true);
    setAuthMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });

    if (error) {
      setAuthMessage(error.message);
      setAuthLoading(false);
    }
  }

  async function saveProfileSettings(e) {
    e.preventDefault();

    if (!user) return;

    setSettingsLoading(true);
    setSettingsMessage("");

    try {
      const cleanName = profileName.trim();
      const cleanPhone = profilePhone.trim();
      const cleanCity = profileCity.trim();
      const cleanState = profileState.trim();

      if (!cleanName) {
        setSettingsMessage("Please enter your name.");
        return;
      }

      if (!cleanPhone) {
        setSettingsMessage("Please enter your phone number.");
        return;
      }

      if (!cleanState) {
        setSettingsMessage("Please select your state.");
        return;
      }

      if (!cleanCity) {
        setSettingsMessage("Please select or enter your city.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: cleanName,
          phone: cleanPhone,
          city: cleanCity,
          state: cleanState,
          email: user.email || "",
        });

      if (error) throw error;

      await loadProfile(user.id);

      setSettingsMessage("Your profile has been updated successfully.");
    } catch (error) {
      console.error(error);
      setSettingsMessage(
        error?.message || "Unable to update your profile."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordMessage(error.message);
      return;
    }

    setNewPassword("");
    setPasswordMessage("Password changed successfully.");
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrders([]);
    setAccountOpen(false);
  }

  async function resetPassword(e) {
    e.preventDefault();

    if (!resetEmail.trim()) {
      setResetMessage("Enter your email address.");
      return;
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        { redirectTo: window.location.origin }
      );

    setResetMessage(
      error
        ? error.message
        : "Password reset link sent. Check your email."
    );
  }

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find((x) => x.id === product.id);

      if (existing) {
        return items.map((x) =>
          x.id === product.id
            ? { ...x, quantity: x.quantity + 1 }
            : x
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });
  }

  function increaseQuantity(id) {
    setCart((items) =>
      items.map((x) =>
        x.id === id ? { ...x, quantity: x.quantity + 1 } : x
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((items) =>
      items
        .map((x) =>
          x.id === id ? { ...x, quantity: x.quantity - 1 } : x
        )
        .filter((x) => x.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((items) => items.filter((x) => x.id !== id));
  }

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
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_address: deliveryAddress.trim(),
        delivery_city: deliveryCity.trim(),
        delivery_state: deliveryState.trim(),
        total: cartTotal,
        status: "paid",
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
      image_url: item.image_url || null,
    }));

    const { error: itemError } =
      await supabase.from("order_items").insert(items);

    if (itemError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemError;
    }

    return order;
  }

  async function placeOrder(e) {
    e.preventDefault();

    if (!user) {
      setOrderMessage("Please sign in before ordering.");
      return;
    }

    if (!cart.length) {
      setOrderMessage("Your cart is empty.");
      return;
    }

    setOrderLoading(true);
    setOrderMessage("");

    try {
      const PaystackPop = await loadPaystackScript();

      const popup = new PaystackPop();

      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(cartTotal * 100),
        currency: "NGN",

        metadata: {
          user_id: user.id,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          delivery_city: deliveryCity.trim(),
          delivery_state: deliveryState.trim(),
        },

        onSuccess: async (transaction) => {
          try {
            setOrderMessage("Payment successful. Verifying...");

            const { data, error } =
              await supabase.functions.invoke(
                "verify-paystack-payment",
                {
                  body: {
                    reference: transaction.reference,
                  },
                }
              );

            if (error) throw error;

            if (!data?.success) {
              throw new Error(
                data?.error || "Payment verification failed."
              );
            }

            const order = await saveOrder(
              transaction.reference
            );

            setOrderSuccess(true);
            setOrderMessage(
              `Order placed successfully! Order #${String(
                order.id
              )
                .slice(0, 8)
                .toUpperCase()}`
            );

            setCart([]);
            setCustomerName("");
            setCustomerPhone("");
            setDeliveryAddress("");
            setDeliveryCity("");
            setDeliveryState("");
          } catch (error) {
            console.error(error);
            setOrderMessage(
              error?.message ||
                "Payment was received, but the order could not be completed."
            );
          } finally {
            setOrderLoading(false);
          }
        },

        onCancel: () => {
          setOrderLoading(false);
          setOrderMessage("Payment cancelled.");
        },
      });
    } catch (error) {
      setOrderMessage(error.message);
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
    return date
      ? new Date(date).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
  }

  const css = `
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{margin:0;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;background:#f7f7f8;color:#111}
    button,input,select{font:inherit}
    button{cursor:pointer}
    .app{min-height:100vh;background:radial-gradient(circle at 15% 10%,rgba(124,58,237,.08),transparent 28%),radial-gradient(circle at 85% 20%,rgba(59,130,246,.08),transparent 25%),#f7f7f8}
    .announcement{overflow:hidden;background:#111;color:white;padding:10px 0;white-space:nowrap}
    .track{width:max-content;display:flex;animation:marquee 22s linear infinite}
    .track span{margin-right:70px;font-size:12px;font-weight:700}
    @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    header{position:sticky;top:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;padding:15px 6%;background:rgba(255,255,255,.84);backdrop-filter:blur(20px);border-bottom:1px solid #eee}
    .logo{font-weight:800;font-size:20px;text-decoration:none;color:#111;line-height:1}
    .logo small{display:block;font-size:10px;letter-spacing:2px;margin-top:5px;opacity:.5}
    nav{display:flex;gap:25px}nav a{text-decoration:none;color:#111;font-size:14px;font-weight:600}
    .actions{display:flex;gap:7px}.pill{border:1px solid #ddd;background:white;padding:10px 13px;border-radius:999px;font-weight:700;font-size:12px}.dark{background:#111;color:white}
    .hero{min-height:610px;display:flex;align-items:center;padding:80px 7%;background:radial-gradient(circle at 75% 45%,rgba(124,58,237,.16),transparent 35%)}
    .hero-content{max-width:720px}.eyebrow{font-size:11px;letter-spacing:2px;font-weight:800;opacity:.5}
    h1{font-size:clamp(48px,7vw,88px);line-height:.94;letter-spacing:-5px;margin:15px 0 28px}
    .hero p{max-width:550px;font-size:18px;line-height:1.6;opacity:.65}
    .shop{display:inline-block;margin-top:18px;background:#111;color:white;text-decoration:none;padding:15px 22px;border-radius:999px;font-weight:700}
    .section{padding:75px 7%}.section h2{font-size:44px;letter-spacing:-2px;margin:8px 0 30px}
    .categories{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
    .category{padding:20px;min-height:140px;border-radius:20px;background:white;border:1px solid #eee;text-decoration:none;color:#111;display:flex;flex-direction:column;justify-content:space-between}
    .category span{font-size:30px}.category strong{font-size:13px}
    .products{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
    .card{background:white;border-radius:22px;overflow:hidden;border:1px solid #eee}
    .image{height:260px;background:#f0f0f2;display:flex;align-items:center;justify-content:center}
    .image img{width:100%;height:100%;object-fit:cover}
    .info{padding:17px}.info h3{font-size:16px;margin:7px 0}.category-name{font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:.45;font-weight:800}
    .price{font-size:20px;font-weight:800;margin:15px 0}
    .add{width:100%;border:0;background:#111;color:white;border-radius:12px;padding:13px;font-weight:700}
    .trust{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;padding:45px 7%;background:#111;color:white}.trust div{padding:22px;background:#181818;border-radius:18px}
    footer{background:#090909;color:white;padding:55px 7%;display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px}
    .social{display:flex;gap:8px;margin-top:20px}.social a,.social button{padding:10px 14px;border:1px solid #333;background:#151515;color:white;border-radius:999px;text-decoration:none}
    .floating{position:fixed;right:18px;bottom:18px;width:55px;height:55px;border:0;border-radius:50%;background:#111;color:white;font-size:22px;z-index:1200}
    .backdrop{position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.58);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:15px}
    .modal{position:relative;width:min(620px,100%);max-height:92vh;overflow:auto;background:white;border-radius:26px;padding:28px}
    .close{position:absolute;right:15px;top:15px;border:0;border-radius:50%;width:36px;height:36px;background:#eee;font-size:22px}
    .form{display:grid;gap:11px}.form input,.form select{width:100%;padding:14px;border:1px solid #ddd;border-radius:12px;background:#fafafa;outline:none}.form input:focus,.form select:focus{border-color:#111;background:white}
    .primary,.secondary{width:100%;padding:14px;border-radius:12px;font-weight:700}.primary{border:0;background:#111;color:white}.secondary{border:1px solid #ddd;background:white;color:#111}
    .message{padding:12px;border-radius:12px;background:#f1ecff;font-size:13px;line-height:1.5;margin:12px 0}
    .tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:20px 0}.tabs button{padding:11px;border-radius:10px;border:1px solid #ddd;background:white;font-weight:700}.tabs .active{background:#111;color:white}
    .cart-overlay{position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.55);display:flex;justify-content:flex-end}.cart{width:min(470px,100%);height:100%;background:white;padding:25px;overflow:auto}
    .cart-item{display:flex;gap:12px;padding:15px 0;border-bottom:1px solid #eee}.cart-img{width:75px;height:75px;background:#f1f1f1;border-radius:12px;overflow:hidden;flex-shrink:0}.cart-img img{width:100%;height:100%;object-fit:cover}
    .quantity{display:flex;gap:10px;align-items:center;margin-top:8px}.quantity button{width:30px;height:30px;border:1px solid #ddd;background:white;border-radius:8px}
    .total{display:flex;justify-content:space-between;font-size:20px;font-weight:800;padding:20px 0}
    .order{border:1px solid #ddd;border-radius:16px;padding:16px;margin:10px 0}
    @media(max-width:768px){
      header{padding:12px}.logo{font-size:17px}nav{display:none}.pill{padding:9px 10px;font-size:10px}
      .hero{min-height:530px;padding:55px 20px}h1{font-size:clamp(42px,13vw,62px);letter-spacing:-3px}.hero p{font-size:15px}
      .section{padding:55px 16px}.section h2{font-size:32px}.categories{grid-template-columns:repeat(2,1fr)}.products{grid-template-columns:repeat(2,1fr);gap:10px}
      .image{height:175px}.info{padding:12px}.info h3{font-size:14px}.price{font-size:16px}.add{font-size:12px;padding:10px}
      .trust{grid-template-columns:1fr;padding:35px 16px}.modal{padding:22px 16px;border-radius:22px}.tabs{grid-template-columns:1fr}
    }
    @media(max-width:390px){.products{grid-template-columns:1fr}.image{height:220px}}
  `;

  return (
    <div className="app">
      <style>{css}</style>

      <div className="announcement">
        <div className="track">
          <span>✨ Premium phone accessories, are screaming here!!! ✨</span>
          <span>📱 Premium gadgets • Phones • Accessories 📱</span>
          <span>⚡ Shop Shindara Phoneflair ⚡</span>
          <span>✨ Premium phone accessories, are screaming here!!! ✨</span>
          <span>📱 Premium gadgets • Phones • Accessories 📱</span>
          <span>⚡ Shop Shindara Phoneflair ⚡</span>
        </div>
      </div>

      <header>
        <a className="logo" href="#home">
          Shindara<small>PHONEFLAIR</small>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="actions">
          <button className="pill" onClick={openAccount}>
            👤 {user ? "Account" : "Sign in"}
          </button>

          <button
            className="pill dark"
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart ({cartCount})
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">SHINDARA PHONEFLAIR</p>
            <h1>
              Technology,
              <br />
              beautifully selected.
            </h1>
            <p>
              Phones, accessories, chargers, audio products,
              power banks and everyday gadgets.
            </p>
            <a className="shop" href="#shop">
              Shop now →
            </a>
          </div>
        </section>

        <section className="section" id="categories">
          <p className="eyebrow">EXPLORE</p>
          <h2>Shop by category</h2>

          <div className="categories">
            {[
              ["📱", "Smartphones"],
              ["🛡️", "Phone Cases"],
              ["⚡", "Chargers"],
              ["🎧", "Audio"],
              ["🔋", "Power Banks"],
              ["✨", "Gadgets"],
            ].map(([icon, name]) => (
              <a className="category" href="#shop" key={name}>
                <span>{icon}</span>
                <strong>{name}</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="section" id="shop">
          <p className="eyebrow">SHINDARA STORE</p>
          <h2>Popular picks</h2>

          {productsLoading ? (
            <p>Loading products...</p>
          ) : productsError ? (
            <>
              <p>{productsError}</p>
              <button className="add" onClick={loadProducts}>
                Try again
              </button>
            </>
          ) : products.length === 0 ? (
            <p>Products are coming soon.</p>
          ) : (
            <div className="products">
              {products.map((product) => (
                <article className="card" key={product.id}>
                  <div className="image">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                      />
                    ) : (
                      <span style={{ fontSize: 45 }}>📦</span>
                    )}
                  </div>

                  <div className="info">
                    <div className="category-name">
                      {product.category || "Electronics"}
                    </div>

                    <h3>{product.name}</h3>

                    {product.description && (
                      <p style={{ opacity: 0.6, fontSize: 12 }}>
                        {product.description}
                      </p>
                    )}

                    <div className="price">
                      {money(product.price)}
                    </div>

                    <button
                      className="add"
                      disabled={Number(product.stock || 0) <= 0}
                      onClick={() => addToCart(product)}
                    >
                      {Number(product.stock || 0) > 0
                        ? "Add to cart"
                        : "Out of stock"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="trust">
          <div>🚚<h3>Reliable delivery</h3><p>Safe delivery of your order.</p></div>
          <div>🔒<h3>Secure shopping</h3><p>Shop with confidence.</p></div>
          <div>💬<h3>Customer support</h3><p>We're here when you need us.</p></div>
        </section>
      </main>

      <footer id="contact">
        <div>
          <strong>Shindara Phoneflair</strong>
          <p>Phones • Accessories • Gadgets • Electronics</p>

          <div className="social">
            <button onClick={whatsapp}>📲 WhatsApp</button>
            <a href={TIKTOK} target="_blank" rel="noreferrer">
              🎵 TikTok
            </a>
          </div>
        </div>

        <p>© 2026 Shindara Phoneflair</p>
      </footer>

      <button className="floating" onClick={whatsapp}>💬</button>

      {/* CART */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setCartOpen(false)}
            >
              ×
            </button>

            <p className="eyebrow">SHINDARA</p>
            <h2>Your Cart</h2>

            {!cart.length ? (
              <div style={{ textAlign: "center", padding: 50 }}>
                <div style={{ fontSize: 50 }}>🛒</div>
                <h3>Your cart is empty</h3>
                <button
                  className="primary"
                  onClick={() => setCartOpen(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-img">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                      <p>{money(item.price)}</p>

                      <div className="quantity">
                        <button onClick={() => decreaseQuantity(item.id)}>
                          −
                        </button>
                        <strong>{item.quantity}</strong>
                        <button onClick={() => increaseQuantity(item.id)}>
                          +
                        </button>
                      </div>

                      <button
                        style={{
                          border: 0,
                          background: "none",
                          padding: "8px 0",
                          opacity: 0.5,
                        }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="total">
                  <span>Total</span>
                  <span>{money(cartTotal)}</span>
                </div>

                <button className="primary" onClick={openCheckout}>
                  Continue to checkout →
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      {/* ACCOUNT */}
      {accountOpen && (
        <div
          className="backdrop"
          onClick={() => setAccountOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setAccountOpen(false)}
            >
              ×
            </button>

            <p className="eyebrow">SHINDARA ACCOUNT</p>

            {user ? (
              <>
                <h2>
                  {profile?.name
                    ? `Hello, ${profile.name.split(" ")[0]} 👋`
                    : "My Account"}
                </h2>

                <div className="tabs">
                  {[
                    ["profile", "👤 Profile"],
                    ["orders", "📦 Orders"],
                    ["settings", "⚙️ Settings"],
                  ].map(([tab, label]) => (
                    <button
                      key={tab}
                      className={accountTab === tab ? "active" : ""}
                      onClick={() => {
                        setAccountTab(tab);
                        if (tab === "orders") loadOrders();
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {accountTab === "profile" && (
                  <>
                    <div
                      style={{
                        padding: 20,
                        background: "#f5f5f5",
                        borderRadius: 18,
                      }}
                    >
                      <p className="eyebrow">PERSONAL INFORMATION</p>
                      <h3>{profile?.name || "Customer"}</h3>
                      <p>📧 {user.email}</p>
                      <p>📱 {profile?.phone || "No phone added"}</p>
                      <p>📍 {profile?.city || "No city added"}</p>
                      <p>🗺️ {profile?.state || "No state added"}</p>
                    </div>

                    <button
                      className="primary"
                      style={{ marginTop: 12 }}
                      onClick={() => setAccountTab("settings")}
                    >
                      Edit profile
                    </button>
                  </>
                )}

                {accountTab === "settings" && (
                  <>
                    <h3>Personal details</h3>

                    <form
                      className="form"
                      onSubmit={saveProfileSettings}
                    >
                      <input
                        placeholder="Full name"
                        value={profileName}
                        onChange={(e) =>
                          setProfileName(e.target.value)
                        }
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={profilePhone}
                        onChange={(e) =>
                          setProfilePhone(e.target.value)
                        }
                      />

                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                      />

                      <select
                        value={profileState}
                        onChange={(e) => {
                          setProfileState(e.target.value);
                          setProfileCity("");
                        }}
                      >
                        <option value="">Select your state</option>
                        {STATES.map((state) => (
                          <option key={state}>{state}</option>
                        ))}
                      </select>

                      <select
                        value={profileCity}
                        onChange={(e) =>
                          setProfileCity(e.target.value)
                        }
                        disabled={!profileState}
                      >
                        <option value="">
                          {profileState
                            ? "Select your city"
                            : "Select state first"}
                        </option>

                        {profileCities.map((city) => (
                          <option key={city}>{city}</option>
                        ))}
                      </select>

                      <button
                        className="primary"
                        disabled={settingsLoading}
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

                    <hr style={{ margin: "28px 0" }} />

                    <h3>Change password</h3>

                    <form
                      className="form"
                      onSubmit={changePassword}
                    >
                      <input
                        type="password"
                        placeholder="New password"
                        minLength={6}
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(e.target.value)
                        }
                        required
                      />

                      <button className="primary">
                        Change password
                      </button>
                    </form>

                    {passwordMessage && (
                      <div className="message">
                        {passwordMessage}
                      </div>
                    )}

                    <button
                      className="secondary"
                      style={{ marginTop: 20 }}
                      onClick={logout}
                    >
                      🚪 Log out
                    </button>
                  </>
                )}

                {accountTab === "orders" && (
                  <>
                    <p className="eyebrow">ORDER HISTORY</p>
                    <h3>My Orders</h3>

                    {ordersLoading ? (
                      <p>Loading your orders...</p>
                    ) : ordersError ? (
                      <div className="message">{ordersError}</div>
                    ) : !orders.length ? (
                      <div style={{ textAlign: "center", padding: 30 }}>
                        <div style={{ fontSize: 45 }}>📦</div>
                        <h3>No orders yet</h3>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div className="order" key={order.id}>
                          <strong>
                            Order #
                            {String(order.id)
                              .slice(0, 8)
                              .toUpperCase()}
                          </strong>

                          <p style={{ opacity: 0.55 }}>
                            {formatDate(order.created_at)}
                          </p>

                          <strong>{money(order.total)}</strong>

                          <button
                            className="secondary"
                            style={{ marginTop: 10 }}
                            onClick={() =>
                              setExpandedOrder(
                                expandedOrder === order.id
                                  ? null
                                  : order.id
                              )
                            }
                          >
                            {expandedOrder === order.id
                              ? "Hide items"
                              : "View items"}
                          </button>

                          {expandedOrder === order.id &&
                            order.order_items?.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "8px 0",
                                }}
                              >
                                <span>
                                  {item.product_name} × {item.quantity}
                                </span>
                                <strong>
                                  {money(
                                    Number(item.price) *
                                      Number(item.quantity)
                                  )}
                                </strong>
                              </div>
                            ))}
                        </div>
                      ))
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <h2>
                  {authMode === "signup"
                    ? "Create your account"
                    : "Welcome back"}
                </h2>

                <form className="form" onSubmit={handleAuth}>
                  {authMode === "signup" && (
                    <>
                      <input
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
                        required
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        required
                      />
                    </>
                  )}

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    minLength={6}
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <button className="primary" disabled={authLoading}>
                    {authLoading
                      ? "Please wait..."
                      : authMode === "signup"
                      ? "Create account"
                      : "Sign in"}
                  </button>
                </form>

                {authMessage && (
                  <div className="message">{authMessage}</div>
                )}

                {authMode === "login" && (
                  <>
                    <button
                      className="secondary"
                      style={{ marginTop: 10 }}
                      onClick={() => {
                        setForgotPassword(true);
                        setResetEmail(email);
                      }}
                    >
                      Forgot password?
                    </button>

                    <p style={{ textAlign: "center", opacity: 0.5 }}>
                      or
                    </p>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="secondary"
                        onClick={() => signInWithProvider("google")}
                      >
                        Google
                      </button>

                      <button
                        className="secondary"
                        onClick={() => signInWithProvider("apple")}
                      >
                        Apple
                      </button>
                    </div>
                  </>
                )}

                <button
                  className="secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setAuthMessage("");
                    setAuthMode(
                      authMode === "login" ? "signup" : "login"
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
          className="backdrop"
          onClick={() => setForgotPassword(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() => setForgotPassword(false)}
            >
              ×
            </button>

            <p className="eyebrow">SHINDARA ACCOUNT</p>
            <h2>Reset your password</h2>

            <form className="form" onSubmit={resetPassword}>
              <input
                type="email"
                placeholder="Email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />

              <button className="primary">
                Send reset link
              </button>
            </form>

            {resetMessage && (
              <div className="message">{resetMessage}</div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {checkoutOpen && (
        <div
          className="backdrop"
          onClick={() =>
            !orderLoading && setCheckoutOpen(false)
          }
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close"
              onClick={() =>
                !orderLoading && setCheckoutOpen(false)
              }
            >
              ×
            </button>

            {orderSuccess ? (
              <div style={{ textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 60 }}>✅</div>
                <p className="eyebrow">ORDER RECEIVED</p>
                <h2>Thank you!</h2>
                <div className="message">{orderMessage}</div>
                <button
                  className="primary"
                  onClick={() => setCheckoutOpen(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">SHINDARA CHECKOUT</p>
                <h2>Delivery details</h2>

                <form className="form" onSubmit={placeOrder}>
                  <input
                    placeholder="Full name"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value)
                    }
                    required
                  />

                  <input
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={(e) =>
                      setDeliveryAddress(e.target.value)
                    }
                    required
                  />

                  <select
                    value={deliveryState}
                    onChange={(e) => {
                      setDeliveryState(e.target.value);
                      setDeliveryCity("");
                    }}
                    required
                  >
                    <option value="">Select delivery state</option>

                    {STATES.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>

                  <select
                    value={deliveryCity}
                    onChange={(e) =>
                      setDeliveryCity(e.target.value)
                    }
                    disabled={!deliveryState}
                    required
                  >
                    <option value="">
                      {deliveryState
                        ? "Select delivery city"
                        : "Select state first"}
                    </option>

                    {checkoutCities.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>

                  <div className="total">
                    <span>Total</span>
                    <span>{money(cartTotal)}</span>
                  </div>

                  {orderMessage && (
                    <div className="message">
                      {orderMessage}
                    </div>
                  )}

                  <button
                    className="primary"
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
    </div>
  );
}

export default App;
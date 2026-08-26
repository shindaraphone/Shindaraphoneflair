import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP = "2348118294548";

const TIKTOK =
  "https://www.tiktok.com/@shindara.communication";

const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

/*
  Nigerian location dataset.
  Includes states, LGAs and towns/cities.
*/
const NIGERIA_LOCATION_DATA_URL =
  "https://unpkg.com/nigeria-state-lga-data@1.1.5/data/nigeria.json";

const FALLBACK_LOCATIONS = [
  {
    name: "Lagos",
    capital: "Ikeja",
    lgas: [
      "Agege",
      "Ajeromi-Ifelodun",
      "Alimosho",
      "Amuwo-Odofin",
      "Apapa",
      "Badagry",
      "Epe",
      "Eti-Osa",
      "Ibeju-Lekki",
      "Ifako-Ijaiye",
      "Ikeja",
      "Ikorodu",
      "Kosofe",
      "Lagos Island",
      "Lagos Mainland",
      "Mushin",
      "Ojo",
      "Oshodi-Isolo",
      "Shomolu",
      "Surulere",
    ],
    towns: [
      "Ikeja",
      "Lekki",
      "Ikorodu",
      "Epe",
      "Badagry",
      "Victoria Island",
      "Lagos Island",
      "Lagos Mainland",
      "Surulere",
      "Yaba",
      "Maryland",
      "Ajah",
      "Chevron",
      "Festac",
      "Apapa",
      "Oshodi",
      "Alimosho",
      "Agege",
      "Mushin",
      "Ojota",
      "Ketu",
      "Magodo",
      "Gbagada",
      "Anthony",
      "Ogba",
      "Iyana Ipaja",
      "Egbeda",
      "Abule Egba",
      "Ikoyi",
      "Oniru",
    ],
  },
  {
    name: "Oyo",
    capital: "Ibadan",
    lgas: [
      "Afijio",
      "Akinyele",
      "Atiba",
      "Atisbo",
      "Egbeda",
      "Ibadan North",
      "Ibadan North-East",
      "Ibadan North-West",
      "Ibadan South-East",
      "Ibadan South-West",
      "Ibarapa Central",
      "Ibarapa East",
      "Ibarapa North",
      "Ido",
      "Irepo",
      "Iseyin",
      "Itesiwaju",
      "Iwajowa",
      "Kajola",
      "Lagelu",
      "Ogbomoso North",
      "Ogbomoso South",
      "Ogo Oluwa",
      "Olorunsogo",
      "Oluyole",
      "Ona Ara",
      "Orelope",
      "Ori Ire",
      "Oyo East",
      "Oyo West",
      "Saki East",
      "Saki West",
      "Surulere",
    ],
    towns: [
      "Ibadan",
      "Ogbomoso",
      "Oyo",
      "Iseyin",
      "Saki",
      "Igboho",
      "Eruwa",
      "Iwo",
      "Moniya",
      "Apata",
      "Akobo",
      "Bodija",
      "Mokola",
      "Dugbe",
      "Challenge",
      "Ring Road",
      "Oluyole",
      "Eleyele",
      "Ojoo",
      "Agodi",
      "Jericho",
      "Samonda",
      "Alakia",
      "Lagos-Ibadan Expressway",
    ],
  },
  {
    name: "Ogun",
    capital: "Abeokuta",
    lgas: [
      "Abeokuta North",
      "Abeokuta South",
      "Ado-Odo/Ota",
      "Ewekoro",
      "Ifo",
      "Ijebu East",
      "Ijebu North",
      "Ijebu North East",
      "Ijebu Ode",
      "Ikenne",
      "Imeko Afon",
      "Ipokia",
      "Obafemi Owode",
      "Odeda",
      "Odogbolu",
      "Ogun Waterside",
      "Remo North",
      "Sagamu",
      "Yewa North",
      "Yewa South",
    ],
    towns: [
      "Abeokuta",
      "Ijebu Ode",
      "Sagamu",
      "Ifo",
      "Ota",
      "Agbara",
      "Ado-Odo",
      "Ijebu Igbo",
      "Ikenne",
      "Mowe",
      "Ofada",
      "Obantoko",
      "Lafenwa",
      "Kuto",
      "Fajol",
      "Oke-Ilewo",
      "Adatan",
      "GRA Abeokuta",
      "Remo",
      "Shagamu",
    ],
  },
  {
    name: "Kwara",
    capital: "Ilorin",
    lgas: [
      "Asa",
      "Baruten",
      "Edu",
      "Ekiti",
      "Ilorin East",
      "Ilorin South",
      "Ilorin West",
      "Irepodun",
      "Isin",
      "Kaiama",
      "Moro",
      "Offa",
      "Oke Ero",
      "Oyun",
      "Patigi",
      "Ifelodun",
    ],
    towns: [
      "Ilorin",
      "Offa",
      "Jebba",
      "Lafiagi",
      "Patigi",
      "Bacita",
      "Omu-Aran",
      "Erin-Ile",
      "Share",
      "Malete",
      "Ajase-Ipo",
      "Ilorin West",
      "Ilorin East",
      "Tanke",
      "Fate",
      "GRA Ilorin",
      "Sango",
      "Gambari",
    ],
  },
  {
    name: "Federal Capital Territory",
    capital: "Abuja",
    lgas: [
      "Abaji",
      "Bwari",
      "Gwagwalada",
      "Kuje",
      "Kwali",
      "Abuja Municipal",
    ],
    towns: [
      "Abuja",
      "Garki",
      "Wuse",
      "Maitama",
      "Asokoro",
      "Gwarinpa",
      "Kubwa",
      "Jabi",
      "Utako",
      "Wuye",
      "Lugbe",
      "Nyanya",
      "Karu",
      "Bwari",
      "Gwagwalada",
      "Kuje",
      "Abaji",
      "Kwali",
    ],
  },
];

const FALLBACK_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop);
        } else {
          reject(new Error("Paystack could not be loaded."));
        }
      });

      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://js.paystack.co/v2/inline.js";
    script.async = true;

    script.onload = () => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
      } else {
        reject(new Error("Paystack could not be loaded."));
      }
    };

    script.onerror = () => {
      reject(new Error("Unable to load Paystack."));
    };

    document.body.appendChild(script);
  });
}

function normalizeLocationData(raw) {
  if (!raw) return [];

  const source = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.states)
    ? raw.states
    : [];

  return source
    .map((state) => ({
      name:
        state.name ||
        state.state ||
        state.stateName ||
        "",
      capital: state.capital || "",
      lgas: Array.isArray(state.lgas)
        ? state.lgas
        : [],
      towns: Array.isArray(state.towns)
        ? state.towns
        : Array.isArray(state.cities)
        ? state.cities
        : [],
    }))
    .filter((state) => state.name);
}

function App() {
  /* =========================
     CART
  ========================= */

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  /* =========================
     CHECKOUT
  ========================= */

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [orderLoading, setOrderLoading] =
    useState(false);

  const [orderMessage, setOrderMessage] =
    useState("");

  const [orderSuccess, setOrderSuccess] =
    useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [deliveryCity, setDeliveryCity] =
    useState("");

  const [deliveryState, setDeliveryState] =
    useState("");

  const [citySearch, setCitySearch] =
    useState("");

  /* =========================
     NIGERIA LOCATIONS
  ========================= */

  const [locations, setLocations] =
    useState(FALLBACK_LOCATIONS);

  const [locationsLoading, setLocationsLoading] =
    useState(true);

  const [citySuggestionsOpen, setCitySuggestionsOpen] =
    useState(false);

  /* =========================
     ACCOUNT
  ========================= */

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [accountTab, setAccountTab] =
    useState("profile");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  /* =========================
     AUTH
  ========================= */

  const [authMode, setAuthMode] =
    useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [authMessage, setAuthMessage] =
    useState("");

  const [authLoading, setAuthLoading] =
    useState(false);

  /* =========================
     FORGOT PASSWORD
  ========================= */

  const [forgotPassword, setForgotPassword] =
    useState(false);

  const [resetEmail, setResetEmail] =
    useState("");

  const [resetMessage, setResetMessage] =
    useState("");

  const [resetLoading, setResetLoading] =
    useState(false);

  /* =========================
     PROFILE SETTINGS
  ========================= */

  const [profileName, setProfileName] =
    useState("");

  const [profilePhone, setProfilePhone] =
    useState("");

  const [settingsMessage, setSettingsMessage] =
    useState("");

  const [settingsLoading, setSettingsLoading] =
    useState(false);

  /* =========================
     PASSWORD
  ========================= */

  const [newPassword, setNewPassword] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  /* =========================
     ORDERS
  ========================= */

  const [orders, setOrders] =
    useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [ordersError, setOrdersError] =
    useState("");

  const [expandedOrder, setExpandedOrder] =
    useState(null);

  /* =========================
     PRODUCTS
  ========================= */

  const [products, setProducts] =
    useState([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productsError, setProductsError] =
    useState("");

  /* =========================
     LOAD LOCATIONS
  ========================= */

  useEffect(() => {
    let mounted = true;

    async function loadLocations() {
      try {
        const response = await fetch(
          NIGERIA_LOCATION_DATA_URL
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load Nigerian locations."
          );
        }

        const data = await response.json();

        const normalized =
          normalizeLocationData(data);

        if (
          mounted &&
          normalized.length > 0
        ) {
          setLocations(normalized);
        }
      } catch (error) {
        console.error(
          "Location data error:",
          error
        );

        if (mounted) {
          setLocations(FALLBACK_LOCATIONS);
        }
      } finally {
        if (mounted) {
          setLocationsLoading(false);
        }
      }
    }

    loadLocations();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     LOCATION HELPERS
  ========================= */

  const stateNames = useMemo(() => {
    const names = new Set([
      ...FALLBACK_STATES,
      ...locations.map(
        (location) => location.name
      ),
    ]);

    return Array.from(names).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [locations]);

  const selectedLocation = useMemo(() => {
    return locations.find(
      (location) =>
        location.name.toLowerCase() ===
        deliveryState.toLowerCase()
    );
  }, [locations, deliveryState]);

  const cityOptions = useMemo(() => {
    if (!selectedLocation) {
      return [];
    }

    const combined = [
      ...(selectedLocation.towns || []),
      ...(selectedLocation.lgas || []),
      selectedLocation.capital,
    ];

    const unique = Array.from(
      new Set(
        combined
          .filter(Boolean)
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean)
      )
    );

    return unique.sort((a, b) =>
      a.localeCompare(b)
    );
  }, [selectedLocation]);

  const filteredCities = useMemo(() => {
    const query =
      citySearch.trim().toLowerCase();

    if (!query) {
      return cityOptions.slice(0, 80);
    }

    return cityOptions
      .filter((city) =>
        city.toLowerCase().includes(query)
      )
      .slice(0, 80);
  }, [cityOptions, citySearch]);

  function selectState(state) {
    setDeliveryState(state);
    setDeliveryCity("");
    setCitySearch("");
    setCitySuggestionsOpen(false);
  }

  function selectCity(city) {
    setDeliveryCity(city);
    setCitySearch(city);
    setCitySuggestionsOpen(false);
  }

  /* =========================
     INITIAL USER
  ========================= */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } =
        await supabase.auth.getUser();

      if (!mounted) return;

      const currentUser =
        data?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await loadProfile(
          currentUser.id
        );
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        const currentUser =
          session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(
            currentUser.id
          );
        } else {
          setProfile(null);
          setOrders([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================
     PRODUCTS
  ========================= */

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
        () => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");

    const { data, error } =
      await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);

      setProductsError(
        "We couldn't load our products right now."
      );

      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  /* =========================
     PROFILE
  ========================= */

  async function loadProfile(userId) {
    const { data, error } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
      console.error(
        "Profile loading error:",
        error
      );
      return;
    }

    setProfile(data || null);

    if (data) {
      const name =
        data.name ||
        data.full_name ||
        "";

      const userPhone =
        data.phone ||
        "";

      setProfileName(name);
      setProfilePhone(userPhone);

      setCustomerName(name);
      setCustomerPhone(userPhone);
    }
  }

  /* =========================
     ORDERS
  ========================= */

  async function loadOrders() {
    if (!user) return;

    setOrdersLoading(true);
    setOrdersError("");

    const { data, error } =
      await supabase
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
      console.error(
        "Orders loading error:",
        error
      );

      setOrdersError(
        "We couldn't load your orders right now."
      );

      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  }

  async function openAccount() {
    setAuthMessage("");
    setSettingsMessage("");
    setPasswordMessage("");

    setAccountOpen(true);

    if (user) {
      await loadProfile(user.id);
      await loadOrders();
    }
  }

  /* =========================
     SIGN UP / LOGIN
  ========================= */

  async function handleAuth(event) {
    event.preventDefault();

    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "signup") {
        const cleanEmail =
          email.trim();

        const cleanName =
          fullName.trim();

        const cleanPhone =
          phone.trim();

        if (!cleanName) {
          setAuthMessage(
            "Please enter your full name."
          );
          return;
        }

        if (!cleanPhone) {
          setAuthMessage(
            "Please enter your phone number."
          );
          return;
        }

        if (!cleanEmail) {
          setAuthMessage(
            "Please enter your email address."
          );
          return;
        }

        const {
          data,
          error,
        } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
                phone: cleanPhone,
              },
            },
          });

        if (error) {
          setAuthMessage(error.message);
          return;
        }

        if (data?.user) {
          const {
            error: profileError,
          } =
            await supabase
              .from("profiles")
              .upsert(
                {
                  id: data.user.id,
                  name: cleanName,
                  phone: cleanPhone,
                  email: cleanEmail,
                },
                {
                  onConflict: "id",
                }
              );

          if (profileError) {
            console.error(
              "Profile save error:",
              profileError
            );
          }
        }

        if (
          data?.user &&
          !data.session
        ) {
          setAuthMessage(
            "Account created successfully! Please check your email to confirm your account."
          );
        } else {
          setAuthMessage(
            "Account created successfully!"
          );
        }

        setPassword("");

        if (data?.session) {
          setCustomerName(
            cleanName
          );

          setCustomerPhone(
            cleanPhone
          );

          setFullName("");
          setEmail("");
          setPhone("");

          setAccountOpen(false);
        }

        return;
      }

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
        return;
      }

      if (data?.user) {
        await loadProfile(
          data.user.id
        );
      }

      setEmail("");
      setPassword("");
      setAuthMessage("");
      setAccountOpen(false);
    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      setAuthMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  /* =========================
     GOOGLE / APPLE
  ========================= */

  async function signInWithProvider(
    provider
  ) {
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const { error } =
        await supabase.auth.signInWithOAuth(
          {
            provider,
            options: {
              redirectTo:
                window.location.origin,
            },
          }
        );

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(error);

      setAuthMessage(
        error?.message ||
          `Unable to continue with ${provider}.`
      );

      setAuthLoading(false);
    }
  }

  /* =========================
     FORGOT PASSWORD
  ========================= */

  async function handleForgotPassword(
    event
  ) {
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

      if (error) {
        throw error;
      }

      setResetMessage(
        "Password reset link sent. Please check your email."
      );
    } catch (error) {
      console.error(error);

      setResetMessage(
        error?.message ||
          "Unable to send password reset email."
      );
    } finally {
      setResetLoading(false);
    }
  }

  /* =========================
     PROFILE SETTINGS
  ========================= */

  async function saveProfileSettings(
    event
  ) {
    event.preventDefault();

    if (!user) return;

    setSettingsLoading(true);
    setSettingsMessage("");

    try {
      const cleanName =
        profileName.trim();

      const cleanPhone =
        profilePhone.trim();

      if (!cleanName) {
        setSettingsMessage(
          "Please enter your name."
        );
        return;
      }

      if (!cleanPhone) {
        setSettingsMessage(
          "Please enter your phone number."
        );
        return;
      }

      const profilePayload = {
        id: user.id,
        name: cleanName,
        phone: cleanPhone,
        email: user.email || "",
      };

      const { error } =
        await supabase
          .from("profiles")
          .upsert(
            profilePayload,
            {
              onConflict: "id",
            }
          );

      if (error) {
        throw error;
      }

      setCustomerName(cleanName);
      setCustomerPhone(cleanPhone);

      await loadProfile(user.id);

      setSettingsMessage(
        "Your account details have been updated successfully."
      );
    } catch (error) {
      console.error(
        "Settings error:",
        error
      );

      setSettingsMessage(
        error?.message ||
          "Unable to update your details."
      );
    } finally {
      setSettingsLoading(false);
    }
  }

  /* =========================
     CHANGE PASSWORD
  ========================= */

  async function changePassword(
    event
  ) {
    event.preventDefault();

    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      if (
        !newPassword ||
        newPassword.length < 6
      ) {
        setPasswordMessage(
          "Password must be at least 6 characters."
        );
        return;
      }

      const { error } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (error) {
        throw error;
      }

      setNewPassword("");

      setPasswordMessage(
        "Your password has been changed successfully."
      );
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordMessage(
        error?.message ||
          "Unable to change your password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  /* =========================
     LOGOUT
  ========================= */

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setOrders([]);
    setAccountOpen(false);
  }

  /* =========================
     CART
  ========================= */

  function addToCart(product) {
    setCart((items) => {
      const existing =
        items.find(
          (item) =>
            item.id === product.id
        );

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...items,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(id) {
    setCart((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((items) =>
      items
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  function removeFromCart(id) {
    setCart((items) =>
      items.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );

  const cartTotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );

  /* =========================
     CHECKOUT
  ========================= */

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

    setCitySearch(
      deliveryCity || ""
    );
  }

  async function saveOrder(reference) {
    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name:
          customerName.trim(),
        customer_phone:
          customerPhone.trim(),
        delivery_address:
          deliveryAddress.trim(),
        delivery_city:
          deliveryCity.trim(),
        delivery_state:
          deliveryState.trim(),
        total: cartTotal,
        status: "paid",
        payment_reference:
          reference,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    const items = cart.map(
      (item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name:
          item.name,
        price: Number(
          item.price || 0
        ),
        quantity: Number(
          item.quantity || 1
        ),
        image_url:
          item.image_url || null,
      })
    );

    const {
      error: itemsError,
    } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      throw itemsError;
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

    if (!cart.length) {
      setOrderMessage(
        "Your cart is empty."
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

    if (!deliveryState.trim()) {
      setOrderMessage(
        "Please select your state."
      );
      return;
    }

    if (!deliveryCity.trim()) {
      setOrderMessage(
        "Please select or enter your city."
      );
      return;
    }

    setOrderLoading(true);
    setOrderMessage("");

    try {
      const PaystackPop =
        await loadPaystackScript();

      const amountInKobo =
        Math.round(
          cartTotal * 100
        );

      const popup =
        new PaystackPop();

      popup.newTransaction({
        key:
          PAYSTACK_PUBLIC_KEY,

        email:
          user.email,

        amount:
          amountInKobo,

        currency:
          "NGN",

        metadata: {
          customer_name:
            customerName.trim(),

          customer_phone:
            customerPhone.trim(),

          delivery_address:
            deliveryAddress.trim(),

          delivery_city:
            deliveryCity.trim(),

          delivery_state:
            deliveryState.trim(),

          user_id:
            user.id,
        },

        onSuccess:
          async (
            transaction
          ) => {
            try {
              setOrderMessage(
                "Payment successful. Verifying your payment..."
              );

              const reference =
                transaction.reference;

              if (!reference) {
                throw new Error(
                  "Paystack did not return a payment reference."
                );
              }

              const {
                data:
                  verificationData,
                error:
                  verificationError,
              } =
                await supabase.functions.invoke(
                  "verify-paystack-payment",
                  {
                    body: {
                      reference,
                    },
                  }
                );

              if (
                verificationError
              ) {
                throw new Error(
                  verificationError.message ||
                    "Failed to verify Paystack payment."
                );
              }

              if (
                !verificationData?.success
              ) {
                throw new Error(
                  verificationData?.error ||
                    "Payment could not be verified."
                );
              }

              const order =
                await saveOrder(
                  reference
                );

              setOrderSuccess(
                true
              );

              setOrderMessage(
                `Order placed successfully! Your order number is ${String(
                  order.id
                )
                  .slice(
                    0,
                    8
                  )
                  .toUpperCase()}.`
              );

              setCart([]);

              setCustomerName("");
              setCustomerPhone("");
              setDeliveryAddress("");
              setDeliveryCity("");
              setDeliveryState("");
              setCitySearch("");
            } catch (error) {
              console.error(
                "Payment/order error:",
                error
              );

              setOrderMessage(
                error?.message ||
                  "Payment was received, but we couldn't complete the order. Please contact Shindara Phoneflair."
              );
            } finally {
              setOrderLoading(
                false
              );
            }
          },

        onCancel:
          () => {
            setOrderLoading(
              false
            );

            setOrderMessage(
              "Payment was cancelled. Your order has not been placed."
            );
          },
      });
    } catch (error) {
      console.error(
        "Paystack error:",
        error
      );

      setOrderMessage(
        error?.message ||
          "Unable to open Paystack. Please try again."
      );

      setOrderLoading(false);
    }
  }

  /* =========================
     HELPERS
  ========================= */

  function whatsapp() {
    const message =
      encodeURIComponent(
        "Hello Shindara Phoneflair, I would like to make an enquiry."
      );

    window.open(
      `https://wa.me/${WHATSAPP}?text=${message}`,
      "_blank"
    );
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function statusLabel(
    status
  ) {
    if (!status) return "Pending";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  return (
    <div className="app">

      <style>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family: Inter, -apple-system, BlinkMacSystemFont,
            "SF Pro Display", "Segoe UI", sans-serif;
          background: #f7f7f8;
          color: #111;
          overflow-x: hidden;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

        .app {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(124, 58, 237, 0.08),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 20%,
              rgba(59, 130, 246, 0.08),
              transparent 25%
            ),
            #f7f7f8;
        }

        .announcement-bar {
          width: 100%;
          overflow: hidden;
          background: #111;
          color: white;
          padding: 11px 0;
          white-space: nowrap;
          position: relative;
          z-index: 1000;
        }

        .announcement-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }

        .announcement-group {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .announcement-group span {
          display: inline-block;
          margin-right: 80px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: .4px;
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 900;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 5%;
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,.06);
        }

        .logo {
          text-decoration: none;
          color: #111;
          font-weight: 800;
          font-size: 21px;
          letter-spacing: -1px;
          white-space: nowrap;
        }

        .logo span {
          display: block;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          opacity: .55;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .nav a {
          color: #222;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          opacity: .75;
        }

        .nav a:hover {
          opacity: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .account-button,
        .cart-button {
          border: 1px solid rgba(0,0,0,.08);
          background: white;
          color: #111;
          border-radius: 999px;
          padding: 10px 14px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
        }

        .cart-button {
          background: #111;
          color: white;
        }

        .hero {
          min-height: 650px;
          display: flex;
          align-items: center;
          padding: 80px 7%;
          background:
            radial-gradient(
              circle at 70% 40%,
              rgba(124,58,237,.16),
              transparent 35%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(37,99,235,.13),
              transparent 30%
            );
        }

        .hero-content {
          max-width: 720px;
        }

        .eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          opacity: .55;
          margin: 0 0 14px;
        }

        .hero h1 {
          font-size: clamp(48px, 7vw, 88px);
          line-height: .94;
          letter-spacing: -5px;
          margin: 0 0 28px;
        }

        .hero-text {
          max-width: 550px;
          font-size: 18px;
          line-height: 1.65;
          opacity: .68;
          margin-bottom: 32px;
        }

        .shop-button {
          display: inline-block;
          background: #111;
          color: white;
          text-decoration: none;
          padding: 15px 22px;
          border-radius: 999px;
          font-weight: 700;
        }

        .section {
          padding: 90px 7%;
        }

        .section h2 {
          margin: 0 0 35px;
          font-size: 46px;
          letter-spacing: -2.5px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .category-card {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          background: rgba(255,255,255,.8);
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 22px;
          transition: transform .2s ease;
        }

        .category-card:hover {
          transform: translateY(-4px);
        }

        .category-card span {
          font-size: 30px;
        }

        .category-card strong {
          font-size: 14px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .product-card {
          background: white;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 35px rgba(0,0,0,.04);
        }

        .product-image {
          height: 270px;
          background: #f0f0f2;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          padding: 18px;
        }

        .product-category {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: .45;
          margin: 0 0 7px;
        }

        .product-info h3 {
          margin: 0 0 10px;
          font-size: 17px;
        }

        .price {
          font-size: 20px;
          font-weight: 800;
          margin: 14px 0;
        }

        .add-button {
          width: 100%;
          border: 0;
          border-radius: 12px;
          background: #111;
          color: white;
          padding: 13px;
          cursor: pointer;
          font-weight: 700;
        }

        .add-button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .trust-section {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 20px;
          padding: 50px 7%;
          background: #111;
          color: white;
        }

        .trust-section > div {
          padding: 25px;
          border-radius: 20px;
          background: rgba(255,255,255,.05);
        }

        .trust-section span {
          font-size: 28px;
        }

        .trust-section h3 {
          margin-bottom: 5px;
        }

        .trust-section p {
          opacity: .6;
        }

        footer {
          padding: 60px 7%;
          background: #090909;
          color: white;
          display: flex;
          justify-content: space-between;
          gap: 30px;
          flex-wrap: wrap;
        }

        .footer-logo {
          font-size: 20px;
        }

        .social-links {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .social-button {
          display: inline-block;
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.06);
          color: white;
          padding: 10px 13px;
          border-radius: 999px;
          text-decoration: none;
          cursor: pointer;
        }

        .whatsapp-floating {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 950;
          width: 58px;
          height: 58px;
          border: 0;
          border-radius: 50%;
          background: #111;
          color: white;
          box-shadow: 0 12px 30px rgba(0,0,0,.2);
          cursor: pointer;
          font-size: 22px;
        }

        .modal-backdrop,
        .cart-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: rgba(0,0,0,.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .account-modal {
          position: relative;
          width: min(620px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          color: #111;
          border-radius: 28px;
          padding: 30px;
          box-shadow: 0 30px 100px rgba(0,0,0,.3);
        }

        .modal-close {
          position: absolute;
          right: 18px;
          top: 18px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 50%;
          background: rgba(0,0,0,.06);
          font-size: 24px;
          cursor: pointer;
        }

        .auth-form {
          display: grid;
          gap: 12px;
        }

        .auth-form input,
        .auth-form select,
        .auth-form textarea {
          width: 100%;
          padding: 14px 15px;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 13px;
          outline: none;
          background: #fafafa;
        }

        .auth-form input:focus,
        .auth-form select:focus,
        .auth-form textarea:focus {
          border-color: #111;
          background: white;
        }

        .location-field {
          position: relative;
        }

        .city-search-input {
          width: 100%;
          padding: 14px 15px;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 13px;
          outline: none;
          background: #fafafa;
        }

        .city-search-input:focus {
          border-color: #111;
          background: white;
        }

        .city-suggestions {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 5px);
          max-height: 230px;
          overflow-y: auto;
          background: white;
          border: 1px solid rgba(0,0,0,.1);
          border-radius: 14px;
          box-shadow: 0 18px 40px rgba(0,0,0,.15);
          z-index: 50;
        }

        .city-suggestion {
          width: 100%;
          border: 0;
          background: white;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
        }

        .city-suggestion:hover {
          background: #f3f3f5;
        }

        .city-help {
          font-size: 11px;
          opacity: .55;
          margin-top: 6px;
        }

        .modal-action {
          width: 100%;
          border: 0;
          background: #111;
          color: white;
          padding: 14px;
          border-radius: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-action:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .modal-secondary {
          width: 100%;
          border: 1px solid rgba(0,0,0,.1);
          background: white;
          color: #111;
          padding: 13px;
          border-radius: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .auth-message {
          padding: 12px;
          border-radius: 12px;
          background: rgba(124,58,237,.08);
          font-size: 13px;
          line-height: 1.5;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0;
          font-size: 12px;
          opacity: .5;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          height: 1px;
          flex: 1;
          background: currentColor;
        }

        .social-auth-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .social-auth-button {
          border: 1px solid rgba(0,0,0,.1);
          background: white;
          border-radius: 13px;
          padding: 13px;
          cursor: pointer;
          font-weight: 700;
        }

        .forgot-password {
          border: 0;
          background: none;
          padding: 0;
          text-align: right;
          cursor: pointer;
          font-size: 12px;
          opacity: .65;
        }

        .cart-overlay {
          align-items: stretch;
          justify-content: flex-end;
          padding: 0;
        }

        .cart-drawer {
          width: min(470px, 100%);
          height: 100%;
          background: white;
          color: #111;
          padding: 25px;
          overflow-y: auto;
          box-shadow: -20px 0 60px rgba(0,0,0,.2);
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .cart-header h2 {
          margin-top: 0;
        }

        .cart-item {
          display: flex;
          gap: 14px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(0,0,0,.07);
        }

        .cart-item-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border-radius: 14px;
          overflow: hidden;
          background: #f1f1f1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .cart-item-info h3 {
          margin: 0 0 5px;
          font-size: 14px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .quantity-controls button {
          width: 30px;
          height: 30px;
          border: 1px solid rgba(0,0,0,.1);
          background: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .remove-cart-item,
        .clear-cart-button {
          border: 0;
          background: none;
          cursor: pointer;
          opacity: .55;
          font-size: 12px;
          margin-top: 8px;
        }

        .cart-footer {
          padding-top: 20px;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          font-size: 20px;
          margin-bottom: 15px;
        }

        .checkout-button {
          width: 100%;
          border: 0;
          background: #111;
          color: white;
          padding: 15px;
          border-radius: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .clear-cart-button {
          display: block;
          margin: 15px auto 0;
        }

        .account-tabs {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 8px;
          margin: 25px 0;
        }

        .profile-card {
          padding: 20px;
          border-radius: 18px;
          background: rgba(128,128,128,.08);
          margin-bottom: 15px;
        }

        .order-card {
          padding: 18px;
          border: 1px solid rgba(128,128,128,.2);
          border-radius: 18px;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {

          .header {
            padding: 12px;
            gap: 8px;
          }

          .logo {
            font-size: 17px;
          }

          .nav {
            display: none;
          }

          .header-actions {
            margin-left: auto;
            gap: 5px;
          }

          .account-button,
          .cart-button {
            padding: 9px 10px;
            font-size: 11px;
          }

          .hero {
            min-height: 550px;
            padding: 65px 20px;
          }

          .hero h1 {
            font-size: clamp(42px, 13vw, 62px);
            letter-spacing: -3px;
          }

          .hero-text {
            font-size: 15px;
          }

          .section {
            padding: 55px 16px;
          }

          .section h2 {
            font-size: 32px;
            letter-spacing: -1.5px;
          }

          .category-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .product-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 10px;
          }

          .product-image {
            height: 170px;
          }

          .product-info {
            padding: 13px;
          }

          .product-info h3 {
            font-size: 14px;
          }

          .price {
            font-size: 16px;
          }

          .add-button {
            font-size: 12px;
            padding: 10px 7px;
          }

          .trust-section {
            grid-template-columns: 1fr;
            padding: 35px 16px;
          }

          footer {
            padding: 40px 16px;
          }

          .account-modal {
            width: calc(100% - 16px);
            padding: 23px 17px;
            border-radius: 22px;
          }

          .social-auth-buttons {
            grid-template-columns: 1fr;
          }

          .cart-drawer {
            width: 100%;
            border-radius: 22px 22px 0 0;
          }

          .cart-overlay {
            align-items: flex-end;
          }

          .announcement-track {
            animation-duration: 17s;
          }

          .announcement-group span {
            font-size: 11px;
            margin-right: 45px;
          }

          .whatsapp-floating {
            width: 52px;
            height: 52px;
            right: 14px;
            bottom: 14px;
          }

          .account-tabs {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 380px) {

          .product-grid {
            grid-template-columns: 1fr;
          }

          .product-image {
            height: 220px;
          }

          .header-actions {
            gap: 3px;
          }

          .account-button,
          .cart-button {
            padding: 8px;
            font-size: 10px;
          }
        }

      `}</style>

      {/* =========================
          ANNOUNCEMENT
      ========================= */}

      <div className="announcement-bar">
        <div className="announcement-track">

          <div className="announcement-group">
            <span>
              ✨ Premium phone accessories, are screaming here!!! ✨
            </span>

            <span>
              📱 Premium phone accessories, are screaming here!!! 📱
            </span>

            <span>
              ⚡ Premium phone accessories, are screaming here!!! ⚡
            </span>

            <span>
              ✨ Premium phone accessories, are screaming here!!! ✨
            </span>
          </div>

          <div className="announcement-group">
            <span>
              ✨ Premium phone accessories, are screaming here!!! ✨
            </span>

            <span>
              📱 Premium phone accessories, are screaming here!!! 📱
            </span>

            <span>
              ⚡ Premium phone accessories, are screaming here!!! ⚡
            </span>

            <span>
              ✨ Premium phone accessories, are screaming here!!! ✨
            </span>
          </div>

        </div>
      </div>

      {/* =========================
          HEADER
      ========================= */}

      <header className="header">

        <a
          href="#home"
          className="logo"
        >
          Shindara
          <span>Phoneflair</span>
        </a>

        <nav className="nav">
          <a href="#home">
            Home
          </a>

          <a href="#shop">
            Shop
          </a>

          <a href="#categories">
            Categories
          </a>

          <a href="#contact">
            Contact
          </a>
        </nav>

        <div className="header-actions">

          <button
            className="account-button"
            onClick={openAccount}
          >
            👤{" "}
            {user
              ? "Account"
              : "Sign in"}
          </button>

          <button
            className="cart-button"
            onClick={() =>
              setCartOpen(true)
            }
          >
            🛒 Cart ({cartCount})
          </button>

        </div>

      </header>

      {/* =========================
          HERO
      ========================= */}

      <main>

        <section
          className="hero"
          id="home"
        >

          <div className="hero-content">

            <p className="eyebrow">
              SHINDARA PHONEFLAIR
            </p>

            <h1>
              Technology,
              <br />
              beautifully selected.
            </h1>

            <p className="hero-text">
              Phones, accessories, chargers,
              audio products, power banks and
              everyday gadgets.
            </p>

            <a
              href="#shop"
              className="shop-button"
            >
              Shop now →
            </a>

          </div>

        </section>

        {/* =========================
            CATEGORIES
        ========================= */}

        <section
          className="section"
          id="categories"
        >

          <p className="eyebrow">
            EXPLORE
          </p>

          <h2>
            Shop by category
          </h2>

          <div className="category-grid">

            {[
              ["📱", "Smartphones"],
              ["🛡️", "Phone Cases"],
              ["⚡", "Chargers"],
              ["🎧", "Audio"],
              ["🔋", "Power Banks"],
              ["✨", "Gadgets"],
            ].map(
              ([icon, name]) => (

                <a
                  href="#shop"
                  className="category-card"
                  key={name}
                >

                  <span>
                    {icon}
                  </span>

                  <strong>
                    {name}
                  </strong>

                </a>

              )
            )}

          </div>

        </section>

        {/* =========================
            SHOP
        ========================= */}

        <section
          className="section"
          id="shop"
        >

          <p className="eyebrow">
            SHINDARA STORE
          </p>

          <h2>
            Popular picks
          </h2>

          {productsLoading ? (

            <div
              style={{
                padding: "50px",
                textAlign:
                  "center",
              }}
            >
              Loading products...
            </div>

          ) : productsError ? (

            <div
              style={{
                padding: "50px",
                textAlign:
                  "center",
              }}
            >

              <p>
                {productsError}
              </p>

              <button
                className="add-button"
                onClick={
                  loadProducts
                }
              >
                Try again
              </button>

            </div>

          ) : products.length ===
            0 ? (

            <div
              style={{
                padding: "50px",
                textAlign:
                  "center",
              }}
            >
              <p>
                Products are coming soon.
              </p>
            </div>

          ) : (

            <div className="product-grid">

              {products.map(
                (product) => (

                  <article
                    className="product-card"
                    key={
                      product.id
                    }
                  >

                    <div className="product-image">

                      {product.image_url ? (

                        <img
                          src={
                            product.image_url
                          }
                          alt={
                            product.name
                          }
                        />

                      ) : (

                        <span
                          style={{
                            fontSize:
                              45,
                          }}
                        >
                          📦
                        </span>

                      )}

                    </div>

                    <div className="product-info">

                      <p className="product-category">
                        {product.category ||
                          "Electronics"}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      {product.description && (
                        <p
                          style={{
                            opacity:
                              .65,
                            fontSize:
                              13,
                            lineHeight:
                              1.5,
                          }}
                        >
                          {
                            product.description
                          }
                        </p>
                      )}

                      <p className="price">
                        {money(
                          product.price
                        )}
                      </p>

                      {Number(
                        product.stock ||
                          0
                      ) > 0 ? (

                        <button
                          className="add-button"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                        >
                          Add to cart
                        </button>

                      ) : (

                        <button
                          className="add-button"
                          disabled
                        >
                          Out of stock
                        </button>

                      )}

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

        {/* =========================
            TRUST
        ========================= */}

        <section className="trust-section">

          <div>
            <span>🚚</span>
            <h3>
              Reliable delivery
            </h3>
            <p>
              Get your order delivered safely.
            </p>
          </div>

          <div>
            <span>🔒</span>
            <h3>
              Secure shopping
            </h3>
            <p>
              Shop with confidence.
            </p>
          </div>

          <div>
            <span>💬</span>
            <h3>
              Customer support
            </h3>
            <p>
              We're here whenever you need us.
            </p>
          </div>

        </section>

      </main>

      {/* =========================
          FOOTER
      ========================= */}

      <footer id="contact">

        <div>

          <strong className="footer-logo">
            Shindara Phoneflair
          </strong>

          <p>
            Phones • Accessories • Gadgets •
            Electronics
          </p>

          <div className="social-links">

            <button
              className="social-button"
              onClick={
                whatsapp
              }
            >
              📲 WhatsApp
            </button>

            <a
              className="social-button"
              href={TIKTOK}
              target="_blank"
              rel="noreferrer"
            >
              🎵 TikTok
            </a>

          </div>

        </div>

        <p>
          © 2026 Shindara Phoneflair
        </p>

      </footer>

      {/* =========================
          WHATSAPP
      ========================= */}

      <button
        className="whatsapp-floating"
        onClick={
          whatsapp
        }
      >
        💬
      </button>

      {/* =========================
          CART
      ========================= */}

      {cartOpen && (

        <div
          className="cart-overlay"
          onClick={() =>
            setCartOpen(false)
          }
        >

          <aside
            className="cart-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="cart-header">

              <div>

                <p className="eyebrow">
                  SHINDARA
                </p>

                <h2>
                  Your Cart
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                ×
              </button>

            </div>

            {cart.length ===
            0 ? (

              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "60px 20px",
                }}
              >

                <div
                  style={{
                    fontSize:
                      55,
                  }}
                >
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add something you love from
                  our store.
                </p>

                <button
                  className="modal-action"
                  onClick={() =>
                    setCartOpen(
                      false
                    )
                  }
                >
                  Continue shopping
                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map(
                    (item) => (

                      <div
                        className="cart-item"
                        key={
                          item.id
                        }
                      >

                        <div className="cart-item-image">

                          {item.image_url ? (

                            <img
                              src={
                                item.image_url
                              }
                              alt={
                                item.name
                              }
                            />

                          ) : (

                            <span>
                              📦
                            </span>

                          )}

                        </div>

                        <div className="cart-item-info">

                          <h3>
                            {item.name}
                          </h3>

                          <p>
                            {money(
                              item.price
                            )}
                          </p>

                          <div className="quantity-controls">

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
                              {
                                item.quantity
                              }
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

                          </div>

                          <button
                            className="remove-cart-item"
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

                    )
                  )}

                </div>

                <div className="cart-footer">

                  <div className="cart-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {money(
                        cartTotal
                      )}
                    </strong>

                  </div>

                  <button
                    className="checkout-button"
                    onClick={
                      openCheckout
                    }
                  >
                    Continue to checkout →
                  </button>

                  <button
                    className="clear-cart-button"
                    onClick={
                      clearCart
                    }
                  >
                    Clear cart
                  </button>

                </div>

              </>

            )}

          </aside>

        </div>

      )}

      {/* =========================
          CHECKOUT
      ========================= */}

      {checkoutOpen && (

        <div
          className="modal-backdrop"
          onClick={() =>
            !orderLoading &&
            setCheckoutOpen(
              false
            )
          }
        >

          <div
            className="account-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                !orderLoading &&
                setCheckoutOpen(
                  false
                )
              }
            >
              ×
            </button>

            {orderSuccess ? (

              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "25px 5px",
                }}
              >

                <div
                  style={{
                    fontSize:
                      60,
                    marginBottom:
                      15,
                  }}
                >
                  ✅
                </div>

                <p className="eyebrow">
                  ORDER RECEIVED
                </p>

                <h2>
                  Thank you!
                </h2>

                <p className="auth-message">
                  {orderMessage}
                </p>

                <button
                  className="modal-action"
                  onClick={() =>
                    setCheckoutOpen(
                      false
                    )
                  }
                >
                  Continue shopping
                </button>

              </div>

            ) : (

              <>

                <p className="eyebrow">
                  SHINDARA CHECKOUT
                </p>

                <h2>
                  Delivery details
                </h2>

                <p
                  style={{
                    opacity:
                      .65,
                  }}
                >
                  Tell us where to deliver your
                  order.
                </p>

                <form
                  className="auth-form"
                  onSubmit={
                    placeOrder
                  }
                >

                  <input
                    type="text"
                    placeholder="Full name"
                    value={
                      customerName
                    }
                    onChange={(event) =>
                      setCustomerName(
                        event.target
                          .value
                      )
                    }
                    required
                  />

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={
                      customerPhone
                    }
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target
                          .value
                      )
                    }
                    required
                  />

                  <textarea
                    placeholder="Delivery address"
                    value={
                      deliveryAddress
                    }
                    onChange={(event) =>
                      setDeliveryAddress(
                        event.target
                          .value
                      )
                    }
                    rows={3}
                    required
                  />

                  {/* STATE */}

                  <select
                    value={
                      deliveryState
                    }
                    onChange={(event) =>
                      selectState(
                        event.target
                          .value
                      )
                    }
                    required
                  >

                    <option value="">
                      {locationsLoading
                        ? "Loading states..."
                        : "Select state"}
                    </option>

                    {stateNames.map(
                      (state) => (

                        <option
                          key={
                            state
                          }
                          value={
                            state
                          }
                        >
                          {state}
                        </option>

                      )
                    )}

                  </select>

                  {/* CITY */}

                  <div className="location-field">

                    <input
                      className="city-search-input"
                      type="text"
                      placeholder={
                        deliveryState
                          ? "Search or type your city"
                          : "Select your state first"
                      }
                      value={
                        citySearch
                      }
                      disabled={
                        !deliveryState
                      }
                      onFocus={() =>
                        deliveryState &&
                        setCitySuggestionsOpen(
                          true
                        )
                      }
                      onChange={(event) => {
                        const value =
                          event.target
                            .value;

                        setCitySearch(
                          value
                        );

                        setDeliveryCity(
                          value
                        );

                        setCitySuggestionsOpen(
                          true
                        );
                      }}
                      required
                    />

                    {citySuggestionsOpen &&
                      deliveryState &&
                      filteredCities.length >
                        0 && (

                        <div className="city-suggestions">

                          {filteredCities.map(
                            (
                              city
                            ) => (

                              <button
                                type="button"
                                className="city-suggestion"
                                key={
                                  city
                                }
                                onMouseDown={(
                                  event
                                ) =>
                                  event.preventDefault()
                                }
                                onClick={() =>
                                  selectCity(
                                    city
                                  )
                                }
                              >
                                📍{" "}
                                {city}
                              </button>

                            )
                          )}

                        </div>

                      )}

                    <div className="city-help">
                      {deliveryState
                        ? "Choose a suggestion or type your city/town manually."
                        : "Select a state to see city suggestions."}
                    </div>

                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      padding:
                        "15px 0",
                    }}
                  >

                    <strong>
                      Order total
                    </strong>

                    <strong>
                      {money(
                        cartTotal
                      )}
                    </strong>

                  </div>

                  {orderMessage && (
                    <p className="auth-message">
                      {orderMessage}
                    </p>
                  )}

                  <button
                    className="modal-action"
                    type="submit"
                    disabled={
                      orderLoading
                    }
                  >
                    {orderLoading
                      ? "Opening Paystack..."
                      : `Pay ${money(
                          cartTotal
                        )}`}
                  </button>

                </form>

              </>

            )}

          </div>

        </div>

      )}

      {/* =========================
          CUSTOMER ACCOUNT
      ========================= */}

      {accountOpen && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setAccountOpen(
              false
            )
          }
        >

          <div
            className="account-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
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

                <p className="eyebrow">
                  SHINDARA ACCOUNT
                </p>

                <h2>
                  {profile?.name
                    ? `Hello, ${
                        profile.name.split(
                          " "
                        )[0]
                      } 👋`
                    : "My Account"}
                </h2>

                <div className="account-tabs">

                  <button
                    className={
                      accountTab ===
                      "profile"
                        ? "modal-action"
                        : "modal-secondary"
                    }
                    onClick={() =>
                      setAccountTab(
                        "profile"
                      )
                    }
                  >
                    👤 Profile
                  </button>

                  <button
                    className={
                      accountTab ===
                      "orders"
                        ? "modal-action"
                        : "modal-secondary"
                    }
                    onClick={() => {
                      setAccountTab(
                        "orders"
                      );
                      loadOrders();
                    }}
                  >
                    📦 Orders
                  </button>

                  <button
                    className={
                      accountTab ===
                      "settings"
                        ? "modal-action"
                        : "modal-secondary"
                    }
                    onClick={() => {
                      setAccountTab(
                        "settings"
                      );
                      setSettingsMessage(
                        ""
                      );
                      setPasswordMessage(
                        ""
                      );
                    }}
                  >
                    ⚙️ Settings
                  </button>

                </div>

                {/* PROFILE */}

                {accountTab ===
                  "profile" && (

                  <div>

                    <div className="profile-card">

                      <p className="eyebrow">
                        PERSONAL INFORMATION
                      </p>

                      <h3>
                        {profile?.name ||
                          profile?.full_name ||
                          "Customer"}
                      </h3>

                      <p>
                        📧{" "}
                        {
                          user.email
                        }
                      </p>

                      <p>
                        📱{" "}
                        {profile?.phone ||
                          "Phone number not added"}
                      </p>

                    </div>

                    <button
                      className="modal-action"
                      onClick={() =>
                        setAccountTab(
                          "settings"
                        )
                      }
                    >
                      Edit profile
                    </button>

                    <button
                      className="modal-secondary"
                      style={{
                        marginTop:
                          10,
                      }}
                      onClick={() => {
                        setAccountTab(
                          "orders"
                        );
                        loadOrders();
                      }}
                    >
                      View my orders
                    </button>

                  </div>

                )}

                {/* ORDERS */}

                {accountTab ===
                  "orders" && (

                  <div>

                    <p className="eyebrow">
                      ORDER HISTORY
                    </p>

                    <h3>
                      My Orders
                    </h3>

                    {ordersLoading ? (

                      <div
                        style={{
                          padding:
                            35,
                          textAlign:
                            "center",
                        }}
                      >
                        Loading your orders...
                      </div>

                    ) : ordersError ? (

                      <div
                        style={{
                          padding:
                            20,
                          textAlign:
                            "center",
                        }}
                      >

                        <p>
                          {ordersError}
                        </p>

                        <button
                          className="modal-action"
                          onClick={
                            loadOrders
                          }
                        >
                          Try again
                        </button>

                      </div>

                    ) : orders.length ===
                      0 ? (

                      <div
                        style={{
                          textAlign:
                            "center",
                          padding:
                            35,
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              50,
                          }}
                        >
                          📦
                        </div>

                        <h3>
                          No orders yet
                        </h3>

                        <p>
                          Your completed orders
                          will appear here.
                        </p>

                        <button
                          className="modal-action"
                          onClick={() => {
                            setAccountOpen(
                              false
                            );

                            window.location.hash =
                              "shop";
                          }}
                        >
                          Start shopping
                        </button>

                      </div>

                    ) : (

                      <div>

                        {orders.map(
                          (
                            order
                          ) => (

                            <div
                              className="order-card"
                              key={
                                order.id
                              }
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  gap: 12,
                                }}
                              >

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

                                  <p
                                    style={{
                                      opacity:
                                        .6,
                                      fontSize:
                                        13,
                                    }}
                                  >
                                    {formatDate(
                                      order.created_at
                                    )}
                                  </p>

                                </div>

                                <span
                                  style={{
                                    padding:
                                      "6px 10px",
                                    borderRadius:
                                      999,
                                    background:
                                      "rgba(128,128,128,.12)",
                                    fontSize:
                                      12,
                                    height:
                                      "fit-content",
                                  }}
                                >
                                  {statusLabel(
                                    order.status
                                  )}
                                </span>

                              </div>

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  alignItems:
                                    "center",
                                  marginTop:
                                    12,
                                }}
                              >

                                <strong>
                                  {money(
                                    order.total
                                  )}
                                </strong>

                                <button
                                  className="modal-secondary"
                                  style={{
                                    width:
                                      "auto",
                                  }}
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

                              </div>

                              {expandedOrder ===
                                order.id && (

                                <div
                                  style={{
                                    marginTop:
                                      15,
                                    paddingTop:
                                      15,
                                    borderTop:
                                      "1px solid rgba(128,128,128,.15)",
                                  }}
                                >

                                  {order.order_items?.map(
                                    (
                                      item
                                    ) => (

                                      <div
                                        key={
                                          item.id
                                        }
                                        style={{
                                          display:
                                            "flex",
                                          justifyContent:
                                            "space-between",
                                          padding:
                                            "8px 0",
                                          gap: 10,
                                        }}
                                      >

                                        <div>

                                          <strong>
                                            {
                                              item.product_name
                                            }
                                          </strong>

                                          <div
                                            style={{
                                              opacity:
                                                .6,
                                              fontSize:
                                                13,
                                            }}
                                          >
                                            Qty:{" "}
                                            {
                                              item.quantity
                                            }
                                          </div>

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

                              )}

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                )}

                {/* SETTINGS */}

                {accountTab ===
                  "settings" && (

                  <div>

                    <p className="eyebrow">
                      ACCOUNT SETTINGS
                    </p>

                    <h3>
                      Personal details
                    </h3>

                    <form
                      className="auth-form"
                      onSubmit={
                        saveProfileSettings
                      }
                    >

                      <input
                        type="text"
                        placeholder="Full name"
                        value={
                          profileName
                        }
                        onChange={(event) =>
                          setProfileName(
                            event.target
                              .value
                          )
                        }
                        required
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={
                          profilePhone
                        }
                        onChange={(event) =>
                          setProfilePhone(
                            event.target
                              .value
                          )
                        }
                        required
                      />

                      <input
                        type="email"
                        value={
                          user.email ||
                          ""
                        }
                        disabled
                      />

                      <button
                        className="modal-action"
                        type="submit"
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
                      <p className="auth-message">
                        {
                          settingsMessage
                        }
                      </p>
                    )}

                    <div
                      style={{
                        marginTop:
                          30,
                        paddingTop:
                          25,
                        borderTop:
                          "1px solid rgba(128,128,128,.15)",
                      }}
                    >

                      <p className="eyebrow">
                        SECURITY
                      </p>

                      <h3>
                        Change password
                      </h3>

                      <form
                        className="auth-form"
                        onSubmit={
                          changePassword
                        }
                      >

                        <input
                          type="password"
                          placeholder="New password"
                          value={
                            newPassword
                          }
                          onChange={(event) =>
                            setNewPassword(
                              event.target
                                .value
                            )
                          }
                          minLength={
                            6
                          }
                          required
                        />

                        <button
                          className="modal-action"
                          type="submit"
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
                        <p className="auth-message">
                          {
                            passwordMessage
                          }
                        </p>
                      )}

                    </div>

                    <button
                      className="modal-secondary"
                      style={{
                        marginTop:
                          25,
                      }}
                      onClick={
                        logout
                      }
                    >
                      🚪 Log out
                    </button>

                  </div>

                )}

              </>

            ) : (

              /* LOGIN / SIGNUP */

              <>

                <p className="eyebrow">
                  SHINDARA ACCOUNT
                </p>

                <h2>
                  {authMode ===
                  "signup"
                    ? "Create your account"
                    : "Welcome back"}
                </h2>

                <form
                  className="auth-form"
                  onSubmit={
                    handleAuth
                  }
                >

                  {authMode ===
                    "signup" && (
                    <>

                      <input
                        type="text"
                        placeholder="Full name"
                        value={
                          fullName
                        }
                        onChange={(event) =>
                          setFullName(
                            event.target
                              .value
                          )
                        }
                        required
                      />

                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={
                          phone
                        }
                        onChange={(event) =>
                          setPhone(
                            event.target
                              .value
                          )
                        }
                        required
                      />

                    </>
                  )}

                  <input
                    type="email"
                    placeholder="Email address"
                    value={
                      email
                    }
                    onChange={(event) =>
                      setEmail(
                        event.target
                          .value
                      )
                    }
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={
                      password
                    }
                    onChange={(event) =>
                      setPassword(
                        event.target
                          .value
                      )
                    }
                    minLength={
                      6
                    }
                    required
                  />

                  {authMode ===
                    "login" && (

                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() => {
                        setForgotPassword(
                          true
                        );

                        setResetEmail(
                          email
                        );

                        setResetMessage(
                          ""
                        );
                      }}
                    >
                      Forgot password?
                    </button>

                  )}

                  <button
                    className="modal-action"
                    type="submit"
                    disabled={
                      authLoading
                    }
                  >
                    {authLoading
                      ? "Please wait..."
                      : authMode ===
                        "signup"
                      ? "Create account"
                      : "Sign in"}
                  </button>

                </form>

                {authMessage && (
                  <p className="auth-message">
                    {authMessage}
                  </p>
                )}

                {authMode ===
                  "login" && (

                  <>
                    <div className="auth-divider">
                      <span>
                        or continue with
                      </span>
                    </div>

                    <div className="social-auth-buttons">

                      <button
                        type="button"
                        className="social-auth-button"
                        onClick={() =>
                          signInWithProvider(
                            "google"
                          )
                        }
                        disabled={
                          authLoading
                        }
                      >
                        Google
                      </button>

                      <button
                        type="button"
                        className="social-auth-button"
                        onClick={() =>
                          signInWithProvider(
                            "apple"
                          )
                        }
                        disabled={
                          authLoading
                        }
                      >
                        Apple
                      </button>

                    </div>
                  </>

                )}

                <button
                  className="modal-secondary"
                  style={{
                    marginTop:
                      12,
                  }}
                  onClick={() => {
                    setAuthMessage("");

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
                    ? "Create a new account"
                    : "Already have an account? Sign in"}
                </button>

              </>

            )}

          </div>

        </div>

      )}

      {/* =========================
          FORGOT PASSWORD
      ========================= */}

      {forgotPassword && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setForgotPassword(
              false
            )
          }
        >

          <div
            className="account-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setForgotPassword(
                  false
                )
              }
            >
              ×
            </button>

            <p className="eyebrow">
              SHINDARA ACCOUNT
            </p>

            <h2>
              Reset your password
            </h2>

            <p
              style={{
                opacity:
                  .65,
              }}
            >
              Enter your email and we'll send
              you a password reset link.
            </p>

            <form
              className="auth-form"
              onSubmit={
                handleForgotPassword
              }
            >

              <input
                type="email"
                placeholder="Email address"
                value={
                  resetEmail
                }
                onChange={(event) =>
                  setResetEmail(
                    event.target
                      .value
                  )
                }
                required
              />

              <button
                className="modal-action"
                type="submit"
                disabled={
                  resetLoading
                }
              >
                {resetLoading
                  ? "Sending..."
                  : "Send reset link"}
              </button>

            </form>

            {resetMessage && (
              <p className="auth-message">
                {
                  resetMessage
                }
              </p>
            )}

            <button
              className="modal-secondary"
              onClick={() =>
                setForgotPassword(
                  false
                )
              }
            >
              Back to sign in
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
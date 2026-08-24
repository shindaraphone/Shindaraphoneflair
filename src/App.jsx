import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP = "2348118294548";

const TIKTOK =
  "https://www.tiktok.com/@shindara.communication";

const PAYSTACK_PUBLIC_KEY =
  "pk_live_d7a7a78de15d84169736f5786afb59709b639905";

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
      existingScript.addEventListener("load", () =>
        resolve(window.PaystackPop)
      );

      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://js.paystack.co/v2/inline.js";

    script.async = true;

    script.onload = () => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
      } else {
        reject(
          new Error(
            "Paystack could not be loaded."
          )
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error(
          "Unable to load Paystack."
        )
      );
    };

    document.body.appendChild(script);
  });
}

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [accountTab, setAccountTab] =
    useState("profile");

  const [user, setUser] = useState(null);
  const [profile, setProfile] =
    useState(null);

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

  const [profileName, setProfileName] =
    useState("");

  const [profilePhone, setProfilePhone] =
    useState("");

  const [settingsMessage, setSettingsMessage] =
    useState("");

  const [settingsLoading, setSettingsLoading] =
    useState(false);

  const [newPassword, setNewPassword] =
    useState("");

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [orders, setOrders] =
    useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [ordersError, setOrdersError] =
    useState("");

  const [expandedOrder, setExpandedOrder] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  const [productsLoading, setProductsLoading] =
    useState(true);

  const [productsError, setProductsError] =
    useState("");

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

  const [orderLoading, setOrderLoading] =
    useState(false);

  const [orderMessage, setOrderMessage] =
    useState("");

  const [orderSuccess, setOrderSuccess] =
    useState(false);

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
      setProfileName(
        data.name || ""
      );

      setProfilePhone(
        data.phone || ""
      );

      setCustomerName(
        data.name || ""
      );

      setCustomerPhone(
        data.phone || ""
      );
    }
  }

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

        const { data, error } =
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
          setAuthMessage(
            error.message
          );
          return;
        }

        if (data?.user) {
          const {
            error: profileError,
          } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              name: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
            });

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

      const { data, error } =
        await supabase.auth.signInWithPassword(
          {
            email: email.trim(),
            password,
          }
        );

      if (error) {
        setAuthMessage(
          error.message
        );
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

      const { error } =
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            name: cleanName,
            phone: cleanPhone,
            email:
              user.email || "",
          });

      if (error) {
        throw error;
      }

      await loadProfile(
        user.id
      );

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
          password:
            newPassword,
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

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setOrders([]);
    setAccountOpen(false);
  }

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find(
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

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(
        item.quantity || 0
      ),
    0
  );

  const cartTotal = cart.reduce(
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

  async function saveOrder(
    reference
  ) {
    const { data: order, error: orderError } =
      await supabase
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
          item.image_url ||
          null,
      })
    );

    const { error: itemsError } =
      await supabase
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
        key: PAYSTACK_PUBLIC_KEY,

        email: user.email,

        amount: amountInKobo,

        currency: "NGN",

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

          user_id: user.id,
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

              setCustomerName(
                ""
              );

              setCustomerPhone(
                ""
              );

              setDeliveryAddress(
                ""
              );

              setDeliveryCity(
                ""
              );

              setDeliveryState(
                ""
              );
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

        onCancel: () => {
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

  function statusLabel(status) {
    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  return (
    <div className="app">

      <header className="header">

        <a
          href="#home"
          className="logo"
        >
          Shindara
          <span>
            Phoneflair
          </span>
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
            onClick={
              openAccount
            }
          >
            👤{" "}
            {user
              ? "Account"
              : "Sign in"}
          </button>

          <button
            className="cart-button"
            onClick={() =>
              setCartOpen(
                true
              )
            }
          >
            🛒 Cart (
            {cartCount})
          </button>

        </div>

      </header>

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
              Phones, accessories,
              chargers, audio products,
              power banks and everyday
              gadgets.
            </p>

            <a
              href="#shop"
              className="shop-button"
            >
              Shop now →
            </a>

          </div>

        </section>

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
              [
                "📱",
                "Smartphones",
              ],
              [
                "🛡️",
                "Phone Cases",
              ],
              [
                "⚡",
                "Chargers",
              ],
              [
                "🎧",
                "Audio",
              ],
              [
                "🔋",
                "Power Banks",
              ],
              [
                "✨",
                "Gadgets",
              ],
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
                padding:
                  "50px",
                textAlign:
                  "center",
              }}
            >
              Loading products...
            </div>

          ) : productsError ? (

            <div
              style={{
                padding:
                  "50px",
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
                padding:
                  "50px",
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
                    key={product.id}
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
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                          }}
                        />

                      ) : (

                        <span>
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
                              0.7,
                            fontSize:
                              "14px",
                            lineHeight:
                              "1.5",
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

        <section className="trust-section">

          <div>
            <span>
              🚚
            </span>

            <h3>
              Reliable delivery
            </h3>

            <p>
              Get your order delivered
              safely.
            </p>
          </div>

          <div>
            <span>
              🔒
            </span>

            <h3>
              Secure shopping
            </h3>

            <p>
              Shop with confidence.
            </p>
          </div>

          <div>
            <span>
              💬
            </span>

            <h3>
              Customer support
            </h3>

            <p>
              We're here whenever
              you need us.
            </p>
          </div>

        </section>

      </main>

      <footer id="contact">

        <div>

          <strong className="footer-logo">
            Shindara Phoneflair
          </strong>

          <p>
            Phones • Accessories •
            Gadgets • Electronics
          </p>

          <div className="social-links">

            <button
              className="social-button"
              onClick={whatsapp}
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

      <button
        className="whatsapp-floating"
        onClick={whatsapp}
      >
        💬
      </button>

      {/* CART */}

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
                  setCartOpen(
                    false
                  )
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
                      "55px",
                  }}
                >
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add something you
                  love from our
                  store.
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
                        key={item.id}
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
                            {
                              item.name
                            }
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

      {/* CHECKOUT */}

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
            className="account-modal checkout-modal"
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
                      "60px",
                    marginBottom:
                      "15px",
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
                      0.7,
                    marginBottom:
                      "20px",
                  }}
                >
                  Tell us where to
                  deliver your order.
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

                  <input
                    type="text"
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
                    required
                  />

                  <input
                    type="text"
                    placeholder="City"
                    value={
                      deliveryCity
                    }
                    onChange={(event) =>
                      setDeliveryCity(
                        event.target
                          .value
                      )
                    }
                    required
                  />

                  <input
                    type="text"
                    placeholder="State"
                    value={
                      deliveryState
                    }
                    onChange={(event) =>
                      setDeliveryState(
                        event.target
                          .value
                      )
                    }
                    required
                  />

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      padding:
                        "15px 0",
                      fontSize:
                        "18px",
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

      {/* CUSTOMER ACCOUNT */}

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
            style={{
              maxWidth:
                "620px",
            }}
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

                {/* ACCOUNT NAVIGATION */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap:
                      "8px",
                    margin:
                      "25px 0",
                  }}
                >

                  <button
                    className={
                      accountTab ===
                      "profile"
                        ? "modal-action"
                        : "modal-secondary"
                    }
                    onClick={() => {
                      setAccountTab(
                        "profile"
                      );
                      setSettingsMessage(
                        ""
                      );
                    }}
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

                    <div
                      style={{
                        padding:
                          "20px",
                        borderRadius:
                          "18px",
                        background:
                          "rgba(128,128,128,0.08)",
                        marginBottom:
                          "15px",
                      }}
                    >

                      <p className="eyebrow">
                        PERSONAL INFORMATION
                      </p>

                      <h3>
                        {profile?.name ||
                          "Customer"}
                      </h3>

                      <p>
                        📧{" "}
                        {user.email}
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
                          "10px",
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
                            "35px 10px",
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
                            "20px",
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
                            "35px 10px",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "50px",
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
                          (order) => (

                            <div
                              key={
                                order.id
                              }
                              style={{
                                padding:
                                  "18px",
                                border:
                                  "1px solid rgba(128,128,128,0.2)",
                                borderRadius:
                                  "18px",
                                marginBottom:
                                  "12px",
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  gap:
                                    "12px",
                                  alignItems:
                                    "flex-start",
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
                                        0.65,
                                      fontSize:
                                        "13px",
                                      margin:
                                        "5px 0",
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
                                      "999px",
                                    background:
                                      "rgba(128,128,128,0.12)",
                                    fontSize:
                                      "12px",
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
                                    "12px",
                                }}
                              >

                                <strong>
                                  {money(
                                    order.total
                                  )}
                                </strong>

                                <button
                                  className="modal-secondary"
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
                                      "15px",
                                    paddingTop:
                                      "15px",
                                    borderTop:
                                      "1px solid rgba(128,128,128,0.15)",
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
                                          gap:
                                            "10px",
                                          padding:
                                            "8px 0",
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
                                                0.65,
                                              fontSize:
                                                "13px",
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
                        onChange={(
                          event
                        ) =>
                          setProfileName(
                            event
                              .target
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
                        onChange={(
                          event
                        ) =>
                          setProfilePhone(
                            event
                              .target
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
                          "30px",
                        paddingTop:
                          "25px",
                        borderTop:
                          "1px solid rgba(128,128,128,0.15)",
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
                          onChange={(
                            event
                          ) =>
                            setNewPassword(
                              event
                                .target
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
                          "25px",
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
                        onChange={(
                          event
                        ) =>
                          setFullName(
                            event
                              .target
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
                        onChange={(
                          event
                        ) =>
                          setPhone(
                            event
                              .target
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
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event
                          .target
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
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event
                          .target
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
                    {
                      authMessage
                    }
                  </p>
                )}

                <button
                  className="modal-secondary"
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
                    ? "Create a new account"
                    : "Already have an account? Sign in"}
                </button>

              </>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;
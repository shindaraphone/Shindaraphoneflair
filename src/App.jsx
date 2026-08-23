import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP = "2348118294548";
const TIKTOK =
  "https://www.tiktok.com/@shindara.communication";

const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://js.paystack.co/v2/inline.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () =>
        resolve()
      );

      existingScript.addEventListener("error", () =>
        reject(
          new Error(
            "Paystack could not be loaded."
          )
        )
      );

      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://js.paystack.co/v2/inline.js";

    script.async = true;

    script.onload = () => resolve();

    script.onerror = () =>
      reject(
        new Error(
          "Unable to load Paystack. Please check your internet connection and try again."
        )
      );

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

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] =
    useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [authMessage, setAuthMessage] =
    useState("");
  const [authLoading, setAuthLoading] =
    useState(false);

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

      if (mounted) {
        setUser(data?.user ?? null);
      }
    }

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel("store-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products"
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

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false
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

  async function handleAuth(event) {
    event.preventDefault();

    setAuthLoading(true);
    setAuthMessage("");

    try {
      if (authMode === "signup") {
        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password
          });

        if (error) {
          setAuthMessage(error.message);
          return;
        }

        if (data?.user && !data.session) {
          setAuthMessage(
            "Account created successfully! Please check your email to confirm your account."
          );
        } else {
          setAuthMessage(
            "Account created successfully!"
          );
        }

        setPassword("");
        return;
      }

      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

      if (error) {
        setAuthMessage(error.message);
        return;
      }

      setEmail("");
      setPassword("");
      setAuthMessage("");
      setAccountOpen(false);
    } catch (error) {
      setAuthMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setAccountOpen(false);
  }

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1
              }
            : item
        );
      }

      return [
        ...items,
        {
          ...product,
          quantity: 1
        }
      ];
    });

    setCartOpen(true);
  }

  function increaseQuantity(id) {
    setCart((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1
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
                  item.quantity - 1
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
        (item) => item.id !== id
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  function openCheckout() {
    if (!cart.length) {
      return;
    }

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

  async function verifyPayment(reference) {
    const { data, error } =
      await supabase.functions.invoke(
        "verify-paystack-payment",
        {
          body: {
            reference
          }
        }
      );

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(
        data?.error ||
          "Payment could not be verified."
      );
    }

    return data.data;
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

    if (!PAYSTACK_PUBLIC_KEY) {
      setOrderMessage(
        "Payment is not configured yet. Please contact support."
      );
      return;
    }

    setOrderLoading(true);
    setOrderMessage("");

    let createdOrder = null;

    try {
      /*
       * STEP 1
       * Create the order as pending.
       */

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
            status: "pending",
            payment_status: "unpaid"
          })
          .select()
          .single();

      if (orderError) {
        throw orderError;
      }

      createdOrder = order;

      /*
       * STEP 2
       * Save the products inside the order.
       */

      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: Number(item.price || 0),
        quantity: Number(
          item.quantity || 1
        ),
        image_url:
          item.image_url || null
      }));

      const { error: itemsError } =
        await supabase
          .from("order_items")
          .insert(items);

      if (itemsError) {
        await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        throw itemsError;
      }

      /*
       * STEP 3
       * Load Paystack.
       */

      await loadPaystackScript();

      if (!window.PaystackPop) {
        throw new Error(
          "Paystack failed to load. Please try again."
        );
      }

      /*
       * Paystack uses the smallest currency unit.
       * For NGN, that means Kobo.
       *
       * Example:
       * ₦1,000 = 100,000 Kobo
       */

      const amountInKobo = Math.round(
        Number(cartTotal) * 100
      );

      if (amountInKobo <= 0) {
        throw new Error(
          "Your order total must be greater than ₦0."
        );
      }

      /*
       * STEP 4
       * Open Paystack checkout.
       */

      const paystack =
        new window.PaystackPop();

      const firstName =
        customerName
          .trim()
          .split(" ")[0] ||
        "Customer";

      const remainingName =
        customerName
          .trim()
          .split(" ")
          .slice(1)
          .join(" ");

      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,

        email:
          user.email ||
          email.trim(),

        amount: amountInKobo,

        currency: "NGN",

        firstName,

        lastName:
          remainingName || "",

        phone:
          customerPhone.trim(),

        metadata: {
          order_id: order.id,
          customer_name:
            customerName.trim(),
          customer_phone:
            customerPhone.trim(),
          delivery_city:
            deliveryCity.trim(),
          delivery_state:
            deliveryState.trim()
        },

        onSuccess: async (transaction) => {
          try {
            setOrderLoading(true);
            setOrderMessage(
              "Payment successful. Verifying your payment..."
            );

            /*
             * STEP 5
             * Verify the transaction securely
             * through the Supabase Edge Function.
             */

            const paymentData =
              await verifyPayment(
                transaction.reference
              );

            /*
             * Double-check the amount returned
             * by Paystack before marking the
             * order as paid.
             */

            const expectedAmount =
              Math.round(
                Number(cartTotal) * 100
              );

            const paidAmount =
              Number(
                paymentData?.amount || 0
              );

            if (
              paymentData?.status !==
                "success" ||
              paidAmount !==
                expectedAmount
            ) {
              throw new Error(
                "Payment verification failed because the payment amount does not match the order."
              );
            }

            /*
             * STEP 6
             * Mark order as paid.
             */

            const {
              error: updateError
            } = await supabase
              .from("orders")
              .update({
                payment_reference:
                  transaction.reference,

                payment_status:
                  "paid",

                status: "pending"
              })
              .eq("id", order.id);

            if (updateError) {
              throw updateError;
            }

            /*
             * STEP 7
             * Show success.
             */

            setOrderSuccess(true);

            setOrderMessage(
              `Payment successful! Your order number is ${order.id
                .slice(0, 8)
                .toUpperCase()}.`
            );

            setCart([]);

            setCustomerName("");
            setCustomerPhone("");
            setDeliveryAddress("");
            setDeliveryCity("");
            setDeliveryState("");
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setOrderMessage(
              error?.message ||
                "Payment was received, but we could not verify it automatically. Please contact support."
            );
          } finally {
            setOrderLoading(false);
          }
        },

        onCancel: async () => {
          try {
            await supabase
              .from("orders")
              .update({
                payment_status:
                  "cancelled"
              })
              .eq("id", order.id);
          } catch (error) {
            console.error(
              "Cancel update error:",
              error
            );
          }

          setOrderLoading(false);

          setOrderMessage(
            "Payment was cancelled. Your order has not been confirmed."
          );
        }
      });
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      if (createdOrder?.id) {
        try {
          await supabase
            .from("orders")
            .update({
              payment_status:
                "failed"
            })
            .eq("id", createdOrder.id);
        } catch (updateError) {
          console.error(
            "Order status update error:",
            updateError
          );
        }
      }

      setOrderMessage(
        error?.message ||
          "Something went wrong while starting your payment. Please try again."
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

  return (
    <div className="app">

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
            onClick={() => {
              setAuthMessage("");
              setAccountOpen(true);
            }}
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
              ["📱", "Smartphones"],
              ["🛡️", "Phone Cases"],
              ["⚡", "Chargers"],
              ["🎧", "Audio"],
              ["🔋", "Power Banks"],
              ["✨", "Gadgets"]
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
                padding: "50px",
                textAlign: "center"
              }}
            >
              Loading products...
            </div>

          ) : productsError ? (

            <div
              style={{
                padding: "50px",
                textAlign: "center"
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

          ) : products.length === 0 ? (

            <div
              style={{
                padding: "50px",
                textAlign: "center"
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
                            width: "100%",
                            height: "100%",
                            objectFit:
                              "cover"
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
                            opacity: 0.7,
                            fontSize:
                              "14px",
                            lineHeight:
                              "1.5"
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
                        product.stock || 0
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
                  setCartOpen(false)
                }
              >
                ×
              </button>

            </div>

            {cart.length === 0 ? (

              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "60px 20px"
                }}
              >

                <div
                  style={{
                    fontSize:
                      "55px"
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
              disabled={
                orderLoading
              }
              onClick={() =>
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
                    "25px 5px"
                }}
              >

                <div
                  style={{
                    fontSize:
                      "60px",
                    marginBottom:
                      "15px"
                  }}
                >
                  ✅
                </div>

                <p className="eyebrow">
                  PAYMENT SUCCESSFUL
                </p>

                <h2>
                  Thank you!
                </h2>

                <p className="auth-message">
                  {orderMessage}
                </p>

                <p
                  style={{
                    marginTop:
                      "10px",
                    opacity: 0.7
                  }}
                >
                  Your payment has been
                  verified successfully.
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
                      "20px"
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
                        "18px"
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
                      ? "Processing payment..."
                      : `Pay ${money(
                          cartTotal
                        )}`}
                  </button>

                  <p
                    style={{
                      textAlign:
                        "center",
                      fontSize:
                        "12px",
                      opacity: 0.6,
                      marginTop:
                        "10px"
                    }}
                  >
                    Secure payment powered
                    by Paystack
                  </p>

                </form>

              </>

            )}

          </div>

        </div>

      )}

      {/* ACCOUNT */}

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
                  MY ACCOUNT
                </p>

                <h2>
                  Welcome back 👋
                </h2>

                <p className="account-email">
                  {user.email}
                </p>

                <button
                  className="modal-action"
                  onClick={
                    logout
                  }
                >
                  Log out
                </button>

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

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
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

    </div>
  );
}

export default App;

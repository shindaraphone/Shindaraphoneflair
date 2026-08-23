import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const WHATSAPP = "2348118294548";
const TIKTOK = "https://www.tiktok.com/@shindara.communication";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();

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
              quantity: item.quantity + 1
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
                quantity: item.quantity - 1
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((items) =>
      items.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  function whatsapp() {
    const message = encodeURIComponent(
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

        <a href="#home" className="logo">
          Shindara<span>Phoneflair</span>
        </a>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#categories">
            Categories
          </a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">

          <button
            className="account-button"
            onClick={() => {
              setAuthMessage("");
              setAccountOpen(true);
            }}
          >
            👤 {user ? "Account" : "Sign in"}
          </button>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
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
              Phones, accessories, chargers,
              audio products, power banks
              and everyday gadgets.
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
            ].map(([icon, name]) => (

              <a
                href="#shop"
                className="category-card"
                key={name}
              >
                <span>{icon}</span>

                <strong>
                  {name}
                </strong>
              </a>

            ))}

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
                onClick={loadProducts}
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

              {products.map((product) => (

                <article
                  className="product-card"
                  key={product.id}
                >

                  <div className="product-image">

                    {product.image_url ? (

                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
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
                          fontSize: "14px",
                          lineHeight: "1.5"
                        }}
                      >
                        {product.description}
                      </p>
                    )}

                    <p className="price">
                      {money(product.price)}
                    </p>

                    {Number(product.stock || 0) >
                    0 ? (

                      <button
                        className="add-button"
                        onClick={() =>
                          addToCart(product)
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

              ))}

            </div>

          )}

        </section>

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

      {/* CART DRAWER */}

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
                  textAlign: "center",
                  padding: "60px 20px"
                }}
              >

                <div
                  style={{
                    fontSize: "55px"
                  }}
                >
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add something you love
                  from our store.
                </p>

                <button
                  className="modal-action"
                  onClick={() =>
                    setCartOpen(false)
                  }
                >
                  Continue shopping
                </button>

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

                        {item.image_url ? (

                          <img
                            src={item.image_url}
                            alt={item.name}
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
                          {money(item.price)}
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
                            {item.quantity}
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

                  ))}

                </div>

                <div className="cart-footer">

                  <div className="cart-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      {money(cartTotal)}
                    </strong>

                  </div>

                  <button
                    className="checkout-button"
                    onClick={() => {
                      alert(
                        "Checkout is the next step. Your cart is ready!"
                      );
                    }}
                  >
                    Continue to checkout →
                  </button>

                  <button
                    className="clear-cart-button"
                    onClick={clearCart}
                  >
                    Clear cart
                  </button>

                </div>

              </>

            )}

          </aside>

        </div>

      )}

      {/* ACCOUNT */}

      {accountOpen && (

        <div
          className="modal-backdrop"
          onClick={() =>
            setAccountOpen(false)
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
                setAccountOpen(false)
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
                  onClick={logout}
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
                  {authMode === "signup"
                    ? "Create your account"
                    : "Welcome back"}
                </h2>

                <form
                  className="auth-form"
                  onSubmit={handleAuth}
                >

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    minLength={6}
                    required
                  />

                  <button
                    className="modal-action"
                    type="submit"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? "Please wait..."
                      : authMode === "signup"
                      ? "Create account"
                      : "Sign in"}
                  </button>

                </form>

                {authMessage && (
                  <p className="auth-message">
                    {authMessage}
                  </p>
                )}

                <button
                  className="modal-secondary"
                  onClick={() => {
                    setAuthMessage("");

                    setAuthMode(
                      authMode === "login"
                        ? "signup"
                        : "login"
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

    </div>
  );
}

export default App;

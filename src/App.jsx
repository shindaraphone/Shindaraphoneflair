import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./Supabaseclient.js";
import "./shindara-redesign.css";

const money = (n) =>
  `₦${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
  })}`;

const emptyCheckout = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  delivery_address: "",
  delivery_city: "",
  delivery_state: "",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [checkout, setCheckout] = useState(emptyCheckout);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [notice, setNotice] = useState("");

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2800);
  };

  /* =========================
     AUTH
  ========================= */

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

      await Promise.all([loadProducts(), loadCategories()]);

      setLoading(false);
    };

    start();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        await loadUser(session.user);
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

  const loadUser = async (currentUser) => {
    if (!currentUser) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    setProfile(profileData || null);

    setCheckout((old) => ({
      ...old,
      customer_name:
        profileData?.full_name ||
        currentUser.user_metadata?.full_name ||
        old.customer_name,
      customer_phone:
        profileData?.phone ||
        currentUser.user_metadata?.phone ||
        old.customer_phone,
      customer_email: currentUser.email || old.customer_email,
    }));

    await Promise.all([
      loadCart(currentUser.id),
      loadOrders(currentUser.id),
    ]);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProducts(data || []);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*");

    if (!error) setCategories(data || []);
  };

  const loadCart = async (userId) => {
    if (!userId) {
      setCart([]);
      return;
    }

    setCartLoading(true);

    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!error) {
      setCart(data || []);
    }

    setCartLoading(false);
  };

  const loadOrders = async (userId) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  };

  const login = async () => {
    setAuthLoading(true);
    setAuthMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

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
    showNotice("Welcome back 👋🏽");
  };

  const signup = async () => {
    setAuthLoading(true);
    setAuthMessage("");

    if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
      setAuthMessage("Please complete all fields.");
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

    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: email.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
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

  const logout = async () => {
    await supabase.auth.signOut();
    setCart([]);
    setOrders([]);
    setProfile(null);
    setAccountOpen(false);
    setCartOpen(false);
    showNotice("You have been logged out.");
  };

  const submitAuth = async (e) => {
    e.preventDefault();

    if (authMode === "signup") {
      await signup();
    } else {
      await login();
    }
  };

  /* =========================
     CART
  ========================= */

  const addToCart = async (product) => {
    if (!user) {
      setAccountOpen(true);
      setAuthMode("login");
      setAuthMessage("Please login or create an account before shopping.");
      return;
    }

    if (Number(product.stock) <= 0) {
      showNotice("This product is currently out of stock.");
      return;
    }

    const existing = cart.find((item) => item.product_id === product.id);

    if (existing) {
      const newQuantity = Number(existing.quantity) + 1;

      if (newQuantity > Number(product.stock)) {
        showNotice("You have reached the available stock.");
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existing.id)
        .eq("user_id", user.id);

      if (!error) {
        setCart((old) =>
          old.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        })
        .select()
        .single();

      if (!error && data) {
        setCart((old) => [...old, data]);
      }
    }

    setCartOpen(false);
    showNotice(`${product.name} added to your cart.`);
  };

  const updateQuantity = async (item, change) => {
    if (!user) return;

    const product = products.find((p) => p.id === item.product_id);
    if (!product) return;

    const newQuantity = Number(item.quantity) + change;

    if (newQuantity <= 0) {
      await removeFromCart(item);
      return;
    }

    if (newQuantity > Number(product.stock)) {
      showNotice("No more stock is available.");
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (!error) {
      setCart((old) =>
        old.map((x) =>
          x.id === item.id ? { ...x, quantity: newQuantity } : x
        )
      );
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
      setCart((old) => old.filter((x) => x.id !== item.id));
    }
  };

  const cartProducts = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.product_id);

        if (!product) return null;

        return {
          ...item,
          product,
          subtotal: Number(product.price) * Number(item.quantity),
        };
      })
      .filter(Boolean);
  }, [cart, products]);

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const cartTotal = cartProducts.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  /* =========================
     PRODUCTS
  ========================= */

  const categoryNames = useMemo(() => {
    const names = categories
      .map((c) => c.name || c.title || c.category)
      .filter(Boolean);

    const productNames = products
      .map((p) => p.category)
      .filter(Boolean);

    return ["All", ...new Set([...names, ...productNames])];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const featuredProducts = filteredProducts.filter(
    (product) => product.featured
  );

  /* =========================
     CHECKOUT
  ========================= */

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
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      setCheckoutMessage("Please login first.");
      return;
    }

    if (!cartProducts.length) {
      setCheckoutMessage("Your cart is empty.");
      return;
    }

    if (
      !checkout.customer_name.trim() ||
      !checkout.customer_phone.trim() ||
      !checkout.delivery_address.trim() ||
      !checkout.delivery_city.trim() ||
      !checkout.delivery_state.trim()
    ) {
      setCheckoutMessage("Please complete your delivery information.");
      return;
    }

    setPlacingOrder(true);
    setCheckoutMessage("");

    const deliveryFee = 0;
    const total = cartTotal + deliveryFee;

    const paymentReference = `SFP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name: checkout.customer_name.trim(),
        customer_phone: checkout.customer_phone.trim(),
        customer_email:
          checkout.customer_email.trim() || user.email || null,
        delivery_address: checkout.delivery_address.trim(),
        delivery_city: checkout.delivery_city.trim(),
        delivery_state: checkout.delivery_state.trim(),
        total,
        delivery_fee: deliveryFee,
        status: "pending",
        payment_reference: paymentReference,
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      setCheckoutMessage(
        orderError?.message || "Unable to create your order."
      );
      setPlacingOrder(false);
      return;
    }

    const items = cartProducts.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      price: Number(item.product.price),
      quantity: Number(item.quantity),
      image_url: item.product.image_url || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      setCheckoutMessage(itemsError.message);
      setPlacingOrder(false);
      return;
    }

    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    setCart([]);
    await loadOrders(user.id);

    setCheckoutOpen(false);
    setCheckout(emptyCheckout);
    setPlacingOrder(false);

    showNotice(`Order placed successfully • ${paymentReference}`);
    setOrdersOpen(true);
  };

  /* =========================
     UI
  ========================= */

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingLogo}>S</div>
        <strong>Shindara Phoneflair</strong>
        <span>Loading your store...</span>
      </div>
    );
  }

  return (
    <div className="app" style={styles.app}>
      {/* ANNOUNCEMENT */}
      <div style={styles.announcement}>
        <div style={styles.marquee}>
          PREMIUM PHONE ACCESSORIES • BEAUTIFULLY SELECTED •
          PREMIUM PHONE ACCESSORIES • BEAUTIFULLY SELECTED •
        </div>
      </div>

      {/* HEADER */}
      <header className="header" style={styles.header}>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={styles.logoButton}
        >
          <span style={styles.logoMain}>SHINDARA</span>
          <span style={styles.logoSub}>PHONEFLAIR</span>
        </button>

        <nav style={styles.nav}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={styles.navButton}
          >
            Home
          </button>

          <button
            onClick={() =>
              document
                .getElementById("shop")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            style={styles.navButton}
          >
            Shop
          </button>

          <button
            onClick={() =>
              document
                .getElementById("categories")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            style={styles.navButton}
          >
            Categories
          </button>
        </nav>

        <div style={styles.headerActions}>
          <button
            style={styles.accountButton}
            onClick={() => {
              setAccountOpen(true);
              setAuthMessage("");
            }}
          >
            {user ? "Account" : "Login"}
          </button>

          <button
            style={styles.cartButton}
            onClick={() => {
              if (!user) {
                setAccountOpen(true);
                setAuthMessage("Please login to access your cart.");
              } else {
                setCartOpen(true);
              }
            }}
          >
            Cart {user && cartCount > 0 ? `(${cartCount})` : ""}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" style={styles.hero}>
        <div style={styles.heroGlow} />

        <div className="hero-content" style={styles.heroContent}>
          <div className="eyebrow" style={styles.eyebrow}>
            SHINDARA PHONEFLAIR
          </div>

          <h1 style={styles.heroTitle}>
            Technology,
            <br />
            beautifully selected.
          </h1>

          <p className="hero-text" style={styles.heroText}>
            Premium phone accessories, chargers, audio products,
            power banks and everyday gadgets made for the way you live.
          </p>

          <button
            className="shop-button"
            style={styles.shopButton}
            onClick={() =>
              document
                .getElementById("shop")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Shop accessories <span>→</span>
          </button>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroCardSmall}>THE SHINDARA EDIT</span>
          <strong>Better accessories.</strong>
          <strong>Better everyday.</strong>
          <span style={styles.heroCardLine} />
          <span style={styles.heroCardText}>
            Curated tech essentials for your phone and your lifestyle.
          </span>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="section" style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <span style={styles.kicker}>EXPLORE</span>
            <h2 style={styles.sectionTitle}>Shop by category</h2>
          </div>
        </div>

        <div className="category-grid" style={styles.categoryGrid}>
          {categoryNames.slice(0, 9).map((name) => (
            <button
              key={name}
              className="category-card"
              style={styles.categoryCard}
              onClick={() => {
                setCategory(name);
                document
                  .getElementById("shop")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span style={styles.categoryIcon}>
                {categoryIcon(name)}
              </span>
              <strong>{name}</strong>
              <span style={styles.categoryArrow}>→</span>
            </button>
          ))}
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="section" style={styles.shopSection}>
        <div style={styles.shopTop}>
          <div>
            <span style={styles.kicker}>SHINDARA STORE</span>
            <h2 style={styles.sectionTitle}>Popular picks</h2>
          </div>

          <div style={styles.searchWrap}>
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accessories..."
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.filters}>
          {categoryNames.slice(0, 8).map((name) => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              style={{
                ...styles.filter,
                ...(category === name ? styles.filterActive : {}),
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div style={styles.emptyProducts}>
            <div style={styles.emptyIcon}>⌕</div>
            <h3>No products found</h3>
            <p>Try another search or category.</p>
          </div>
        ) : (
          <div className="product-grid" style={styles.productGrid}>
            {(featuredProducts.length && !search && category === "All"
              ? featuredProducts
              : filteredProducts
            )
              .slice(0, 12)
              .map((product) => (
                <article
                  className="product-card"
                  style={styles.productCard}
                  key={product.id}
                >
                  <div
                    className="product-image"
                    style={styles.productImage}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={styles.productImg}
                      />
                    ) : (
                      <div style={styles.noImage}>S</div>
                    )}

                    {Number(product.stock) <= 0 && (
                      <span style={styles.outStock}>OUT OF STOCK</span>
                    )}
                  </div>

                  <div className="product-info" style={styles.productInfo}>
                    <span
                      className="product-category"
                      style={styles.productCategory}
                    >
                      {product.category || "ACCESSORY"}
                    </span>

                    <h3 style={styles.productName}>{product.name}</h3>

                    <p style={styles.productDescription}>
                      {product.description || "Premium tech essential."}
                    </p>

                    <div style={styles.productBottom}>
                      <strong className="price" style={styles.price}>
                        {money(product.price)}
                      </strong>

                      <button
                        className="add-button"
                        style={styles.addButton}
                        onClick={() => addToCart(product)}
                        disabled={Number(product.stock) <= 0}
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

      {/* TRUST */}
      <section className="trust-section" style={styles.trust}>
        <div style={styles.trustItem}>
          <span style={styles.trustIcon}>✦</span>
          <h3>Reliable delivery</h3>
          <p>Your order is handled with care from store to doorstep.</p>
        </div>

        <div style={styles.trustItem}>
          <span style={styles.trustIcon}>⌾</span>
          <h3>Secure shopping</h3>
          <p>Your account and shopping experience stay protected.</p>
        </div>

        <div style={styles.trustItem}>
          <span style={styles.trustIcon}>◌</span>
          <h3>Customer support</h3>
          <p>We're here whenever you need help with your order.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div>
          <div style={styles.footerLogo}>SHINDARA PHONEFLAIR</div>
          <p style={styles.footerText}>
            Premium phone accessories and everyday technology.
          </p>
        </div>

        <div style={styles.footerLinks}>
          <button
            onClick={() => {
              setAccountOpen(true);
              setOrdersOpen(true);
            }}
            style={styles.footerButton}
          >
            My account
          </button>

          <button
            onClick={() => setCartOpen(true)}
            style={styles.footerButton}
          >
            My cart
          </button>
        </div>

        <div style={styles.footerBottom}>
          © 2026 Shindara Phoneflair
        </div>
      </footer>

      {/* NOTICE */}
      {notice && (
        <div style={styles.notice}>
          {notice}
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && user && (
        <div style={styles.overlay} onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            style={styles.drawer}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.drawerHeader}>
              <div>
                <span style={styles.kicker}>YOUR SHOPPING</span>
                <h2 style={styles.drawerTitle}>Cart</h2>
              </div>

              <button
                style={styles.close}
                onClick={() => setCartOpen(false)}
              >
                ×
              </button>
            </div>

            {cartLoading ? (
              <div style={styles.emptyCart}>Loading cart...</div>
            ) : cartProducts.length === 0 ? (
              <div style={styles.emptyCart}>
                <div style={styles.emptyCartIcon}>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add something beautiful to get started.</p>
              </div>
            ) : (
              <>
                <div style={styles.cartList}>
                  {cartProducts.map((item) => (
                    <div style={styles.cartItem} key={item.id}>
                      <div style={styles.cartImage}>
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            style={styles.cartImg}
                          />
                        ) : (
                          "S"
                        )}
                      </div>

                      <div style={styles.cartInfo}>
                        <strong>{item.product.name}</strong>
                        <span>{money(item.product.price)}</span>

                        <div style={styles.quantity}>
                          <button
                            onClick={() => updateQuantity(item, -1)}
                          >
                            −
                          </button>

                          <b>{item.quantity}</b>

                          <button
                            onClick={() => updateQuantity(item, 1)}
                          >
                            +
                          </button>

                          <button
                            style={styles.remove}
                            onClick={() => removeFromCart(item)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <strong>{money(item.subtotal)}</strong>
                    </div>
                  ))}
                </div>

                <div style={styles.cartSummary}>
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(cartTotal)}</strong>
                  </div>

                  <button
                    className="checkout-button"
                    style={styles.checkoutButton}
                    onClick={openCheckout}
                  >
                    Continue to checkout →
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
          style={styles.overlay}
          onClick={() => setAccountOpen(false)}
        >
          <div
            className="account-modal"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.modalClose}
              onClick={() => setAccountOpen(false)}
            >
              ×
            </button>

            {user ? (
              <>
                <span style={styles.kicker}>WELCOME BACK</span>
                <h2 style={styles.modalTitle}>
                  {profile?.full_name ||
                    user.user_metadata?.full_name ||
                    "Your account"}
                </h2>

                <p style={styles.modalText}>{user.email}</p>

                <div style={styles.accountCards}>
                  <button
                    style={styles.accountCard}
                    onClick={() => {
                      setAccountOpen(false);
                      setCartOpen(true);
                    }}
                  >
                    🛒
                    <span>My cart</span>
                    <small>{cartCount} items</small>
                  </button>

                  <button
                    style={styles.accountCard}
                    onClick={() => {
                      setAccountOpen(false);
                      setOrdersOpen(true);
                    }}
                  >
                    📦
                    <span>My orders</span>
                    <small>{orders.length} orders</small>
                  </button>
                </div>

                <button
                  style={styles.logout}
                  onClick={logout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <span style={styles.kicker}>
                  SHINDARA ACCOUNT
                </span>

                <h2 style={styles.modalTitle}>
                  {authMode === "login"
                    ? "Welcome back."
                    : "Create your account."}
                </h2>

                <p style={styles.modalText}>
                  Login to shop and keep your personal cart saved.
                </p>

                <form onSubmit={submitAuth}>
                  {authMode === "signup" && (
                    <>
                      <label style={styles.label}>Full name</label>
                      <input
                        value={fullName}
                        onChange={(e) =>
                          setFullName(e.target.value)
                        }
                        style={styles.input}
                        placeholder="Your full name"
                      />

                      <label style={styles.label}>Phone number</label>
                      <input
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        style={styles.input}
                        placeholder="080..."
                      />
                    </>
                  )}

                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    placeholder="you@example.com"
                  />

                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    style={styles.input}
                    placeholder="Your password"
                  />

                  {authMessage && (
                    <div style={styles.authMessage}>
                      {authMessage}
                    </div>
                  )}

                  <button
                    className="modal-action"
                    style={styles.authButton}
                    disabled={authLoading}
                  >
                    {authLoading
                      ? "Please wait..."
                      : authMode === "login"
                      ? "Login"
                      : "Create account"}
                  </button>
                </form>

                <button
                  style={styles.switchAuth}
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
                    ? "New to Shindara? Create an account"
                    : "Already have an account? Login"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {checkoutOpen && (
        <div style={styles.overlay}>
          <div style={styles.checkoutModal}>
            <button
              style={styles.modalClose}
              onClick={() => setCheckoutOpen(false)}
            >
              ×
            </button>

            <span style={styles.kicker}>SHINDARA CHECKOUT</span>
            <h2 style={styles.modalTitle}>Delivery details</h2>

            <p style={styles.modalText}>
              Total: <strong>{money(cartTotal)}</strong>
            </p>

            <form onSubmit={placeOrder}>
              <label style={styles.label}>Full name</label>
              <input
                value={checkout.customer_name}
                onChange={(e) =>
                  setCheckout({
                    ...checkout,
                    customer_name: e.target.value,
                  })
                }
                style={styles.input}
                placeholder="Full name"
              />

              <label style={styles.label}>Phone</label>
              <input
                value={checkout.customer_phone}
                onChange={(e) =>
                  setCheckout({
                    ...checkout,
                    customer_phone: e.target.value,
                  })
                }
                style={styles.input}
                placeholder="Phone number"
              />

              <label style={styles.label}>Email</label>
              <input
                value={checkout.customer_email}
                onChange={(e) =>
                  setCheckout({
                    ...checkout,
                    customer_email: e.target.value,
                  })
                }
                style={styles.input}
                placeholder="Email"
              />

              <label style={styles.label}>Delivery address</label>
              <textarea
                value={checkout.delivery_address}
                onChange={(e) =>
                  setCheckout({
                    ...checkout,
                    delivery_address: e.target.value,
                  })
                }
                style={styles.textarea}
                placeholder="House number, street..."
              />

              <div style={styles.twoInputs}>
                <div>
                  <label style={styles.label}>City</label>
                  <input
                    value={checkout.delivery_city}
                    onChange={(e) =>
                      setCheckout({
                        ...checkout,
                        delivery_city: e.target.value,
                      })
                    }
                    style={styles.input}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label style={styles.label}>State</label>
                  <input
                    value={checkout.delivery_state}
                    onChange={(e) =>
                      setCheckout({
                        ...checkout,
                        delivery_state: e.target.value,
                      })
                    }
                    style={styles.input}
                    placeholder="State"
                  />
                </div>
              </div>

              {checkoutMessage && (
                <div style={styles.authMessage}>
                  {checkoutMessage}
                </div>
              )}

              <button
                className="checkout-button"
                style={styles.checkoutButton}
                disabled={placingOrder}
              >
                {placingOrder
                  ? "Placing order..."
                  : `Place order • ${money(cartTotal)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {ordersOpen && (
        <div
          style={styles.overlay}
          onClick={() => setOrdersOpen(false)}
        >
          <div
            style={styles.ordersModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.modalClose}
              onClick={() => setOrdersOpen(false)}
            >
              ×
            </button>

            <span style={styles.kicker}>SHINDARA</span>
            <h2 style={styles.modalTitle}>Your orders</h2>

            {orders.length === 0 ? (
              <div style={styles.emptyCart}>
                <div style={styles.emptyCartIcon}>📦</div>
                <h3>No orders yet</h3>
                <p>Your completed orders will appear here.</p>
              </div>
            ) : (
              <div style={styles.ordersList}>
                {orders.map((order) => (
                  <div style={styles.orderCard} key={order.id}>
                    <div>
                      <strong>
                        Order #{String(order.id).slice(0, 8)}
                      </strong>

                      <span style={styles.orderDate}>
                        {new Date(
                          order.created_at
                        ).toLocaleDateString("en-NG")}
                      </span>
                    </div>

                    <div style={styles.orderRight}>
                      <strong>{money(order.total)}</strong>

                      <span style={styles.status}>
                        {order.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   HELPERS
========================= */

function categoryIcon(name) {
  const value = String(name).toLowerCase();

  if (value.includes("case")) return "◈";
  if (value.includes("charger")) return "⚡";
  if (value.includes("audio")) return "◉";
  if (value.includes("power")) return "◒";
  if (value.includes("watch")) return "⌚";
  if (value.includes("gadget")) return "✦";
  if (value.includes("cable")) return "⌁";
  if (value.includes("ear")) return "◉";

  return "✦";
}

/* =========================
   INLINE DESIGN
========================= */

const styles = {
  app: {
    minHeight: "100vh",
    overflowX: "hidden",
  },

  loading: {
    minHeight: "100vh",
    background: "#12091d",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontFamily: "system-ui, sans-serif",
  },

  loadingLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    background: "linear-gradient(135deg,#7c3aed,#4c1d95)",
    display: "grid",
    placeItems: "center",
    fontSize: 30,
    fontWeight: 900,
    marginBottom: 10,
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

  marquee: {
    width: "100%",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "14px 6%",
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
    color: "#625a6d",
    fontWeight: 650,
    fontSize: 12,
    cursor: "pointer",
  },

  headerActions: {
    display: "flex",
    gap: 8,
  },

  accountButton: {
    border: "1px solid rgba(54,29,78,.12)",
    background: "#fff",
    color: "#211b29",
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
    minHeight: "650px",
    padding: "90px 7%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    pointerEvents: "none",
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
    fontSize: "clamp(50px,8vw,94px)",
    lineHeight: 0.94,
    letterSpacing: -5,
    fontWeight: 900,
    color: "#17131d",
  },

  heroText: {
    maxWidth: 590,
    color: "#777080",
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
      "linear-gradient(145deg,#7c3aed 0%,#4c1d95 55%,#24123e 100%)",
    boxShadow: "0 35px 70px rgba(76,29,149,.25)",
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
    padding: "85px 7%",
  },

  shopSection: {
    paddingTop: 40,
    paddingBottom: 90,
  },

  sectionHeader: {
    marginBottom: 35,
  },

  shopTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: 25,
    marginBottom: 25,
  },

  kicker: {
    color: "#6d28d9",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 2.5,
  },

  sectionTitle: {
    margin: "8px 0 0",
    fontSize: "clamp(31px,5vw,50px)",
    lineHeight: 1,
    letterSpacing: -2,
    fontWeight: 900,
    color: "#17131d",
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
    border: "1px solid rgba(54,29,78,.1)",
    background: "#fff",
    borderRadius: 20,
    cursor: "pointer",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
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

  searchWrap: {
    minWidth: 260,
    height: 46,
    border: "1px solid rgba(54,29,78,.1)",
    background: "#fff",
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
    color: "#211b29",
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
    border: "1px solid rgba(54,29,78,.1)",
    background: "#fff",
    color: "#716978",
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
    padding: 17,
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
    color: "#817887",
    fontSize: 11,
    lineHeight: 1.5,
    minHeight: 34,
  },

  productBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 15,
  },

  price: {
    color: "#4c1d95",
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
    padding: "80px 20px",
    textAlign: "center",
    borderRadius: 25,
    background: "#fff",
  },

  emptyIcon: {
    fontSize: 35,
    color: "#6d28d9",
  },

  trust: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 15,
    padding: "65px 7%",
  },

  trustItem: {
    padding: 28,
    borderRadius: 22,
    background:
      "rgba(255,255,255,.07)",
    border:
      "1px solid rgba(255,255,255,.1)",
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
    letterSpacing: -0.5,
  },

  footerText: {
    color: "rgba(255,255,255,.55)",
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
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.05)",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 13px",
    cursor: "pointer",
  },

  footerBottom: {
    borderTop: "1px solid rgba(255,255,255,.08)",
    paddingTop: 20,
    color: "rgba(255,255,255,.4)",
    fontSize: 10,
  },

  notice: {
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
    boxShadow: "0 15px 40px rgba(0,0,0,.2)",
    maxWidth: "90%",
    textAlign: "center",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 500,
    background: "rgba(18,8,28,.68)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "flex-end",
  },

  drawer: {
    width: "min(520px,100%)",
    height: "100%",
    background: "#fff",
    padding: 25,
    overflowY: "auto",
  },

  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: 25,
  },

  drawerTitle: {
    margin: "7px 0 0",
    fontSize: 35,
    letterSpacing: -1.5,
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
    padding: "80px 20px",
    textAlign: "center",
    color: "#777080",
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
    gridTemplateColumns: "65px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(54,29,78,.08)",
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

  quantityButton: {},

  remove: {
    border: 0,
    background: "transparent",
    color: "#9b2c70",
    fontSize: 9,
    cursor: "pointer",
    marginLeft: 5,
  },

  cartSummary: {
    marginTop: 25,
    paddingTop: 20,
    borderTop: "1px solid rgba(54,29,78,.1)",
  },

  checkoutButton: {
    width: "100%",
    border: 0,
    background: "#6d28d9",
    color: "#fff",
    padding: "15px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    marginTop: 18,
  },

  modal: {
    width: "min(460px,calc(100% - 30px))",
    maxHeight: "90vh",
    overflowY: "auto",
    margin: "auto",
    background: "#fff",
    borderRadius: 25,
    padding: 28,
    position: "relative",
  },

  checkoutModal: {
    width: "min(560px,calc(100% - 25px))",
    maxHeight: "92vh",
    overflowY: "auto",
    margin: "auto",
    background: "#fff",
    borderRadius: 25,
    padding: 28,
    position: "relative",
  },

  ordersModal: {
    width: "min(650px,calc(100% - 25px))",
    maxHeight: "85vh",
    overflowY: "auto",
    margin: "auto",
    background: "#fff",
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
    letterSpacing: -1.5,
  },

  modalText: {
    color: "#777080",
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 22,
  },

  label: {
    display: "block",
    color: "#4b4252",
    fontSize: 10,
    fontWeight: 800,
    margin: "13px 0 6px",
  },

  input: {
    width: "100%",
    height: 45,
    padding: "0 13px",
    border: "1px solid rgba(54,29,78,.12)",
    borderRadius: 11,
    outline: 0,
    background: "#faf9fd",
    color: "#211b29",
  },

  textarea: {
    width: "100%",
    minHeight: 85,
    padding: 13,
    border: "1px solid rgba(54,29,78,.12)",
    borderRadius: 11,
    outline: 0,
    resize: "vertical",
    background: "#faf9fd",
    color: "#211b29",
  },

  twoInputs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  authButton: {
    width: "100%",
    marginTop: 18,
    border: 0,
    borderRadius: 12,
    padding: "14px",
    background: "#6d28d9",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
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
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    margin: "25px 0",
  },

  accountCard: {
    textAlign: "left",
    border: "1px solid rgba(54,29,78,.1)",
    background: "#faf9fd",
    borderRadius: 15,
    padding: 15,
    display: "flex",
    flexDirection: "column",
    gap: 7,
    cursor: "pointer",
  },

  logout: {
    width: "100%",
    border: "1px solid rgba(155,44,112,.2)",
    background: "#fff",
    color: "#9b2c70",
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
    justifyContent: "space-between",
    gap: 15,
    padding: 15,
    borderRadius: 15,
    background: "#faf9fd",
    border: "1px solid rgba(54,29,78,.08)",
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
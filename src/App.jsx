import { useState } from "react";

const WHATSAPP = "2348118294548";
const TIKTOK = "https://www.tiktok.com/@shindara.communication";

const products = [
  { id: 1, name: "20W Fast Charger", price: 15000, icon: "⚡" },
  { id: 2, name: "Premium USB-C Cable", price: 8000, icon: "🔌" },
  { id: 3, name: "Wireless Earbuds", price: 35000, icon: "🎧" },
  { id: 4, name: "Power Bank", price: 28000, icon: "🔋" },
  { id: 5, name: "Premium Phone Case", price: 12000, icon: "📱" },
  { id: 6, name: "Bluetooth Speaker", price: 45000, icon: "🔊" }
];

function money(value) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function App() {
    const supabaseConfigured =
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
  const [cart, setCart] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);

  function addToCart(product) {
    setCart((items) => [...items, product]);
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

  function openCart() {
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price,
      0
    );

    alert(
      `Cart: ${cart.length} item(s) — ${money(total)}`
    );
  }

  return (
    <div className="app">
            {!supabaseConfigured && (
        <div
          style={{
            padding: "15px",
            background: "#ffe5e5",
            color: "#990000",
            textAlign: "center",
            fontWeight: "bold"
          }}
        >
          Supabase environment variables are NOT reaching this Vercel build.
        </div>
      )}

      <header className="header">

        <a href="#home" className="logo">
          Shindara<span>Phoneflair</span>
        </a>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">

          <button
            className="account-button"
            onClick={() => setAccountOpen(true)}
          >
            👤 Sign in
          </button>

          <button
            className="cart-button"
            onClick={openCart}
          >
            🛒 Cart ({cart.length})
          </button>

        </div>

      </header>

      <main>

        <section className="hero" id="home">

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
              Phones, accessories, chargers, audio products,
              power banks and everyday gadgets.
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
            FEATURED PRODUCTS
          </p>

          <h2>
            Popular picks
          </h2>

          <div className="product-grid">

            {products.map((product) => (

              <article
                className="product-card"
                key={product.id}
              >

                <div className="product-image">
                  <span>
                    {product.icon}
                  </span>
                </div>

                <div className="product-info">

                  <p className="product-category">
                    Accessories
                  </p>

                  <h3>
                    {product.name}
                  </h3>

                  <p className="price">
                    {money(product.price)}
                  </p>

                  <button
                    className="add-button"
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    Add to cart
                  </button>

                </div>

              </article>

            ))}

          </div>

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
            Phones • Accessories • Gadgets • Electronics
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

      {accountOpen && (

        <div
          className="modal-backdrop"
          onClick={() => setAccountOpen(false)}
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

            <p className="eyebrow">
              SHINDARA ACCOUNT
            </p>

            <h2>
              Customer account
            </h2>

            <p className="account-email">
              Sign up and login will be connected
              to your Shindara Phoneflair account.
            </p>

            <button
              className="modal-action"
              onClick={() =>
                setAccountOpen(false)
              }
            >
              Continue
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;

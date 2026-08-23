import { useState } from "react";

const products = [
  {
    id: 1,
    name: "20W Fast Charger",
    price: 15000,
    category: "Chargers",
    emoji: "⚡",
  },
  {
    id: 2,
    name: "Premium USB-C Cable",
    price: 8000,
    category: "Cables",
    emoji: "🔌",
  },
  {
    id: 3,
    name: "Wireless Earbuds",
    price: 35000,
    category: "Audio",
    emoji: "🎧",
  },
  {
    id: 4,
    name: "Power Bank",
    price: 28000,
    category: "Power Banks",
    emoji: "🔋",
  },
  {
    id: 5,
    name: "Premium Phone Case",
    price: 12000,
    category: "Phone Cases",
    emoji: "📱",
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    price: 45000,
    category: "Gadgets",
    emoji: "🔊",
  },
];

function formatPrice(price) {
  return `₦${price.toLocaleString("en-NG")}`;
}

function App() {
  const [cart, setCart] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  function addToCart(product) {
    setCart((current) => [...current, product]);
  }

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  return (
    <div className="app">
      <header className="header">
        <a href="#home" className="logo">
          Shindara<span>Phoneflair</span>
        </a>

        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            Home
          </a>

          <a href="#shop" onClick={() => setMenuOpen(false)}>
            Shop
          </a>

          <a href="#categories" onClick={() => setMenuOpen(false)}>
            Categories
          </a>

          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </nav>

        <button
          className="cart-button"
          onClick={() =>
            alert(
              cart.length
                ? `You have ${cart.length} item(s) in your cart. Total: ${formatPrice(
                    cartTotal
                  )}`
                : "Your cart is empty."
            )
          }
        >
          🛒 Cart ({cart.length})
        </button>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          ☰
        </button>
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

            <p className="hero-text">
              Discover smartphones, accessories, chargers, audio
              products, power banks and everyday gadgets.
            </p>

            <a href="#shop" className="shop-button">
              Shop now →
            </a>
          </div>
        </section>

        <section className="section" id="categories">
          <p className="eyebrow">EXPLORE</p>

          <h2>Shop by category</h2>

          <div className="category-grid">
            {[
              ["📱", "Smartphones"],
              ["🛡️", "Phone Cases"],
              ["⚡", "Chargers"],
              ["🎧", "Audio"],
              ["🔋", "Power Banks"],
              ["✨", "Gadgets"],
            ].map(([icon, name]) => (
              <a
                href="#shop"
                className="category-card"
                key={name}
              >
                <span>{icon}</span>
                <strong>{name}</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="section" id="shop">
          <p className="eyebrow">FEATURED PRODUCTS</p>

          <h2>Popular picks</h2>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <span>{product.emoji}</span>
                </div>

                <div className="product-info">
                  <p className="product-category">
                    {product.category}
                  </p>

                  <h3>{product.name}</h3>

                  <p className="price">
                    {formatPrice(product.price)}
                  </p>

                  <button
                    className="add-button"
                    onClick={() => addToCart(product)}
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
            <h3>Reliable delivery</h3>
            <p>Get your order delivered safely.</p>
          </div>

          <div>
            <span>🔒</span>
            <h3>Secure shopping</h3>
            <p>Your information stays protected.</p>
          </div>

          <div>
            <span>💬</span>
            <h3>Customer support</h3>
            <p>We're here whenever you need us.</p>
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
        </div>

        <p>© 2026 Shindara Phoneflair. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

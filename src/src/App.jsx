import React from "react";

function App() {
  return (
    <div>
      <header className="header">
        <div className="logo">
          Shindara<span>Phoneflair</span>
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#contact">Contact</a>
        </nav>

        <button className="cart-button">
          🛒 Cart
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
              Discover smartphones, accessories, chargers,
              audio products, power banks and everyday gadgets.
            </p>

            <a href="#shop" className="shop-button">
              Shop now
            </a>
          </div>
        </section>

        <section className="section" id="categories">
          <p className="eyebrow">EXPLORE</p>

          <h2>Shop by category</h2>

          <div className="category-grid">
            <div className="category-card">📱 Smartphones</div>
            <div className="category-card">🛡️ Phone Cases</div>
            <div className="category-card">⚡ Chargers</div>
            <div className="category-card">🎧 Audio</div>
            <div className="category-card">🔋 Power Banks</div>
            <div className="category-card">✨ Gadgets</div>
          </div>
        </section>

        <section className="section" id="shop">
          <p className="eyebrow">FEATURED</p>

          <h2>Popular picks</h2>

          <div className="product-grid">
            <Product
              emoji="⚡"
              name="20W Fast Charger"
              price="₦15,000"
            />

            <Product
              emoji="🔌"
              name="Premium USB-C Cable"
              price="₦8,000"
            />

            <Product
              emoji="🎧"
              name="Wireless Earbuds"
              price="₦35,000"
            />
          </div>
        </section>
      </main>

      <footer id="contact">
        <strong>Shindara Phoneflair</strong>

        <p>
          Phones • Accessories • Gadgets • Electronics
        </p>

        <p>
          © 2026 Shindara Phoneflair. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function Product({ emoji, name, price }) {
  return (
    <article className="product-card">
      <div className="product-image">
        {emoji}
      </div>

      <div className="product-info">
        <h3>{name}</h3>

        <p>{price}</p>

        <button>Add to cart</button>
      </div>
    </article>
  );
}

export default App;

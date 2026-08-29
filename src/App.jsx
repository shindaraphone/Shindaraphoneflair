<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
  <title>Shindara PhoneFlair | Quality Phone Accessories & Gadgets</title>
  <!-- Font & Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz@14..32&display=swap" rel="stylesheet">
  <style>
    /* RESET & VARIABLES */
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter', sans-serif; }
    :root { --purple:#7c3aed; --purple-dark:#5b21b6; --black:#0b0b0b; --white:#ffffff; --gray:#f8f8fa; --gray-border:#e5e7eb; --text:#1e1e2a; --shadow:0 8px 24px rgba(0,0,0,0.05); --radius:16px; --transition:0.2s ease; }
    body { background:var(--gray); color:var(--text); line-height:1.5; padding-bottom:2rem; }
    a { text-decoration:none; color:inherit; }
    .container { max-width:1280px; margin:0 auto; padding:0 1.2rem; }

    /* HEADER */
    header { background:var(--white); box-shadow:0 2px 12px rgba(0,0,0,0.04); position:sticky; top:0; z-index:100; padding:0.7rem 0; }
    .header-flex { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; }
    .logo { font-weight:700; font-size:1.3rem; letter-spacing:-0.3px; color:var(--black); }
    .logo span { color:var(--purple); }
    .nav-links { display:none; gap:1.8rem; font-weight:500; font-size:0.95rem; }
    .nav-links a:hover { color:var(--purple); }
    .header-icons { display:flex; align-items:center; gap:1rem; font-size:1.2rem; }
    .header-icons .cart-badge { position:relative; }
    .header-icons .badge { position:absolute; top:-8px; right:-10px; background:var(--purple); color:white; font-size:0.6rem; border-radius:50%; padding:0.15rem 0.45rem; font-weight:600; }
    .hamburger { display:block; font-size:1.6rem; cursor:pointer; background:none; border:none; }

    /* MOBILE NAV */
    .mobile-nav { display:none; background:var(--white); padding:1.2rem; border-top:1px solid var(--gray-border); flex-direction:column; gap:1rem; }
    .mobile-nav a { font-weight:500; }
    .mobile-nav.open { display:flex; }

    /* HERO */
    .hero { background:linear-gradient(145deg, #f5f0ff, #ede6ff); border-radius:var(--radius); padding:2.5rem 1.8rem; margin:1.5rem 0; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; }
    .hero-text { max-width:600px; }
    .hero h1 { font-size:2.1rem; font-weight:700; line-height:1.2; margin-bottom:0.5rem; }
    .hero p { font-size:1.1rem; color:#3b3b4a; margin-bottom:1.5rem; }
    .btn { background:var(--purple); color:white; border:none; padding:0.7rem 1.8rem; border-radius:60px; font-weight:600; font-size:0.95rem; cursor:pointer; transition:var(--transition); display:inline-block; }
    .btn-outline { background:transparent; border:1.5px solid var(--purple); color:var(--purple); }
    .btn-outline:hover { background:var(--purple); color:white; }
    .btn:hover { background:var(--purple-dark); transform:scale(0.98); }
    .hero-image { width:100%; max-width:180px; margin:1rem auto; }

    /* CATEGORIES */
    .section-title { font-size:1.6rem; font-weight:600; margin:2rem 0 1rem; }
    .category-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(100px,1fr)); gap:1rem; margin-bottom:2rem; }
    .category-card { background:white; border-radius:var(--radius); padding:0.8rem 0.4rem; text-align:center; box-shadow:var(--shadow); cursor:pointer; transition:var(--transition); font-weight:500; font-size:0.85rem; border:1px solid transparent; }
    .category-card:hover { border-color:var(--purple); transform:translateY(-3px); }
    .category-card i { font-size:1.8rem; color:var(--purple); margin-bottom:0.2rem; display:block; }

    /* PRODUCT GRID */
    .product-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(150px,1fr)); gap:1.2rem; margin:1.5rem 0; }
    .product-card { background:white; border-radius:var(--radius); padding:0.8rem; box-shadow:var(--shadow); transition:var(--transition); border:1px solid transparent; position:relative; }
    .product-card:hover { border-color:var(--purple); transform:translateY(-4px); }
    .product-card img { width:100%; height:140px; object-fit:contain; background:#fafafa; border-radius:10px; }
    .product-name { font-weight:600; font-size:0.95rem; margin:0.4rem 0 0.1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .product-brand { font-size:0.75rem; color:#6b6b7a; }
    .product-price { font-weight:700; color:var(--black); margin:0.3rem 0; }
    .old-price { text-decoration:line-through; color:#9ca3af; font-weight:400; font-size:0.8rem; margin-left:0.4rem; }
    .stock { font-size:0.7rem; color:#22c55e; font-weight:500; }
    .outofstock { color:#ef4444; }
    .product-actions { display:flex; gap:0.4rem; margin-top:0.6rem; flex-wrap:wrap; }
    .product-actions button { background:var(--purple); color:white; border:none; padding:0.3rem 0.6rem; border-radius:40px; font-size:0.75rem; font-weight:500; cursor:pointer; flex:1; }
    .product-actions .wishlist { background:transparent; color:#9ca3af; padding:0.2rem 0.5rem; flex:0; }

    /* SHOP FILTERS */
    .filter-sort-bar { display:flex; flex-wrap:wrap; gap:0.8rem; align-items:center; margin:1rem 0; background:white; padding:0.8rem 1rem; border-radius:var(--radius); }
    .filter-sort-bar select, .filter-sort-bar input { padding:0.4rem 0.8rem; border:1px solid var(--gray-border); border-radius:40px; background:white; font-size:0.85rem; }

    /* CART PAGE */
    .cart-item { display:flex; align-items:center; gap:1rem; background:white; padding:0.8rem; border-radius:var(--radius); margin-bottom:0.6rem; flex-wrap:wrap; }
    .cart-item img { width:60px; height:60px; object-fit:contain; }
    .cart-item .details { flex:2; min-width:120px; }
    .cart-item .qty-control { display:flex; align-items:center; gap:0.3rem; }
    .cart-item .qty-control button { background:var(--gray-border); border:none; width:26px; height:26px; border-radius:30px; font-weight:bold; cursor:pointer; }

    /* CHECKOUT */
    .checkout-grid { display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin:2rem 0; }
    .checkout-grid .form-group { margin-bottom:1rem; }
    .checkout-grid input, .checkout-grid select { width:100%; padding:0.7rem; border:1px solid var(--gray-border); border-radius:10px; }
    .order-summary { background:white; padding:1.5rem; border-radius:var(--radius); }

    /* ADMIN DASHBOARD (simplified) */
    .admin-panel { background:white; border-radius:var(--radius); padding:1.5rem; margin:2rem 0; }
    .admin-tabs { display:flex; gap:1rem; border-bottom:1px solid var(--gray-border); padding-bottom:0.5rem; flex-wrap:wrap; }
    .admin-tabs button { background:none; border:none; padding:0.3rem 1rem; font-weight:600; cursor:pointer; }
    .admin-tabs .active { color:var(--purple); border-bottom:3px solid var(--purple); }
    .admin-form input, .admin-form textarea { width:100%; padding:0.6rem; margin:0.3rem 0; border:1px solid var(--gray-border); border-radius:8px; }
    .admin-form .image-upload { display:flex; gap:0.5rem; flex-wrap:wrap; }

    /* FOOTER */
    footer { background:var(--black); color:white; padding:2rem 1rem; margin-top:3rem; border-radius:var(--radius) var(--radius) 0 0; }
    footer a { color:#d1d5db; }
    .footer-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:1.5rem; }

    /* THEME TOGGLE */
    .theme-toggle { background:var(--gray-border); border:none; border-radius:30px; padding:0.2rem 0.8rem; font-size:0.8rem; cursor:pointer; }

    /* DARK MODE */
    .dark { --gray:#121212; --white:#1e1e2a; --text:#f0f0f0; --gray-border:#2d2d3a; --black:#0b0b0b; background:#121212; }
    .dark .product-card, .dark .category-card, .dark .filter-sort-bar, .dark .cart-item, .dark .order-summary, .dark .admin-panel { background:#1e1e2a; border-color:#2d2d3a; }
    .dark header { background:#1a1a28; }

    /* RESPONSIVE */
    @media (min-width:768px) {
      .nav-links { display:flex; }
      .hamburger { display:none; }
      .mobile-nav { display:none !important; }
      .product-grid { grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); }
      .hero h1 { font-size:2.8rem; }
    }
    @media (max-width:600px) {
      .checkout-grid { grid-template-columns:1fr; }
      .hero { flex-direction:column; text-align:center; }
    }
    /* utility */
    .hidden { display:none; }
    .mt-2 { margin-top:1.5rem; }
    .flex { display:flex; gap:0.5rem; flex-wrap:wrap; }
    .w-full { width:100%; }
  </style>
</head>
<body>
<header>
  <div class="container header-flex">
    <div class="logo">Shindara<span>PhoneFlair</span></div>
    <div class="nav-links">
      <a href="#" data-page="home">Home</a>
      <a href="#" data-page="shop">Shop</a>
      <a href="#" data-page="categories">Categories</a>
      <a href="#" data-page="about">About</a>
      <a href="#" data-page="contact">Contact</a>
    </div>
    <div class="header-icons">
      <i class="fas fa-search" id="searchIcon"></i>
      <i class="far fa-heart" id="wishlistIcon"></i>
      <span class="cart-badge">
        <i class="fas fa-shopping-cart" id="cartIcon"></i>
        <span class="badge" id="cartCount">0</span>
      </span>
      <i class="fas fa-user-cog" id="adminIcon"></i>
      <button class="theme-toggle" id="themeToggle"><i class="fas fa-moon"></i></button>
      <button class="hamburger" id="hamburgerBtn"><i class="fas fa-bars"></i></button>
    </div>
  </div>
  <div class="mobile-nav" id="mobileNav">
    <a href="#" data-page="home">Home</a>
    <a href="#" data-page="shop">Shop</a>
    <a href="#" data-page="categories">Categories</a>
    <a href="#" data-page="about">About</a>
    <a href="#" data-page="contact">Contact</a>
    <a href="#" data-page="wishlist">Wishlist</a>
    <a href="#" data-page="admin">Admin</a>
  </div>
</header>

<main class="container" id="app">
  <!-- DYNAMIC CONTENT RENDERED HERE -->
  <div id="pageContent"></div>
</main>

<footer>
  <div class="container footer-grid">
    <div><h4>Shindara PhoneFlair</h4><p style="color:#9ca3af;">All Phone Accessories</p></div>
    <div><h5>Quick Links</h5><a href="#" data-page="home">Home</a><br><a href="#" data-page="shop">Shop</a><br><a href="#" data-page="about">About</a></div>
    <div><h5>Customer</h5><a href="#" data-page="cart">Cart</a><br><a href="#" data-page="wishlist">Wishlist</a></div>
    <div><h5>Social</h5><a href="#" id="whatsappLink"><i class="fab fa-whatsapp"></i> WhatsApp</a><br><a href="#" id="tiktokLink"><i class="fab fa-tiktok"></i> TikTok</a></div>
  </div>
  <div class="container" style="text-align:center;border-top:1px solid #2d2d3a;padding-top:1.5rem;margin-top:1.5rem;color:#9ca3af;">© 2026 Shindara PhoneFlair. All rights reserved.</div>
</footer>

<script>
  (function(){
    // ---------- DATA STORE ----------
    let products = [
      { id:1, name:'Anker Power Bank 10000mAh', category:'Power Banks', brand:'Anker', price:25000, oldPrice:30000, desc:'Fast charging power bank', stock:12, featured:true, bestseller:true, image:'https://placehold.co/200x200/7c3aed/white?text=Anker' },
      { id:2, name:'Oraimo Power Bank 20000mAh', category:'Power Banks', brand:'Oraimo', price:18000, oldPrice:22000, desc:'Dual USB output', stock:8, featured:false, image:'https://placehold.co/200x200/7c3aed/white?text=Oraimo' },
      { id:3, name:'Fast Charger 30W Type-C', category:'Chargers', brand:'Baseus', price:9500, oldPrice:12000, desc:'USB-C fast charging', stock:20, featured:true, image:'https://placehold.co/200x200/7c3aed/white?text=Charger' },
      { id:4, name:'iPhone 15 Clear Case', category:'Phone Cases', brand:'Spigen', price:6500, oldPrice:null, desc:'Shockproof clear case', stock:30, featured:false, image:'https://placehold.co/200x200/7c3aed/white?text=Case' },
      { id:5, name:'AirPods Pro Clone', category:'AirPods', brand:'SoundPEATS', price:22000, oldPrice:28000, desc:'Wireless earbuds', stock:6, featured:true, image:'https://placehold.co/200x200/7c3aed/white?text=AirPods' },
      { id:6, name:'Bluetooth Headset', category:'Headsets', brand:'JBL', price:15000, oldPrice:18000, desc:'Over-ear headset', stock:10, image:'https://placehold.co/200x200/7c3aed/white?text=Headset' },
      { id:7, name:'Smartwatch Series 8', category:'Smartwatches', brand:'Xiaomi', price:45000, oldPrice:55000, desc:'Health tracker', stock:5, image:'https://placehold.co/200x200/7c3aed/white?text=Watch' },
      { id:8, name:'Samsung Galaxy Tab A', category:'Tablets', brand:'Samsung', price:120000, oldPrice:140000, desc:'10.5 inch tablet', stock:3, image:'https://placehold.co/200x200/7c3aed/white?text=Tablet' },
      { id:9, name:'USB-C to Lightning Cable', category:'Cables', brand:'Anker', price:4500, oldPrice:6000, desc:'1.2m braided cable', stock:40, image:'https://placehold.co/200x200/7c3aed/white?text=Cable' },
      { id:10, name:'Phone Stand Holder', category:'Other Gadgets', brand:'UGREEN', price:3200, oldPrice:null, desc:'Adjustable phone stand', stock:25, image:'https://placehold.co/200x200/7c3aed/white?text=Stand' },
    ];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    let settings = JSON.parse(localStorage.getItem('settings')) || { 
      whatsapp:'2348000000000', tiktok:'https://tiktok.com/shindara', bankName:'GTBank', accountName:'Shindara PhoneFlair', accountNumber:'0123456789'
    };
    let currentPage = 'home';

    // DOM refs
    const page = document.getElementById('pageContent');
    const cartCount = document.getElementById('cartCount');

    // Helpers
    function saveCart(){ localStorage.setItem('cart',JSON.stringify(cart)); updateCartBadge(); }
    function updateCartBadge(){ cartCount.textContent = cart.reduce((a,i)=>a+i.qty,0); }
    function saveWishlist(){ localStorage.setItem('wishlist',JSON.stringify(wishlist)); }

    // Render functions
    function renderHome(){
      let featured = products.filter(p=>p.featured);
      let html = `
        <div class="hero">
          <div class="hero-text">
            <h1>Your Phone. Your Style. Your Accessories.</h1>
            <p>Quality phone accessories, smart gadgets and everyday tech essentials at great prices.</p>
            <a href="#" class="btn" data-page="shop">Shop Now</a>
            <a href="#" class="btn btn-outline" style="margin-left:0.5rem;" data-page="categories">Explore Categories</a>
          </div>
          <div class="hero-image"><i class="fas fa-mobile-alt" style="font-size:6rem;color:var(--purple);"></i></div>
        </div>
        <h2 class="section-title">Featured Products</h2>
        <div class="product-grid">${featured.map(p=>productCard(p)).join('')}</div>
        <h2 class="section-title">Why Shop With Us</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1.5rem;margin:1.5rem 0;">
          <div style="background:white;padding:1rem;border-radius:var(--radius);text-align:center;"><i class="fas fa-check-circle" style="color:var(--purple);font-size:2rem;"></i><h4>Quality Products</h4><p style="font-size:0.9rem;">Selected accessories</p></div>
          <div style="background:white;padding:1rem;border-radius:var(--radius);text-align:center;"><i class="fas fa-naira-sign" style="color:var(--purple);font-size:2rem;"></i><h4>Great Prices</h4><p style="font-size:0.9rem;">Competitive ₦ prices</p></div>
          <div style="background:white;padding:1rem;border-radius:var(--radius);text-align:center;"><i class="fas fa-shopping-bag" style="color:var(--purple);font-size:2rem;"></i><h4>Easy Ordering</h4><p style="font-size:0.9rem;">Order via WhatsApp</p></div>
          <div style="background:white;padding:1rem;border-radius:var(--radius);text-align:center;"><i class="fas fa-headset" style="color:var(--purple);font-size:2rem;"></i><h4>Customer Support</h4><p style="font-size:0.9rem;">We're here to help</p></div>
        </div>
      `;
      page.innerHTML = html;
    }

    function productCard(p){
      let stockText = p.stock>0 ? `<span class="stock">In Stock</span>` : `<span class="stock outofstock">Out of Stock</span>`;
      let old = p.oldPrice ? `<span class="old-price">₦${p.oldPrice.toLocaleString()}</span>` : '';
      return `
        <div class="product-card" data-id="${p.id}">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="product-name">${p.name}</div>
          <div class="product-brand">${p.brand}</div>
          <div class="product-price">₦${p.price.toLocaleString()} ${old}</div>
          ${stockText}
          <div class="product-actions">
            <button class="addToCart" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add</button>
            <button class="buyNow" data-id="${p.id}"><i class="fas fa-bolt"></i> Buy</button>
            <button class="wishlist" data-id="${p.id}"><i class="far fa-heart"></i></button>
          </div>
        </div>
      `;
    }

    function renderShop(filter='', category=''){
      let list = products;
      if(category) list = list.filter(p=>p.category===category);
      if(filter) list = list.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase()) || p.brand.toLowerCase().includes(filter.toLowerCase()));
      let html = `
        <div class="filter-sort-bar">
          <input type="text" id="searchInput" placeholder="Search products..." style="flex:1;min-width:120px;">
          <select id="categoryFilter"><option value="">All Categories</option>${[...new Set(products.map(p=>p.category))].map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
          <select id="sortSelect"><option value="featured">Featured</option><option value="priceLow">Price: Low to High</option><option value="priceHigh">Price: High to Low</option></select>
          <button class="btn" id="applyFilterBtn">Apply</button>
        </div>
        <div class="product-grid">${list.length?list.map(p=>productCard(p)).join(''):'<p>No products found. Try another search.</p>'}</div>
      `;
      page.innerHTML = html;
      document.getElementById('applyFilterBtn')?.addEventListener('click',()=>{
        let cat = document.getElementById('categoryFilter').value;
        let search = document.getElementById('searchInput').value;
        renderShop(search, cat);
      });
      document.getElementById('searchInput')?.addEventListener('keyup',(e)=>{ if(e.key==='Enter') document.getElementById('applyFilterBtn').click(); });
    }

    function renderProductDetail(id){
      let p = products.find(x=>x.id==id);
      if(!p){ page.innerHTML='<p>Product not found</p>'; return; }
      let old = p.oldPrice ? `<span class="old-price">₦${p.oldPrice.toLocaleString()}</span>` : '';
      let html = `
        <div style="background:white;padding:1.5rem;border-radius:var(--radius);">
          <div style="display:flex;flex-wrap:wrap;gap:2rem;">
            <div style="flex:1;min-width:200px;"><img src="${p.image}" style="width:100%;max-width:300px;border-radius:12px;"></div>
            <div style="flex:2;">
              <h2>${p.name}</h2>
              <div class="product-brand">${p.brand}</div>
              <div class="product-price" style="font-size:1.8rem;">₦${p.price.toLocaleString()} ${old}</div>
              <p>${p.desc||'Premium quality accessory'}</p>
              <p>Stock: ${p.stock>0?'In Stock':'Out of Stock'}</p>
              <div style="display:flex;gap:1rem;margin:1rem 0;">
                <button class="addToCart" data-id="${p.id}" style="background:var(--purple);color:white;padding:0.7rem 2rem;border:none;border-radius:40px;font-weight:600;">Add to Cart</button>
                <button class="buyNow" data-id="${p.id}" style="background:var(--black);color:white;padding:0.7rem 2rem;border:none;border-radius:40px;font-weight:600;">Buy Now</button>
              </div>
              <button class="wishlist" data-id="${p.id}" style="background:transparent;border:1px solid #ccc;padding:0.5rem 1.5rem;border-radius:40px;"><i class="far fa-heart"></i> Wishlist</button>
            </div>
          </div>
          <h3 style="margin-top:2rem;">You may also like</h3>
          <div class="product-grid">${products.filter(x=>x.id!==p.id).slice(0,4).map(p=>productCard(p)).join('')}</div>
        </div>
      `;
      page.innerHTML = html;
    }

    function renderCart(){
      if(!cart.length){ page.innerHTML=`<div style="text-align:center;padding:3rem;"><i class="fas fa-shopping-cart" style="font-size:3rem;"></i><h3>Your cart is empty</h3><a href="#" class="btn" data-page="shop">Start Shopping</a></div>`; return; }
      let html = `<h2>Shopping Cart</h2>`;
      let total=0;
      cart.forEach(item=>{
        let p = products.find(x=>x.id==item.id);
        if(!p) return;
        total += p.price*item.qty;
        html += `
          <div class="cart-item">
            <img src="${p.image}" alt="${p.name}">
            <div class="details"><strong>${p.name}</strong><br>₦${p.price.toLocaleString()}</div>
            <div class="qty-control">
              <button class="qtyDec" data-id="${p.id}">-</button>
              <span>${item.qty}</span>
              <button class="qtyInc" data-id="${p.id}">+</button>
            </div>
            <button class="removeItem" data-id="${p.id}" style="background:#ef4444;color:white;border:none;padding:0.2rem 0.8rem;border-radius:30px;">Remove</button>
          </div>
        `;
      });
      html += `<div style="background:white;padding:1rem;border-radius:var(--radius);margin-top:1rem;"><h3>Total: ₦${total.toLocaleString()}</h3><a href="#" class="btn" data-page="checkout">Proceed to Checkout</a></div>`;
      page.innerHTML = html;
    }

    function renderCheckout(){
      if(!cart.length){ page.innerHTML='<p>Cart is empty</p>'; return; }
      let total = cart.reduce((acc,item)=>acc+ (products.find(p=>p.id==item.id)?.price||0)*item.qty,0);
      let html = `
        <h2>Checkout</h2>
        <div class="checkout-grid">
          <div>
            <div class="form-group"><label>Full name</label><input type="text" id="fullName" placeholder="Oluwaseun Adebayo"></div>
            <div class="form-group"><label>Phone</label><input type="tel" id="phone" placeholder="08012345678"></div>
            <div class="form-group"><label>Email</label><input type="email" id="email" placeholder="you@example.com"></div>
            <div class="form-group"><label>Delivery Address</label><input type="text" id="address" placeholder="23, Allen Avenue"></div>
            <div class="form-group"><label>City</label><input type="text" id="city" placeholder="Lagos"></div>
            <div class="form-group"><label>State</label><input type="text" id="state" placeholder="Lagos"></div>
            <div class="form-group"><label>Payment Method</label><select id="paymentMethod"><option value="bank">Bank Transfer</option></select></div>
          </div>
          <div class="order-summary">
            <h4>Order Summary</h4>
            ${cart.map(item=>{
              let p=products.find(x=>x.id==item.id);
              return `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:0.3rem 0;"><span>${p.name} x${item.qty}</span><span>₦${(p.price*item.qty).toLocaleString()}</span></div>`;
            }).join('')}
            <div style="display:flex;justify-content:space-between;font-weight:bold;margin:0.5rem 0;"><span>Subtotal</span><span>₦${total.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Delivery</span><span>₦2,000</span></div>
            <div style="display:flex;justify-content:space-between;font-size:1.3rem;font-weight:700;border-top:2px solid #000;padding-top:0.5rem;"><span>Total</span><span>₦${(total+2000).toLocaleString()}</span></div>
            <div style="background:#f0f0ff;padding:1rem;border-radius:12px;margin:1rem 0;">
              <h5>Bank Transfer</h5>
              <p>Bank: ${settings.bankName||'GTBank'}<br>Account: ${settings.accountName||'Shindara PhoneFlair'}<br>Number: ${settings.accountNumber||'0123456789'}</p>
            </div>
            <button class="btn" id="placeOrderBtn" style="width:100%;">I've Made Payment</button>
            <button class="btn btn-outline" id="whatsappOrderBtn" style="width:100%;margin-top:0.5rem;"><i class="fab fa-whatsapp"></i> Order via WhatsApp</button>
          </div>
        </div>
      `;
      page.innerHTML = html;
      document.getElementById('placeOrderBtn')?.addEventListener('click',()=>{
        let order = { id:Date.now(), customer: document.getElementById('fullName').value||'Guest', phone:document.getElementById('phone').value, items:cart, total:total+2000, status:'Pending Payment', date:new Date().toISOString() };
        orders.push(order); localStorage.setItem('orders',JSON.stringify(orders));
        cart=[]; saveCart();
        renderOrderConfirm(order);
      });
      document.getElementById('whatsappOrderBtn')?.addEventListener('click',()=>{
        let name = document.getElementById('fullName').value||'Customer';
        let msg = `Order from ${name}%0A`+cart.map(item=>{let p=products.find(x=>x.id==item.id); return `${p.name} x${item.qty} = ₦${(p.price*item.qty).toLocaleString()}`;}).join('%0A')+`%0ATotal: ₦${(total+2000).toLocaleString()}`;
        window.open(`https://wa.me/${settings.whatsapp}?text=${msg}`,'_blank');
      });
    }

    function renderOrderConfirm(order){
      page.innerHTML = `
        <div style="text-align:center;padding:2rem;background:white;border-radius:var(--radius);">
          <i class="fas fa-check-circle" style="font-size:4rem;color:#22c55e;"></i>
          <h2>Order Received!</h2>
          <p>Thank you for shopping with Shindara PhoneFlair. Your order has been received.</p>
          <p><strong>Order #${order.id}</strong><br>Customer: ${order.customer}<br>Total: ₦${order.total.toLocaleString()}<br>Status: ${order.status}</p>
          <a href="#" class="btn" data-page="home">Continue Shopping</a>
        </div>
      `;
    }

    function renderAdmin(){
      let html = `
        <div class="admin-panel">
          <h2>Admin Dashboard</h2>
          <div class="admin-tabs">
            <button class="active" data-tab="products">Products</button>
            <button data-tab="orders">Orders</button>
            <button data-tab="settings">Settings</button>
          </div>
          <div id="adminContent">
            <h3>Products</h3>
            <button class="btn" id="addProductBtn">+ Add Product</button>
            <div style="margin:1rem 0;">
              ${products.map(p=>`
                <div style="display:flex;justify-content:space-between;background:var(--gray);padding:0.4rem 0.8rem;border-radius:8px;margin:0.2rem 0;align-items:center;flex-wrap:wrap;">
                  <span>${p.name} (${p.brand}) ₦${p.price}</span>
                  <div><button class="editProduct" data-id="${p.id}" style="background:var(--purple);color:white;border:none;border-radius:30px;padding:0.2rem 0.8rem;">Edit</button>
                  <button class="deleteProduct" data-id="${p.id}" style="background:#ef4444;color:white;border:none;border-radius:30px;padding:0.2rem 0.8rem;">Delete</button></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      page.innerHTML = html;
      document.querySelectorAll('.admin-tabs button').forEach(btn=>{
        btn.addEventListener('click',()=>{
          document.querySelectorAll('.admin-tabs button').forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
          if(btn.dataset.tab==='orders') renderAdminOrders();
          else if(btn.dataset.tab==='settings') renderAdminSettings();
          else renderAdmin();
        });
      });
      document.getElementById('addProductBtn')?.addEventListener('click',()=>{
        let name=prompt('Product name:');
        if(!name) return;
        let price=parseFloat(prompt('Price in ₦:'));
        let brand=prompt('Brand:');
        let category=prompt('Category:');
        let stock=parseInt(prompt('Stock:'));
        products.push({ id:Date.now(), name, price, brand, category, stock, image:'https://placehold.co/200x200/7c3aed/white?text=New', desc:'', oldPrice:null });
        localStorage.setItem('products',JSON.stringify(products));
        renderAdmin();
      });
      document.querySelectorAll('.editProduct').forEach(btn=>{
        btn.addEventListener('click',()=>{
          let id=parseInt(btn.dataset.id);
          let p=products.find(x=>x.id==id);
          if(!p) return;
          let newName=prompt('Name:',p.name); if(newName) p.name=newName;
          let newPrice=prompt('Price:',p.price); if(newPrice) p.price=parseFloat(newPrice);
          let newBrand=prompt('Brand:',p.brand); if(newBrand) p.brand=newBrand;
          let newStock=prompt('Stock:',p.stock); if(newStock) p.stock=parseInt(newStock);
          localStorage.setItem('products',JSON.stringify(products));
          renderAdmin();
        });
      });
      document.querySelectorAll('.deleteProduct').forEach(btn=>{
        btn.addEventListener('click',()=>{
          let id=parseInt(btn.dataset.id);
          if(confirm('Delete product?')){ products=products.filter(p=>p.id!==id); localStorage.setItem('products',JSON.stringify(products)); renderAdmin(); }
        });
      });
    }

    function renderAdminOrders(){
      let html = `<h3>Orders</h3><div>${orders.length?orders.map(o=>`<div style="background:var(--gray);padding:0.5rem;border-radius:8px;margin:0.3rem 0;"><strong>#${o.id}</strong> ${o.customer} - ₦${o.total} <span style="background:${o.status==='Pending Payment'?'#facc15':'#22c55e'};padding:0.2rem 0.6rem;border-radius:30px;">${o.status}</span></div>`).join(''):'No orders'}</div>`;
      document.getElementById('adminContent').innerHTML = html;
    }

    function renderAdminSettings(){
      let html = `
        <h3>Settings</h3>
        <div class="admin-form">
          <label>WhatsApp Number</label><input type="text" id="setWhatsapp" value="${settings.whatsapp}">
          <label>TikTok URL</label><input type="text" id="setTikTok" value="${settings.tiktok}">
          <label>Bank Name</label><input type="text" id="setBank" value="${settings.bankName}">
          <label>Account Name</label><input type="text" id="setAccName" value="${settings.accountName}">
          <label>Account Number</label><input type="text" id="setAccNum" value="${settings.accountNumber}">
          <button class="btn" id="saveSettingsBtn">Save Settings</button>
        </div>
      `;
      document.getElementById('adminContent').innerHTML = html;
      document.getElementById('saveSettingsBtn')?.addEventListener('click',()=>{
        settings.whatsapp = document.getElementById('setWhatsapp').value;
        settings.tiktok = document.getElementById('setTikTok').value;
        settings.bankName = document.getElementById('setBank').value;
        settings.accountName = document.getElementById('setAccName').value;
        settings.accountNumber = document.getElementById('setAccNum').value;
        localStorage.setItem('settings',JSON.stringify(settings));
        alert('Settings saved!');
      });
    }

    // NAVIGATION
    function navigate(pageName, param=null){
      currentPage = pageName;
      if(pageName==='home') renderHome();
      else if(pageName==='shop') renderShop();
      else if(pageName==='categories') renderShop('','');
      else if(pageName==='cart') renderCart();
      else if(pageName==='checkout') renderCheckout();
      else if(pageName==='admin') renderAdmin();
      else if(pageName==='about') page.innerHTML='<h2>About Shindara PhoneFlair</h2><p>Shindara PhoneFlair provides quality phone accessories, smart gadgets and everyday tech essentials designed to make your devices more useful, stylish and convenient.</p>';
      else if(pageName==='contact') page.innerHTML='<h2>Contact</h2><p>WhatsApp: <a href="#" id="whatsappLink">Chat with us</a><br>TikTok: <a href="#" id="tiktokLink">@shindara</a></p>';
      else if(pageName==='wishlist') {
        if(!wishlist.length){ page.innerHTML='<p>Your wishlist is empty.</p>'; return; }
        page.innerHTML = `<h2>Wishlist</h2><div class="product-grid">${wishlist.map(id=>{let p=products.find(x=>x.id==id); return p?productCard(p):'';}).join('')}</div>`;
      }
      else if(pageName==='product' && param) renderProductDetail(parseInt(param));
      // close mobile nav
      document.getElementById('mobileNav').classList.remove('open');
    }

    // EVENT DELEGATION (clicks)
    document.addEventListener('click', function(e){
      let target = e.target.closest('[data-page]');
      if(target){
        e.preventDefault();
        let page = target.dataset.page;
        if(page==='product'){ let id=target.dataset.id; navigate('product', id); }
        else navigate(page);
      }
      // Add to cart
      if(e.target.closest('.addToCart')){
        let id = parseInt(e.target.closest('.addToCart').dataset.id);
        let existing = cart.find(item=>item.id===id);
        if(existing) existing.qty += 1;
        else cart.push({id, qty:1});
        saveCart();
        alert('Added to cart!');
      }
      // Buy now
      if(e.target.closest('.buyNow')){
        let id = parseInt(e.target.closest('.buyNow').dataset.id);
        let existing = cart.find(item=>item.id===id);
        if(existing) existing.qty += 1;
        else cart.push({id, qty:1});
        saveCart();
        navigate('checkout');
      }
      // Wishlist
      if(e.target.closest('.wishlist')){
        let id = parseInt(e.target.closest('.wishlist').dataset.id);
        if(wishlist.includes(id)) wishlist = wishlist.filter(x=>x!==id);
        else wishlist.push(id);
        saveWishlist();
        alert(wishlist.includes(id)?'Added to wishlist':'Removed from wishlist');
      }
      // Cart controls (qty)
      if(e.target.closest('.qtyInc')){
        let id = parseInt(e.target.closest('.qtyInc').dataset.id);
        let item = cart.find(x=>x.id===id);
        if(item) item.qty+=1;
        saveCart(); renderCart();
      }
      if(e.target.closest('.qtyDec')){
        let id = parseInt(e.target.closest('.qtyDec').dataset.id);
        let item = cart.find(x=>x.id===id);
        if(item && item.qty>1){ item.qty-=1; saveCart(); renderCart(); }
        else if(item && item.qty===1){ cart=cart.filter(x=>x.id!==id); saveCart(); renderCart(); }
      }
      if(e.target.closest('.removeItem')){
        let id = parseInt(e.target.closest('.removeItem').dataset.id);
        cart = cart.filter(x=>x.id!==id);
        saveCart(); renderCart();
      }
      // Hamburger
      if(e.target.closest('#hamburgerBtn')){
        document.getElementById('mobileNav').classList.toggle('open');
      }
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click',()=>{
      document.body.classList.toggle('dark');
      document.getElementById('themeToggle').innerHTML = document.body.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Init
    updateCartBadge();
    // Load products from storage if exists
    let stored = localStorage.getItem('products');
    if(stored) products = JSON.parse(stored);
    else localStorage.setItem('products',JSON.stringify(products));
    navigate('home');

    // WhatsApp link update
    document.getElementById('whatsappLink')?.addEventListener('click',(e)=>{
      e.preventDefault();
      window.open(`https://wa.me/${settings.whatsapp}`,'_blank');
    });
    document.getElementById('tiktokLink')?.addEventListener('click',(e)=>{
      e.preventDefault();
      window.open(settings.tiktok,'_blank');
    });

    // Also attach to footer links
    document.querySelectorAll('footer a[data-page]').forEach(a=>a.addEventListener('click',(e)=>{e.preventDefault(); navigate(a.dataset.page);}));
  })();
</script>
</body>
</html>
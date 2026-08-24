import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ====================== SUPABASE CONFIG ======================
// Replace these two values with your real ones from Supabase → Settings → API
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====================== SAMPLE PRODUCTS ======================
const PRODUCTS = [
  {
    id: 1,
    name: 'iPhone 16 Pro Max',
    price: 1850000,
    category: 'Phones',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    description: 'Latest Apple flagship'
  },
  {
    id: 2,
    name: 'Samsung Galaxy S25 Ultra',
    price: 1650000,
    category: 'Phones',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    description: 'Powerful Android flagship'
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    price: 285000,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
    description: 'Active Noise Cancellation'
  },
  {
    id: 4,
    name: 'MagSafe Charger',
    price: 45000,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1609091839311-b67e6aa3e0a9?w=400',
    description: 'Fast wireless charging'
  }
];

function App() {
  // ====================== STATE ======================
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('shop'); // shop | cart | account | wishlist
  const [authMode, setAuthMode] = useState('signin'); // signin | signup
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // ====================== AUTH ======================
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  // ====================== CREATE ACCOUNT ======================
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Account created successfully! Check your email to confirm (if required).');
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setAuthMode('signin');
    }
    setLoading(false);
  };

  // ====================== SIGN IN ======================
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Try email first
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // If email fails and phone looks like a number, we can later add phone login
    // For now we only support email login (phone login needs SMS setup)

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Signed in successfully!');
      setCurrentPage('shop');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentPage('shop');
  };

  // ====================== CART ======================
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Important: we stay on the shop page (no automatic cart open)
    setMessage(`${product.name} added to cart`);
    setTimeout(() => setMessage(''), 2000);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ====================== WISHLIST ======================
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  };

  // ====================== UI HELPERS ======================
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);

  // ====================== RENDER ======================
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${darkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('shop')}>
            <span className="text-2xl font-bold tracking-tight">Shindara</span>
            <span className="text-sm opacity-70">Phoneflair</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => setCurrentPage('shop')} className={currentPage === 'shop' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}>
              Shop
            </button>
            <button onClick={() => setCurrentPage('wishlist')} className={currentPage === 'wishlist' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}>
              Wishlist ({wishlist.length})
            </button>
            <button onClick={() => setCurrentPage('cart')} className={currentPage === 'cart' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}>
              Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('account')}
                  className="text-sm font-medium opacity-80 hover:opacity-100"
                >
                  {profile?.full_name || user.email}
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentPage('account');
                  setAuthMode('signin');
                }}
                className="text-sm font-medium px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black"
              >
                Account
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Message toast */}
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-black text-white text-sm shadow-lg">
          {message}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* ====================== SHOP PAGE ====================== */}
        {currentPage === 'shop' && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Shop</h1>
            <p className="opacity-60 mb-8">Premium phones & accessories</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {PRODUCTS.map(product => (
                <div
                  key={product.id}
                  className={`rounded-2xl overflow-hidden border transition hover:shadow-xl ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                      <button
                        onClick={() => toggleWishlist(product)}
                        className="text-xl"
                      >
                        {wishlist.find(w => w.id === product.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                    <p className="text-sm opacity-60 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:scale-105 transition dark:bg-white dark:text-black"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================== CART PAGE ====================== */}
        {currentPage === 'cart' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
            {cart.length === 0 ? (
              <p className="opacity-60">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 rounded-2xl border ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm opacity-60">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 rounded-full border">−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 rounded-full border">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 mt-2">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-6 border-t flex justify-between items-center">
                  <span className="text-xl font-bold">Total: {formatPrice(cartTotal)}</span>
                  <button className="px-8 py-3 rounded-full bg-black text-white font-medium dark:bg-white dark:text-black">
                    Checkout via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================== WISHLIST ====================== */}
        {currentPage === 'wishlist' && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Wishlist</h1>
            {wishlist.length === 0 ? (
              <p className="opacity-60">No items in wishlist yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(product => (
                  <div key={product.id} className={`rounded-2xl overflow-hidden border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="font-bold mt-1">{formatPrice(product.price)}</p>
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-3 w-full py-2 rounded-full bg-black text-white text-sm dark:bg-white dark:text-black"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================== ACCOUNT PAGE ====================== */}
        {currentPage === 'account' && (
          <div className="max-w-md mx-auto">
            {user ? (
              <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h1 className="text-2xl font-bold mb-6">My Account</h1>
                <div className="space-y-3 text-sm">
                  <p><span className="opacity-60">Name:</span> {profile?.full_name || '—'}</p>
                  <p><span className="opacity-60">Email:</span> {user.email}</p>
                  <p><span className="opacity-60">Phone:</span> {profile?.phone || '—'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="mt-8 w-full py-3 rounded-full bg-red-500 text-white font-medium"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className={`p-8 rounded-3xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setAuthMode('signin')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium ${
                      authMode === 'signin'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'opacity-50'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-2 rounded-full text-sm font-medium ${
                      authMode === 'signup'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'opacity-50'
                    }`}
                  >
                    Create account
                  </button>
                </div>

                {authMode === 'signup' ? (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label className="text-sm opacity-70">Full name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className={`w-full mt-1 px-4 py-3 rounded-xl border outline-none ${
                          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-sm opacity-70">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`w-full mt-1 px-4 py-3 rounded-xl border outline-none ${
                          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-sm opacity-70">Phone number</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="e.g. 08012345678"
                        className={`w-full mt-1 px-4 py-3 rounded-xl border outline-none ${
                          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-sm opacity-70">Password</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`w-full mt-1 px-4 py-3 rounded-xl border outline-none ${
                          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-full bg-black text-white font-medium dark:bg-white dark:text-black disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create account'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="text-sm opacity-70">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`w-full mt-1 px-4 py-3 rounded-xl border outline-none ${
                          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-sm opacity-70">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`w-full mt-1 px-4 py-3 rounded-xl border outline-none ${
                          darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-full bg-black text-white font-medium dark:bg-white dark:text-black disabled:opacity-50"
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-around py-3 text-xs">
          <button onClick={() => setCurrentPage('shop')} className="flex flex-col items-center gap-1">
            <span>🛍️</span>
            <span>Shop</span>
          </button>
          <button onClick={() => setCurrentPage('wishlist')} className="flex flex-col items-center gap-1">
            <span>❤️</span>
            <span>Wishlist</span>
          </button>
          <button onClick={() => setCurrentPage('cart')} className="flex flex-col items-center gap-1">
            <span>🛒</span>
            <span>Cart</span>
          </button>
          <button onClick={() => setCurrentPage('account')} className="flex flex-col items-center gap-1">
            <span>👤</span>
            <span>Account</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;

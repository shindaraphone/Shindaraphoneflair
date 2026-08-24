import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ========== PUT YOUR REAL KEYS HERE ==========
const supabaseUrl = 'https://hgtvfthiaskxerufvpuo.supabase.co';
const supabaseAnonKey = 'sb_publishable_gUdPXDidvhp4XaZftBx_AQ_jVkyS98w';
// ============================================

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PRODUCTS = [
  { id: 1, name: 'iPhone 16 Pro Max', price: 1850000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400' },
  { id: 2, name: 'Samsung Galaxy S25 Ultra', price: 1650000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
  { id: 3, name: 'AirPods Pro 2', price: 285000, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400' },
  { id: 4, name: 'MagSafe Charger', price: 45000, image: 'https://images.unsplash.com/photo-1609091839311-b67e6aa3e0a9?w=400' },
];

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('shop');
  const [authMode, setAuthMode] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
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
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } }
    });
    if (error) setMessage(error.message);
    else {
      setMessage('Account created successfully!');
      setAuthMode('signin');
      setFullName(''); setEmail(''); setPhone(''); setPassword('');
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else {
      setMessage('Signed in!');
      setCurrentPage('shop');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentPage('shop');
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setMessage(product.name + ' added to cart');
    setTimeout(() => setMessage(''), 2000);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f8f9fa', color: '#111', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '80px' },
    header: { position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 },
    logo: { fontSize: '20px', fontWeight: '700', cursor: 'pointer' },
    navBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '6px 10px' },
    primaryBtn: { backgroundColor: '#000', color: '#fff', padding: '11px 20px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
    card: { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '16px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' },
    input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1d5db', marginTop: '4px', fontSize: '15px', boxSizing: 'border-box' },
    container: { maxWidth: '900px', margin: '0 auto', padding: '20px 16px' },
    toast: { position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', padding: '10px 22px', borderRadius: '9999px', fontSize: '14px', zIndex: 100, whiteSpace: 'nowrap' }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={() => setCurrentPage('shop')}>
          Shindara <span style={{ fontWeight: 400, fontSize: '13px', opacity: 0.7 }}>Phoneflair</span>
        </div>
        <div>
          <button style={styles.navBtn} onClick={() => setCurrentPage('shop')}>Shop</button>
          <button style={styles.navBtn} onClick={() => setCurrentPage('cart')}>Cart ({cartCount})</button>
          <button style={styles.navBtn} onClick={() => setCurrentPage('account')}>
            {user ? (profile?.full_name || 'Account') : 'Account'}
          </button>
        </div>
      </header>

      {message && <div style={styles.toast}>{message}</div>}

      <main style={styles.container}>
        {currentPage === 'shop' && (
          <>
            <h1 style={{ fontSize: '26px', marginBottom: '6px' }}>Shop</h1>
            <p style={{ opacity: 0.6, marginBottom: '22px', fontSize: '15px' }}>Premium phones & accessories</p>
            <div style={styles.grid}>
              {PRODUCTS.map(product => (
                <div key={product.id} style={styles.card}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '15px' }}>{product.name}</h3>
                    <p style={{ fontWeight: '700', fontSize: '16px', margin: '6px 0 12px' }}>{formatPrice(product.price)}</p>
                    <button style={{ ...styles.primaryBtn, width: '100%', padding: '9px' }} onClick={() => addToCart(product)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {currentPage === 'cart' && (
          <>
            <h1 style={{ fontSize: '26px', marginBottom: '20px' }}>Your Cart</h1>
            {cart.length === 0 ? (
              <p style={{ opacity: 0.6 }}>Your cart is empty.</p>
            ) : (
              <div>
                {cart.map(item => (
                  <div key={item.id} style={{ ...styles.card, display: 'flex', gap: '12px', padding: '12px' }}>
                    <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '15px' }}>{item.name}</h3>
                      <p style={{ margin: '4px 0', opacity: 0.7, fontSize: '14px' }}>{formatPrice(item.price)}</p>
                      <p style={{ fontSize: '14px' }}>Qty: {item.quantity}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '700' }}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '18px' }}>Total: {formatPrice(cartTotal)}</strong>
                  <button style={styles.primaryBtn}>Checkout via WhatsApp</button>
                </div>
              </div>
            )}
          </>
        )}

        {currentPage === 'account' && (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {user ? (
              <div style={{ ...styles.card, padding: '24px' }}>
                <h2 style={{ marginTop: 0 }}>My Account</h2>
                <p><strong>Name:</strong> {profile?.full_name || '—'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {profile?.phone || '—'}</p>
                <button style={{ ...styles.primaryBtn, backgroundColor: '#ef4444', marginTop: '18px', width: '100%' }} onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            ) : (
              <div style={{ ...styles.card, padding: '24px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <button
                    style={{ flex: 1, padding: '10px', borderRadius: '9999px', border: 'none', background: authMode === 'signin' ? '#000' : '#e5e7eb', color: authMode === 'signin' ? '#fff' : '#000', fontWeight: 500 }}
                    onClick={() => setAuthMode('signin')}
                  >
                    Sign in
                  </button>
                  <button
                    style={{ flex: 1, padding: '10px', borderRadius: '9999px', border: 'none', background: authMode === 'signup' ? '#000' : '#e5e7eb', color: authMode === 'signup' ? '#fff' : '#000', fontWeight: 500 }}
                    onClick={() => setAuthMode('signup')}
                  >
                    Create account
                  </button>
                </div>

                {authMode === 'signup' ? (
                  <form onSubmit={handleSignUp}>
                    <label style={{ fontSize: '13px', opacity: 0.7 }}>Full name</label>
                    <input style={styles.input} required value={fullName} onChange={e => setFullName(e.target.value)} />
                    <label style={{ fontSize: '13px', opacity: 0.7, display: 'block', marginTop: '12px' }}>Email</label>
                    <input style={styles.input} type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    <label style={{ fontSize: '13px', opacity: 0.7, display: 'block', marginTop: '12px' }}>Phone number</label>
                    <input style={styles.input} type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="08012345678" />
                    <label style={{ fontSize: '13px', opacity: 0.7, display: 'block', marginTop: '12px' }}>Password</label>
                    <input style={styles.input} type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, width: '100%', marginTop: '18px' }}>
                      {loading ? 'Creating...' : 'Create account'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn}>
                    <label style={{ fontSize: '13px', opacity: 0.7 }}>Email</label>
                    <input style={styles.input} type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    <label style={{ fontSize: '13px', opacity: 0.7, display: 'block', marginTop: '12px' }}>Password</label>
                    <input style={styles.input} type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit" disabled={loading} style={{ ...styles.primaryBtn, width: '100%', marginTop: '18px' }}>
                      {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

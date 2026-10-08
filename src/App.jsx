import { useState } from 'react';
import Order from './pages/Order.jsx';
import Track from './pages/Track.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import { getSession, setSession } from './api.js';

export default function App() {
  const [user, setUser] = useState(getSession()?.user || null);
  const [tab, setTab] = useState('order');
  const [token, setToken] = useState('');
  const tabs = [['order', 'Order'], ['track', 'Track'], ['admin', 'Admin']];

  if (!user) return <Login onLogin={setUser} />;

  const logout = () => { setSession(null); setUser(null); };
  return (
    <>
      <header>
        <h1>🍽️ Smart Campus Canteen</h1>
        <nav>
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
          ))}
          <span className="who">👤 {user.name}</span>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>
      <main>
        {tab === 'order' && <Order user={user} onPlaced={setToken} />}
        {tab === 'track' && <Track initialToken={token} />}
        {tab === 'admin' && <Admin />}
      </main>
    </>
  );
}

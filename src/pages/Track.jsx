import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Track({ initialToken }) {
  const [token, setToken] = useState(initialToken || '');
  const [active, setActive] = useState(initialToken || '');
  const [order, setOrder] = useState(null);
  const [mine, setMine] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => { api('/api/my-orders').then(setMine).catch(() => {}); }, [active]);

  useEffect(() => {
    if (!active) return;
    const f = () => api('/api/orders/' + active).then(o => { setOrder(o); setErr(''); }).catch(e => { setOrder(null); setErr(e.message); });
    f();
    const t = setInterval(f, 4000); // auto-refresh status
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="grid">
      <div className="card">
        <h3>Track your order</h3>
        <input type="number" value={token} onChange={e => setToken(e.target.value)} placeholder="Enter token number" />
        <button className="btn" onClick={() => setActive(token)}>Check</button>
        {err && <p className="red">{err}</p>}
        {order && (
          <div className="center" style={{ marginTop: 14 }}>
            <div className="token">#{order.token}</div>
            <span className={'badge ' + order.status}>{order.status}</span>
            <p className="muted">{order.items.map(i => `${i.name} ×${i.qty}`).join(', ')} · Pickup {order.slot}</p>
            {order.status === 'Ready' && <p className="green"><b>Your order is ready! Please collect it.</b></p>}
          </div>
        )}
      </div>
      <div className="card">
        <h3>My orders</h3>
        {mine.length === 0 && <div className="muted">No orders yet</div>}
        {mine.map(o => (
          <div className="item" key={o.token} style={{ cursor: 'pointer' }} onClick={() => { setToken(String(o.token)); setActive(String(o.token)); }}>
            <span>#{o.token} · ₹{o.total}</span><span className={'badge ' + o.status}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

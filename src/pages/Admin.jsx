import { useState } from 'react';
import { api, post, patch, setAdminPw } from '../api.js';

const STATUSES = ['Placed', 'Preparing', 'Ready', 'Collected'];

export default function Admin() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [nu, setNu] = useState({ name: '', price: '', stock: '' });

  async function refresh() {
    const [a, o, m] = await Promise.all([api('/api/admin/analytics'), api('/api/admin/orders'), api('/api/menu')]);
    setStats(a); setOrders(o); setMenu(m);
  }
  async function login() {
    try { setAdminPw(pw); await post('/api/admin/login', { password: pw }); setAuthed(true); refresh(); }
    catch (e) { setAdminPw(''); alert(e.message); }
  }
  const setStatus = async (t, s) => { await patch('/api/admin/orders/' + t, { status: s }); refresh(); };
  const upd = async (id, b) => { await patch('/api/admin/menu/' + id, b); refresh(); };
  const add = async () => { try { await post('/api/admin/menu', nu); setNu({ name: '', price: '', stock: '' }); refresh(); } catch (e) { alert(e.message); } };

  if (!authed) return (
    <div className="card" style={{ maxWidth: 340 }}>
      <h3>Admin login</h3>
      <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password (default: admin123)" />
      <button className="btn" onClick={login}>Login</button>
    </div>
  );

  const mx = Math.max(1, ...(stats?.topItems || []).map(x => x[1]));
  return (
    <>
      <div className="card">
        <h3>Sales Analytics <button className="btn sm gray" onClick={refresh}>Refresh</button></h3>
        {stats && <div className="stats">
          <div className="stat">Today's orders<b>{stats.todayOrders}</b></div>
          <div className="stat">Today's revenue<b>₹{stats.todayRevenue}</b></div>
          <div className="stat">Total orders<b>{stats.totalOrders}</b></div>
          <div className="stat">Total revenue<b>₹{stats.totalRevenue}</b></div>
        </div>}
        <h4>Top items</h4>
        {stats?.topItems.length ? stats.topItems.map(([n, c]) => (
          <div className="toprow" key={n}><span>{n}</span><div className="bar" style={{ width: (c / mx * 60) + '%' }} /><span>{c}</span></div>
        )) : <span className="muted">No sales yet</span>}
      </div>

      <div className="card">
        <h3>Orders</h3>
        <div style={{ overflow: 'auto' }}>
          <table>
            <thead><tr><th>Token</th><th>Name</th><th>Items</th><th>Slot</th><th>₹</th><th>Status</th></tr></thead>
            <tbody>{orders.map(o => (
              <tr key={o.token}>
                <td>#{o.token}</td><td>{o.name}</td><td>{o.items.map(i => `${i.name}×${i.qty}`).join(', ')}</td><td>{o.slot}</td><td>{o.total}</td>
                <td><select className="auto" value={o.status} onChange={e => setStatus(o.token, e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Inventory</h3>
        <table>
          <thead><tr><th>Item</th><th>Price</th><th>Stock</th><th>Available</th></tr></thead>
          <tbody>{menu.map(m => (
            <tr key={m.id + '-' + m.price + '-' + m.stock}>
              <td>{m.name}</td>
              <td><input className="num" type="number" defaultValue={m.price} onBlur={e => upd(m.id, { price: e.target.value })} /></td>
              <td><input className="num" type="number" defaultValue={m.stock} onBlur={e => upd(m.id, { stock: e.target.value })} /></td>
              <td><input type="checkbox" className="chk" checked={m.available} onChange={e => upd(m.id, { available: e.target.checked })} /></td>
            </tr>))}
          </tbody>
        </table>
        <h4>Add item</h4>
        <div className="row">
          <input placeholder="Name" value={nu.name} onChange={e => setNu({ ...nu, name: e.target.value })} />
          <input type="number" placeholder="Price" value={nu.price} onChange={e => setNu({ ...nu, price: e.target.value })} />
          <input type="number" placeholder="Stock" value={nu.stock} onChange={e => setNu({ ...nu, stock: e.target.value })} />
          <button className="btn" onClick={add}>Add</button>
        </div>
      </div>
    </>
  );
}

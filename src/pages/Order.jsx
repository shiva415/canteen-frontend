import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api, post } from '../api.js';

const UPI_ID = 'shiva@upi';       // <-- CHANGE to your UPI ID
const PAYEE_NAME = 'shiva prakash'; // <-- CHANGE to your canteen / payee name
const PAY_SECONDS = 300;             // QR expires after 5 minutes

function makeSlots() {
  const n = new Date();
  n.setMinutes(Math.ceil(n.getMinutes() / 15) * 15 + 15, 0, 0);
  return Array.from({ length: 12 }, (_, i) =>
    new Date(n.getTime() + i * 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
}
const newRef = () => 'CN' + Date.now() + Math.floor(100 + Math.random() * 900); // unique every payment

export default function Order({ user, onPlaced }) {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [pay, setPay] = useState('UPI');
  const slots = useMemo(makeSlots, []);
  const [slot, setSlot] = useState(slots[0]);
  const [receipt, setReceipt] = useState(null);
  const [upi, setUpi] = useState(null);       // { ref, link } while scanner is open
  const [left, setLeft] = useState(PAY_SECONDS);

  const load = () => api('/api/menu').then(setMenu);
  useEffect(() => { load(); }, []);

  // countdown while the scanner is open
  useEffect(() => {
    if (!upi) return;
    setLeft(PAY_SECONDS);
    const t = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(t);
  }, [upi]);
  useEffect(() => { if (upi && left <= 0) { setUpi(null); alert('QR expired. Please try again.'); } }, [left, upi]);

  const change = (m, d) => setCart(c => {
    const q = Math.max(0, Math.min(m.stock, (c[m.id] || 0) + d));
    const next = { ...c };
    q ? (next[m.id] = q) : delete next[m.id];
    return next;
  });

  const lines = Object.keys(cart).map(id => ({ ...menu.find(m => m.id == id), qty: cart[id] }));
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  function startPayment() {
    if (!lines.length) return alert('Add items to the cart first');
    if (pay === 'UPI') {
      const ref = newRef();
      const link = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total.toFixed(2)}&cu=INR&tr=${ref}&tn=${encodeURIComponent('Canteen order ' + ref)}`;
      setUpi({ ref, link });
    } else placeOrder();
  }

  async function placeOrder() {
    try {
      const o = await post('/api/orders', { items: lines.map(l => ({ id: l.id, qty: l.qty })), slot, payMethod: pay });
      setReceipt(o); setCart({}); setUpi(null); onPlaced(String(o.token)); load();
    } catch (e) { alert(e.message); }
  }

  const mmss = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;

  return (
    <div className="grid">
      <div className="card">
        <h3>Menu</h3>
        {menu.map(m => {
          const ok = m.available && m.stock > 0;
          return (
            <div className="item" key={m.id}>
              <div>
                <b>{m.name}</b>
                <div className="muted">₹{m.price} · {ok ? `${m.stock} available` : <span className="red">Sold out</span>}</div>
              </div>
              <div className="qty">
                <button className="btn sm" disabled={!ok} onClick={() => change(m, -1)}>−</button>
                <span>{cart[m.id] || 0}</span>
                <button className="btn sm" disabled={!ok} onClick={() => change(m, 1)}>+</button>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <div className="card">
          <h3>Your Cart</h3>
          {lines.length === 0 ? <div className="muted">Cart is empty</div> : (
            <>
              {lines.map(l => <div className="item" key={l.id}><span>{l.name} × {l.qty}</span><span>₹{l.price * l.qty}</span></div>)}
              <div className="item"><b>Total</b><b>₹{total}</b></div>
            </>
          )}
          <hr />
          <div className="muted">Ordering as <b>{user.name}</b></div>
          <label>Pickup slot</label>
          <select value={slot} onChange={e => setSlot(e.target.value)}>{slots.map(s => <option key={s}>{s}</option>)}</select>
          <label>Payment</label>
          <select value={pay} onChange={e => setPay(e.target.value)}><option>UPI</option><option>Card</option><option>Wallet</option></select>
          <button className="btn full" onClick={startPayment}>Pay & Place Order</button>
        </div>
        {receipt && (
          <div className="card center">
            <div className="muted">Payment successful · Your token</div>
            <div className="token">#{receipt.token}</div>
            <p>Pickup at <b>{receipt.slot}</b><br />Est. prep time: {receipt.estWaitMin} min<br />Total paid: ₹{receipt.total}</p>
          </div>
        )}
      </div>

      {upi && (
        <div className="overlay">
          <div className="modal">
            <h3>Scan to pay ₹{total}</h3>
            <div className="muted">Open any UPI app (GPay, PhonePe, Paytm) and scan</div>
            <div className="scanbox">
              <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
              <QRCodeSVG value={upi.link} size={196} />
              <div className="scanline" />
            </div>
            <div className="muted">Ref: {upi.ref}</div>
            <div className="timer">Expires in {mmss}</div>
            <a className="btn full upilink" href={upi.link}>Open UPI app (on mobile)</a>
            <button className="btn full" style={{ marginTop: 8 }} onClick={placeOrder}>I have paid – Confirm order</button>
            <button className="btn full gray" style={{ marginTop: 6 }} onClick={() => setUpi(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

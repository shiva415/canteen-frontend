import { useState } from 'react';
import { post, setSession } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    try {
      const s = await post('/api/auth/' + mode, f);
      setSession(s); onLogin(s.user);
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="loginwrap">
      <form className="card loginbox" onSubmit={submit}>
        <h2>🍽️ Smart Campus Canteen</h2>
        <p className="muted">{mode === 'login' ? 'Log in to order your food' : 'Create your student account'}</p>
        {mode === 'register' && <><label>Full name</label><input value={f.name} onChange={set('name')} placeholder="Your name" /></>}
        <label>Email</label>
        <input type="email" value={f.email} onChange={set('email')} placeholder="you@college.edu" />
        <label>Password</label>
        <input type="password" value={f.password} onChange={set('password')} placeholder="At least 6 characters" />
        {err && <p className="red">{err}</p>}
        <button className="btn full" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        <p className="muted center" style={{ marginTop: 12 }}>
          {mode === 'login' ? 'New student? ' : 'Already registered? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setErr(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
            {mode === 'login' ? 'Create account' : 'Login'}
          </a>
        </p>
      </form>
    </div>
  );
}

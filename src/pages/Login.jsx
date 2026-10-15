import { useState } from 'react';
import { post, setSession, getApiBase, setApiBase } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [backendUrl, setBackendUrl] = useState(getApiBase());
  const [testStatus, setTestStatus] = useState('');

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const s = await post('/api/auth/' + mode, f);
      setSession(s);
      onLogin(s.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function testBackend() {
    setTestStatus('testing');
    try {
      const target = (backendUrl || '').replace(/\/+$/, '');
      const testUrl = target ? `${target}/health` : '/health';
      const res = await fetch(testUrl);
      if (res.ok) {
        setTestStatus('ok');
        setApiBase(backendUrl);
      } else {
        setTestStatus('fail');
      }
    } catch {
      setTestStatus('fail');
    }
  }

  function saveBackend() {
    setApiBase(backendUrl);
    setTestStatus('saved');
    setTimeout(() => setTestStatus(''), 2500);
  }

  return (
    <div className="loginwrap">
      <div className="loginbox-container">
        <form className="card loginbox" onSubmit={submit}>
          <div className="login-header">
            <div className="canteen-icon">🍽️</div>
            <h2>Campus Canteen</h2>
            <p className="muted">Quick food ordering &amp; live token tracking</p>
          </div>

          <div className="mode-toggle">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setErr(''); setMode('login'); }}
            >
              Log In
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setErr(''); setMode('register'); }}
            >
              Register
            </button>
          </div>

          {mode === 'register' && (
            <div className="field-group">
              <label>Full Name</label>
              <input
                required
                value={f.name}
                onChange={set('name')}
                placeholder="e.g. Shiva Prakash"
              />
            </div>
          )}

          <div className="field-group">
            <label>Student Email</label>
            <input
              type="email"
              required
              value={f.email}
              onChange={set('email')}
              placeholder="student@college.edu"
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={f.password}
              onChange={set('password')}
              placeholder="At least 6 characters"
            />
          </div>

          {err && (
            <div className="error-box">
              <span>⚠️</span>
              <p>{err}</p>
            </div>
          )}

          <button className="btn full submit-btn" type="submit" disabled={loading}>
            {loading ? (
              <span>⏳ Please wait...</span>
            ) : mode === 'login' ? (
              'Sign In →'
            ) : (
              'Create Student Account →'
            )}
          </button>

          <div className="login-footer">
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowConfig(!showConfig)}
            >
              ⚙️ {showConfig ? 'Hide Server Settings' : 'Configure Backend Server'}
            </button>
          </div>

          {showConfig && (
            <div className="backend-config-card">
              <label>Backend API URL</label>
              <input
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="https://canteen-backend-xxxx.onrender.com"
              />
              <div className="config-actions">
                <button type="button" className="btn sm" onClick={saveBackend}>
                  Save
                </button>
                <button type="button" className="btn sm gray" onClick={testBackend}>
                  Test Connection
                </button>
              </div>
              {testStatus === 'testing' && <p className="muted">Testing connection...</p>}
              {testStatus === 'ok' && <p className="green">✅ Connected to backend successfully!</p>}
              {testStatus === 'fail' && <p className="red">❌ Could not reach backend. Verify URL.</p>}
              {testStatus === 'saved' && <p className="green">✅ Backend URL saved!</p>}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

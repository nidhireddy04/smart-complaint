import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@system.com', password: 'admin123', role: 'ADMIN' },
  { label: 'Staff (Rajesh)', email: 'staff1@system.com', password: 'staff123', role: 'STAFF' },
  { label: 'Staff (Priya)', email: 'staff2@system.com', password: 'staff123', role: 'STAFF' },
  { label: 'User (Rahul)', email: 'user@system.com', password: 'user123', role: 'USER' },
];

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authAPI.login(email, password);
      login(user);
      addToast({ type: 'success', title: 'Welcome back!', message: `Logged in as ${user.name}` });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await authAPI.register({ name, email, password, role });
      login(user);
      addToast({ type: 'success', title: 'Account created!', message: 'Welcome to ResolveX' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);
    try {
      const user = await authAPI.login(account.email, account.password);
      login(user);
      addToast({ type: 'success', title: 'Demo Login', message: `Logged in as ${user.name} (${account.role})` });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">RX</div>
            <h1>ResolveX</h1>
            <p>Smart Complaint Management System</p>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
              Sign In
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
              Create Account
            </button>
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="login-password"
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                id="login-submit"
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="register-name"
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  id="register-email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="register-password"
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={4}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  id="register-role"
                  className="form-select"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button
                id="register-submit"
                className="btn btn-primary btn-lg"
                type="submit"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="auth-demo">
            <div className="auth-demo-title">Quick Demo Login</div>
            <div className="auth-demo-accounts">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  className="auth-demo-btn"
                  onClick={() => handleDemoLogin(acc)}
                  disabled={loading}
                >
                  <span>{acc.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

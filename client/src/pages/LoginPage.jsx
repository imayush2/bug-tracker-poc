import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      const { user, token } = res.data.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill demo credentials
  const fillDemo = (email, password) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🐛</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>BugTracker</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Mini Jira — Interview POC</div>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Signing in...</> : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: '1.5rem' }}>
          <div className="divider" />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
            Demo Credentials (click to fill)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[
              { label: 'Admin', email: 'admin@bugtracker.com', pass: 'admin123' },
              { label: 'Developer', email: 'john@bugtracker.com', pass: 'dev123' },
              { label: 'Tester', email: 'jane@bugtracker.com', pass: 'tester123' },
            ].map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => fillDemo(cred.email, cred.pass)}
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '0.75rem' }}
              >
                <strong>{cred.label}:</strong> {cred.email} / {cred.pass}
              </button>
            ))}
          </div>
        </div>

        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

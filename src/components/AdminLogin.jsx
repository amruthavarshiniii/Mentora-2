import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const ADMIN_EMAIL = 'amruthadasamanth@gmail.com';
const ADMIN_PASSWORD = 'amruthavarsh@2006';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    setIsSubmitting(true);

    setTimeout(() => {
      const isValid =
        email.trim().toLowerCase() === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD;

      if (!isValid) {
        setError('Invalid admin credentials. Please try again.');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('mentora_admin', 'true');
      navigate('/admin/dashboard', { replace: true });
    }, 500);
  };

  return (
    <div className="auth-page">
      <div className="bg-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <div className="auth-card animate-fade-in">
        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-subtitle">
          Secure access to approve faculty accounts and manage Mentora.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="primary-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authorizing…' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const FACULTY_REQUESTS_TABLE = 'faculty_signup_requests';
const FACULTY_LOGIN_TABLE = 'faculty_login';

export default function FacultyAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetMessages = () => {
    setError('');
    setInfo('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from(FACULTY_REQUESTS_TABLE)
        .insert([
          {
            name: form.name,
            email: form.email.toLowerCase().trim(),
            department: form.department,
            password: form.password,
          },
        ]);

      if (insertError) throw insertError;

      setInfo(
        'Signup request submitted. Once the admin verifies you, you can log in using the same credentials.'
      );
      setForm((prev) => ({
        ...prev,
        password: '',
      }));
      setMode('login');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        'Unable to submit your request. Please verify Supabase tables or try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const { data, error: selectError } = await supabase
        .from(FACULTY_LOGIN_TABLE)
        .select('*')
        .eq('email', form.email.toLowerCase().trim())
        .eq('password', form.password)
        .limit(1)
        .maybeSingle();

      if (selectError) throw selectError;

      if (!data) {
        setError(
          'Invalid credentials or your account has not been approved yet. Please contact admin.'
        );
        return;
      }

      const facultyProfile = {
        id: data.id,
        email: data.email,
        name: data.username, // Profile still uses 'name', mapped from table's 'username'
        department: 'N/A',   // Default fallback since department isn't in main faculty_login schema
      };

      localStorage.setItem(
        'mentora_faculty',
        JSON.stringify(facultyProfile)
      );
      navigate('/faculty/dashboard', { replace: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        'Login failed due to a server issue. Please check Supabase configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="auth-page">
      <div className="bg-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">Faculty Portal</h1>
          <p className="auth-subtitle">
            Request access or log in to monitor your class performance.
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              resetMessages();
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              resetMessages();
            }}
          >
            New Faculty Signup
          </button>
        </div>

        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label htmlFor="faculty-login-email">Email</label>
              <input
                id="faculty-login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="Enter your registered email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="faculty-login-password">Password</label>
              <input
                id="faculty-login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <p className="auth-error">{error}</p>}
            {info && <p className="auth-info">{info}</p>}

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-field">
              <label htmlFor="faculty-name">Full Name</label>
              <input
                id="faculty-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="faculty-email">Official Email</label>
              <input
                id="faculty-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@college.edu"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="faculty-department">Department</label>
              <input
                id="faculty-department"
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="faculty-password">Create Password</label>
              <input
                id="faculty-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Choose a secure password"
                required
                minLength={6}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}
            {info && <p className="auth-info">{info}</p>}

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


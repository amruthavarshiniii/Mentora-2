import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const FACULTY_REQUESTS_TABLE = 'faculty_signup_requests';
const FACULTY_LOGIN_TABLE = 'faculty_login';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const isAdmin = localStorage.getItem('mentora_admin') === 'true';
    if (!isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from(FACULTY_REQUESTS_TABLE)
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        // eslint-disable-next-line no-console
        console.error(fetchError);
        setError('Unable to load pending faculty requests. Please check Supabase.');
      } else {
        setRequests(data || []);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('mentora_admin');
    navigate('/', { replace: true });
  };

  const handleDecision = async (request, approve) => {
    setActionId(request.id);
    setError('');

    try {
      if (approve) {
        // First check if the email already exists to prevent vague 409 conflict errors
        const { data: existingUser } = await supabase
          .from(FACULTY_LOGIN_TABLE)
          .select('email')
          .eq('email', request.email)
          .maybeSingle();

        if (existingUser) {
          throw new Error('A user with this email address already exists. Please reject this duplicate request.');
        }

        const { error: insertError } = await supabase
          .from(FACULTY_LOGIN_TABLE)
          .insert([
            {
              email: request.email,
              username: request.name, // Map request.name to the schema's username field
              password: request.password,
              // 'department' column does not exist in the faculty_login schema
            },
          ]);

        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error('A user with this email or username already exists. Please reject this duplicate request.');
          }
          throw insertError;
        }
      }

      const { error: deleteError } = await supabase
        .from(FACULTY_REQUESTS_TABLE)
        .delete()
        .eq('id', request.id);

      if (deleteError) throw deleteError;

      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err.message || 'Action failed. Please verify your Supabase tables and try again.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <aside className="sidebar">
        <div className="sidebar-header">
          <button
            type="button"
            className="back-link"
            onClick={() => navigate('/')}
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
          <h2 className="sidebar-title">Admin Panel</h2>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-page-title">Pending Faculty Approvals</h1>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span>Admin</span>
            <button
              type="button"
              onClick={handleLogout}
              className="secondary-btn"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="dashboard-body">
          <div className="module-container">
            {error && <p className="auth-error mb-4">{error}</p>}

            {loading ? (
              <div className="card-title">Loading requests…</div>
            ) : requests.length === 0 ? (
              <div className="empty-state-card">
                <h2>No pending requests</h2>
                <p>
                  When a new faculty member signs up, their request will appear
                  here for your approval.
                </p>
              </div>
            ) : (
              <div className="table-card">
                <h2 className="card-header">New Faculty Sign-ups</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Requested At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr key={req.id}>
                          <td>{req.name}</td>
                          <td>{req.email}</td>
                          <td>{req.department}</td>
                          <td>
                            {req.created_at
                              ? new Date(req.created_at).toLocaleString()
                              : '—'}
                          </td>
                          <td>
                            <div className="actions-group">
                              <button
                                type="button"
                                className="btn-sm btn-success"
                                onClick={() => handleDecision(req, true)}
                                disabled={actionId === req.id}
                              >
                                {actionId === req.id ? 'Approving…' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                className="btn-sm btn-outline"
                                onClick={() => handleDecision(req, false)}
                                disabled={actionId === req.id}
                              >
                                {actionId === req.id ? 'Updating…' : 'Reject'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


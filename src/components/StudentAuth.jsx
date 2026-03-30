import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

export default function StudentAuth() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ rollNo: '', dob: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/data/class.csv');
      if (!response.ok) throw new Error('Failed to load student data.');
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data } = results;
          const rollNo = form.rollNo.trim().toUpperCase();
          const dob = form.dob.trim();
          
          const student = data.find((row) => {
            const rowRoll = String(row['Roll No'] || row['Roll_No'] || row.Reg_No || '').trim().toUpperCase();
            const rowDob  = String(row.DOB || '').trim();
            return rowRoll === rollNo && rowDob === dob;
          });
          
          if (student) {
            // Save basic session check to local storage
            // Use 'rollNo' internally to match new schema, but fallback to regNo if needed
            const actualRollNo = student['Roll No'] || student.Reg_No;
            localStorage.setItem('mentora_student', JSON.stringify({ rollNo: actualRollNo, dob: student.DOB }));
            navigate('/student/dashboard', { replace: true });
          } else {
            setError('Invalid Roll Number or DOB.');
          }
          setLoading(false);
        },
        error: () => {
          setError('Error parsing student data.');
          setLoading(false);
        }
      });
    } catch (err) {
      console.error(err);
      setError('Unable to reach the server. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
      </div>

      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <h1 className="auth-title">Student Portal</h1>
          <p className="auth-subtitle">
            Log in with your Roll Number and DOB to view your performance dashboard.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="student-rollno">Roll Number</label>
            <input
              id="student-rollno"
              type="text"
              name="rollNo"
              value={form.rollNo}
              onChange={handleChange}
              placeholder="e.g. 24L31A0565"
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="student-dob">Password (DOB)</label>
            <input
              id="student-dob"
              type="password"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              placeholder="Enter DOB as password (e.g. 09-03-2006)"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="primary-btn mt-4"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

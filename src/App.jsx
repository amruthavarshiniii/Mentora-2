import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import FacultyDashboard from './components/FacultyDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import FacultyAuth from './components/FacultyAuth';
import StudentAuth from './components/StudentAuth';
import StudentDashboard from './components/StudentDashboard';
import './dashboard.css';

function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 400" xmlns="http://www.w3.org/2000/svg" className="hero-svg" aria-hidden="true">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#1a56db',stopOpacity:0.15}} />
          <stop offset="100%" style={{stopColor:'#0ea5e9',stopOpacity:0.08}} />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#1a56db',stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#0ea5e9',stopOpacity:1}} />
        </linearGradient>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:'#ec4899',stopOpacity:1}} />
        </linearGradient>
      </defs>

      {/* Main dashboard panel */}
      <rect x="60" y="30" width="360" height="240" rx="20" fill="white" fillOpacity="0.9" stroke="rgba(26,86,219,0.15)" strokeWidth="1.5"/>

      {/* Dashboard header */}
      <rect x="60" y="30" width="360" height="52" rx="20" fill="url(#grad2)"/>
      <rect x="60" y="62" width="360" height="20" rx="0" fill="url(#grad2)"/>
      <circle cx="92" cy="56" r="8" fill="white" fillOpacity="0.4"/>
      <circle cx="116" cy="56" r="8" fill="white" fillOpacity="0.25"/>
      <circle cx="140" cy="56" r="8" fill="white" fillOpacity="0.15"/>
      <rect x="165" y="49" width="180" height="14" rx="7" fill="white" fillOpacity="0.2"/>

      {/* Stat cards row */}
      <rect x="80" y="100" width="90" height="56" rx="12" fill="url(#grad1)" stroke="rgba(26,86,219,0.2)" strokeWidth="1"/>
      <rect x="185" y="100" width="90" height="56" rx="12" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.2)" strokeWidth="1"/>
      <rect x="290" y="100" width="90" height="56" rx="12" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="1"/>

      <text x="125" y="122" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1a56db">1,200</text>
      <text x="125" y="138" textAnchor="middle" fontSize="9" fill="#475569">Students</text>
      <text x="230" y="122" textAnchor="middle" fontSize="14" fontWeight="700" fill="#7c3aed">80</text>
      <text x="230" y="138" textAnchor="middle" fontSize="9" fill="#475569">Faculty</text>
      <text x="335" y="122" textAnchor="middle" fontSize="14" fontWeight="700" fill="#059669">95%</text>
      <text x="335" y="138" textAnchor="middle" fontSize="9" fill="#475569">Attendance</text>

      {/* Bar chart area */}
      <rect x="80" y="175" width="170" height="80" rx="10" fill="rgba(248,250,252,0.8)" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
      <rect x="95" y="220" width="18" height="25" rx="3" fill="url(#grad2)"/>
      <rect x="120" y="205" width="18" height="40" rx="3" fill="url(#grad2)" fillOpacity="0.7"/>
      <rect x="145" y="215" width="18" height="30" rx="3" fill="url(#grad2)" fillOpacity="0.5"/>
      <rect x="170" y="200" width="18" height="45" rx="3" fill="url(#grad2)"/>
      <rect x="195" y="210" width="18" height="35" rx="3" fill="url(#grad2)" fillOpacity="0.6"/>
      <text x="165" y="194" textAnchor="middle" fontSize="8" fill="#94a3b8">Attendance Trend</text>

      {/* Donut chart area */}
      <rect x="265" y="175" width="115" height="80" rx="10" fill="rgba(248,250,252,0.8)" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
      <circle cx="315" cy="215" r="25" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
      <circle cx="315" cy="215" r="25" fill="none" stroke="url(#grad2)" strokeWidth="10" strokeDasharray="95 100" strokeDashoffset="25" strokeLinecap="round"/>
      <text x="315" y="220" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1a56db">95%</text>

      {/* Floating card 1 - bottom left */}
      <rect x="20" y="240" width="140" height="70" rx="14" fill="white" fillOpacity="0.95" stroke="rgba(26,86,219,0.12)" strokeWidth="1" filter="url(#shadow)"/>
      <circle cx="45" cy="265" r="14" fill="url(#grad2)"/>
      <rect x="65" y="257" width="80" height="8" rx="4" fill="#1e293b" fillOpacity="0.7"/>
      <rect x="65" y="270" width="55" height="6" rx="3" fill="#94a3b8"/>
      <rect x="25" y="288" width="120" height="14" rx="7" fill="url(#grad1)"/>

      {/* Floating card 2 - bottom right */}
      <rect x="315" y="290" width="150" height="80" rx="14" fill="white" fillOpacity="0.95" stroke="rgba(124,58,237,0.15)" strokeWidth="1"/>
      <circle cx="340" cy="320" r="14" fill="url(#grad3)"/>
      <rect x="362" y="312" width="85" height="8" rx="4" fill="#1e293b" fillOpacity="0.7"/>
      <rect x="362" y="325" width="65" height="6" rx="3" fill="#94a3b8"/>
      <rect x="320" y="345" width="130" height="14" rx="7" fill="rgba(124,58,237,0.1)"/>

      {/* Floating orbs */}
      <circle cx="430" cy="50" r="30" fill="url(#grad2)" fillOpacity="0.12"/>
      <circle cx="50" cy="370" r="22" fill="url(#grad3)" fillOpacity="0.12"/>
    </svg>
  );
}

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => { setIsLoading(false); }, 200);
    return () => clearTimeout(timer);
  }, []);

  const portals = [
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'Manage campus infrastructure, users, and system configuration.',
      Icon: ShieldCheck,
      color: '#1a56db',
      glow: 'rgba(26, 86, 219, 0.35)',
      bg: 'rgba(26, 86, 219, 0.08)',
      delay: 'delay-100',
      path: '/admin'
    },
    {
      id: 'faculty',
      title: 'Faculty Portal',
      description: 'Access student records, manage courses, and update grades.',
      Icon: BookOpen,
      color: '#7c3aed',
      glow: 'rgba(124, 58, 237, 0.35)',
      bg: 'rgba(124, 58, 237, 0.08)',
      delay: 'delay-200',
      path: '/faculty'
    },
    {
      id: 'student',
      title: 'Student Dashboard',
      description: 'View academic progress, attendance, and campus announcements.',
      Icon: GraduationCap,
      color: '#059669',
      glow: 'rgba(5, 150, 105, 0.35)',
      bg: 'rgba(5, 150, 105, 0.08)',
      delay: 'delay-300',
      path: '/student'
    }
  ];

  if (isLoading) return null;

  return (
    <>
      {/* Animated gradient background */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-blob blob-1" />
        <div className="hero-blob blob-2" />
        <div className="hero-blob blob-3" />
      </div>

      {/* Navbar */}
      <nav className="navbar animate-slide-down">
        <div className="logo-container">
          <div className="logo-icon-wrap">
            <GraduationCap size={22} color="white" />
          </div>
          <div className="logo-text">Mentora</div>
        </div>
        <div className="navbar-links">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Contact</a>
        </div>
      </nav>

      {/* SPLIT HERO */}
      <section className="split-hero animate-fade-in delay-100">
        {/* Left column */}
        <div className="hero-left">
          <div className="hero-badge">✦ Smart Campus Management</div>
          <h1 className="hero-title">
            Welcome to the<br />
            <span className="hero-gradient-text">Mentora</span> Ecosystem
          </h1>
          <p className="hero-subtitle">
            Select your portal below to get started.
          </p>
        </div>

        {/* Right column – illustration */}
        <div className="hero-right hero-right--lg">
          <HeroIllustration />
        </div>
      </section>

      {/* ROLE CARDS */}
      <section className="cards-section animate-fade-in delay-200">
        <div className="cards-grid-new">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className="glass-card"
              style={{ '--card-color': portal.color, '--card-glow': portal.glow, '--card-bg': portal.bg }}
              onClick={() => navigate(portal.path)}
            >
              <div className="glass-card-icon" style={{ background: portal.bg, color: portal.color }}>
                <portal.Icon size={32} strokeWidth={1.8} />
              </div>
              <h2 className="glass-card-title">{portal.title}</h2>
              <p className="glass-card-desc">{portal.description}</p>
              <button className="glass-card-btn">
                Enter <ArrowRight size={14} className="btn-arrow" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function RequireAdmin({ children }) {
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('mentora_admin') === 'true';
  return isAdmin ? children : <Navigate to="/admin" replace />;
}

function RequireFaculty({ children }) {
  const isFaculty = typeof window !== 'undefined' && localStorage.getItem('mentora_faculty');
  return isFaculty ? children : <Navigate to="/faculty" replace />;
}

function RequireStudent({ children }) {
  const isStudent = typeof window !== 'undefined' && localStorage.getItem('mentora_student');
  return isStudent ? children : <Navigate to="/student" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faculty" element={<FacultyAuth />} />
        <Route
          path="/faculty/dashboard/*"
          element={
            <RequireFaculty>
              <FacultyDashboard />
            </RequireFaculty>
          }
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route path="/student" element={<StudentAuth />} />
        <Route
          path="/student/dashboard/*"
          element={
            <RequireStudent>
              <StudentDashboard />
            </RequireStudent>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

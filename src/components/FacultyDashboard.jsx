import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LineChart, ChevronLeft } from 'lucide-react';

import AcademicPerformance from './AcademicPerformance';
import AttendanceMonitoring from './AttendanceMonitoring';
import InternalMarksAnalysis from './InternalMarksAnalysis';

export default function FacultyDashboard() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('mentora_faculty');
    if (stored) {
      try {
        setFacultyProfile(JSON.parse(stored));
      } catch {
        setFacultyProfile(null);
      }
    }

    // Parse the CSV from public folder/external.
    // For Vite, we can fetch it if it's in public/ or if imported directly 
    // Since class.csv is in mentora/data/class.csv, we might need to import it as a URL 
    // or fetch it directly. Let's assume it's moved or accessible via fetch.
    // We will simulate fetching the file from a known location:
    import('../../data/class.csv?raw')
      .then((res) => {
        Papa.parse(res.default, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setStudentsData(results.data);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        console.error("Error loading CSV: ", err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mentora_faculty');
    window.location.href = '/faculty';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-vh-100" style={{minHeight: "100vh"}}>
        <div className="card-title">Loading Students Data...</div>
      </div>
    );
  }

  const navItems = [
    { path: '/faculty/dashboard', label: 'Academic Performance', icon: <LayoutDashboard size={20} /> },
    { path: '/faculty/dashboard/attendance', label: 'Attendance Monitoring', icon: <Users size={20} /> },
    { path: '/faculty/dashboard/marks', label: 'Internal Marks Analysis', icon: <LineChart size={20} /> },
  ];

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="back-link">
            <ChevronLeft size={20} />
            <span>Home</span>
          </Link>
          <h2 className="sidebar-title">Faculty Portal</h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
             <Link 
               key={item.path} 
               to={item.path}
               className={`nav-item ${location.pathname === item.path || (location.pathname === '/faculty/' && item.path === '/faculty') ? 'active' : ''}`}
             >
               {item.icon}
               <span>{item.label}</span>
             </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-page-title">
            {navItems.find(i => i.path === location.pathname || (location.pathname === '/faculty/dashboard/' && i.path === '/faculty/dashboard'))?.label || 'Dashboard'}
          </h1>
          <div className="user-profile">
            <div className="avatar">
              {(facultyProfile?.name || 'F').charAt(0).toUpperCase()}
            </div>
            <span>{facultyProfile?.name || 'Faculty'}</span>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="dashboard-body">
          <Routes>
            <Route path="/" element={<AcademicPerformance data={studentsData} />} />
            <Route path="/attendance" element={<AttendanceMonitoring data={studentsData} />} />
            <Route path="/marks" element={<InternalMarksAnalysis data={studentsData} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

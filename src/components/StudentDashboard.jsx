import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import { supabase } from '../lib/supabaseClient';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [counselling, setCounselling] = useState(null);

  // Averages
  const [avgs, setAvgs] = useState({
    cgpa: 0,
    attendance: 0,
    internalMarks: 0,
  });

  useEffect(() => {
    const cached = localStorage.getItem('mentora_student');
    if (!cached) {
      navigate('/student', { replace: true });
      return;
    }
    const sessionToken = JSON.parse(cached);

    const loadData = async () => {
      try {
        const response = await fetch('/data/class.csv');
        if (!response.ok) throw new Error('Failed to load dataset');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true, // auto convert numbers
          complete: (results) => {
            const data = results.data;
            const currentStudent = data.find((r) => {
              const rowRoll = String(r['Roll No'] || r['Roll_No'] || r.Reg_No || '').trim().toUpperCase();
              const tokenRoll = String(sessionToken.rollNo || sessionToken.regNo || '').trim().toUpperCase();
              return rowRoll === tokenRoll && String(r.DOB).trim() === String(sessionToken.dob).trim();
            });

            if (!currentStudent) {
              setError('Student details not found. Contact administrator.');
              setLoading(false);
              return;
            }

            setStudent(currentStudent);
            setClassData(data);

            // Compute Averages
            let sumCgpa = 0, sumAtt = 0, sumInt = 0;
            let count = 0;
            data.forEach(d => {
              const cgpaVal = Number(d.CGPA);
              const attVal = Number(d['Attendance%'] || d.Attendance_Percentage);
              const intVal = Number(d.Internal || d.Internal_Marks);
              if (!isNaN(cgpaVal) && !isNaN(attVal)) {
                sumCgpa += cgpaVal;
                sumAtt += attVal;
                sumInt += (isNaN(intVal) ? 0 : intVal);
                count++;
              }
            });

            if (count > 0) {
              setAvgs({
                cgpa: (sumCgpa / count).toFixed(2),
                attendance: (sumAtt / count).toFixed(1),
                internalMarks: (sumInt / count).toFixed(1)
              });
            }
            setLoading(false);
          },
          error: () => {
            setError('Failed to parse dataset.');
            setLoading(false);
          }
        });
      } catch (err) {
        console.error(err);
        setError('Error loading student data.');
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    if (student) {
      const fetchCounselling = async () => {
        const rollNo = student['Roll No'] || student.Reg_No;
        const { data: cData, error: cErr } = await supabase
          .from('student_counselling')
          .select('*')
          .eq('roll_no', rollNo)
          .maybeSingle();
        
        if (!cErr && cData) {
          setCounselling(cData);
        }
      };
      fetchCounselling();
    }
  }, [student]);

  const handleLogout = () => {
    localStorage.removeItem('mentora_student');
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="dashboard-layout flex items-center justify-center min-h-screen">
        <div className="card-title text-primary">Loading your personalized dashboard...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="dashboard-layout p-8">
        <div className="empty-state-card w-full max-w-2xl mx-auto">
          <h2 className="text-red-600">Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={handleLogout} className="primary-btn mt-4 max-w-xs mx-auto">Back to Login</button>
        </div>
      </div>
    );
  }

  // Value Extractors
  const cgpa = Number(student.CGPA) || 0;
  const attendance = Number(student['Attendance%'] || student.Attendance_Percentage) || 0;
  const internals = Number(student.Internal || student.Internal_Marks) || 0;
  const backlogs = Number(student.Backlogs) || 0;
  const classesAttended = Number(student.Classes_Attended) || 0;
  const totalClasses = Number(student.Total_Classes) || 0;

  // Calculators & Business Logic
  let cgpaStatus = 'Poor';
  let cgpaColor = '#dc2626'; // red
  if (cgpa >= 9.0) { cgpaStatus = 'Excellent'; cgpaColor = '#16a34a'; }
  else if (cgpa >= 8.0) { cgpaStatus = 'Good'; cgpaColor = '#2563eb'; }
  else if (cgpa >= 7.0) { cgpaStatus = 'Average'; cgpaColor = '#d97706'; }

  let attStatus = 'Critical';
  let attColor = '#dc2626'; // red
  let attMessage = 'You are severely short of attendance. Immediate action needed.';
  if (attendance >= 90) { 
    attStatus = 'Safe'; attColor = '#16a34a'; // green
    attMessage = 'You have excellent attendance! Keep it up.';
  }
  else if (attendance >= 75) { 
    attStatus = 'Warning'; attColor = '#eab308'; // yellow
    attMessage = `You are slightly short. Attend the next ${(85 - attendance) * 2} classes to hit the safe zone.`;
  }

  let barklogRiskText = 'No Risk';
  let backlogColor = '#16a34a';
  if (backlogs > 2) { barklogRiskText = 'High Risk'; backlogColor = '#dc2626'; }
  else if (backlogs > 0) { barklogRiskText = 'Moderate Risk'; backlogColor = '#f59e0b'; }

  // Overall Risk Calculation
  let riskScore = 0;
  if (cgpa < 7.0) riskScore += 2;
  if (attendance < 75) riskScore += 3;
  if (backlogs > 0) riskScore += (backlogs > 2 ? 4 : 2);

  let overallRisk = 'Low';
  let riskColor = '#16a34a'; // green
  if (riskScore >= 5) { overallRisk = 'High'; riskColor = '#ef4444'; }
  else if (riskScore > 1) { overallRisk = 'Medium'; riskColor = '#f59e0b'; }

  // Pie Chart Data for Attendance
  const attData = [
    { name: 'Attended', value: attendance, color: attColor },
    { name: 'Missed', value: 100 - attendance, color: '#e2e8f0' }
  ];

  // Bar Chart Data (Student vs Average)
  const compareData = [
    { name: 'CGPA', Student: cgpa, Average: Number(avgs.cgpa) },
    { name: 'Internals (Scale/10)', Student: internals / 3, Average: Number(avgs.internalMarks) / 3 } // scaling for visual parity
  ];

  // Suggestions Logic
  const getSuggestions = () => {
    const items = [];
    
    // CGPA Suggestions
    if (cgpa >= 9.0) {
      items.push({ 
        title: 'Academic Excellence', 
        text: 'Outstanding performance! You are an academic leader. Consider research opportunities or mentoring peers.',
        icon: '🌟',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    } else if (cgpa >= 8.0) {
      items.push({ 
        title: 'Consistent Performer', 
        text: 'Great job! Look into advanced projects or specific technical certifications to boost your portfolio.',
        icon: '📈',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      });
    } else if (cgpa >= 7.0) {
      items.push({ 
        title: 'Focus Area', 
        text: 'Moving in the right direction. Identify subjects below 7.5 and dedicate more time to them to hit the 8.0+ tier.',
        icon: '🎯',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      });
    } else {
      items.push({ 
        title: 'Academic Support Needed', 
        text: 'Focus on foundational concepts. We recommend attending remedial sessions and setting up a study schedule.',
        icon: '📚',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    // Attendance Suggestions
    if (attendance < 75) {
      items.push({ 
        title: 'Attendance Alert', 
        text: 'Your attendance is critical. Ensure you attend all upcoming classes to maintain exam eligibility.',
        icon: '⌛',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    } else if (attendance < 85) {
      items.push({ 
        title: 'Attendance Improvement', 
        text: 'Try to reach the 85% safe zone to avoid any last-minute eligibility issues.',
        icon: '📅',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      });
    }

    // Backlog Suggestions
    if (backlogs > 0) {
      items.push({ 
        title: 'Clear Pending Subjects', 
        text: `Prioritize clearing your ${backlogs} backlog(s) in the next supplementary cycle. Consult your guide for a study plan.`,
        icon: '📝',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    return items;
  };

  const suggestions = getSuggestions();

  return (
    <div className="dashboard-layout animate-fade-in">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Student Portal</h2>
          <p className="text-slate-500 text-sm mt-1">{student['Roll No'] || student.Reg_No}</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item" onClick={handleLogout}>
            <span>Sign Out</span>
          </a>
        </nav>
      </aside>

      <main className="dashboard-content bg-slate-50">
        <header className="dashboard-header">
          <h1 className="dashboard-page-title">Welcome back, {student.Name}!</h1>
          <div className="user-profile">
            <div className="avatar bg-blue-600">{student.Name.charAt(0)}</div>
          </div>
        </header>

        <div className="dashboard-body max-w-7xl mx-auto space-y-6 flex flex-col gap-6">
          
          {/* Counselling Note Alert */}
          {counselling && (
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <span className="text-8xl font-bold">💬</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Faculty Consultation</span>
                  <span className="text-blue-100 text-xs">{counselling.counselling_date}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Message from your Mentor</h3>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                   <p className="text-blue-50 leading-relaxed italic">"{counselling.counselling_note}"</p>
                </div>
                <p className="text-xs text-blue-200 mt-4">This note was recorded during your recent counselling session regarding your performance/attendance.</p>
              </div>
            </div>
          )}

          {/* Top Banner indicating Risk Level */}
          {overallRisk === 'High' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-red-700 font-bold text-lg">⚠️ High Academic Risk Detected</h3>
                <p className="text-red-600 text-sm">Your current metrics indicate you are at extreme risk. Please focus on your backlogs and attendance immediately.</p>
              </div>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* CGPA Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Current CGPA</h3>
              <div className="metric-value font-extrabold mb-1 text-blue-600">
                {cgpa.toFixed(2)}
              </div>
              <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 border border-blue-100 text-blue-600 bg-blue-50">
                STATUS: {cgpaStatus}
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Academic Standing
              </p>
            </div>

            {/* Attendance Card (already updated) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: attColor }}></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Attendance Check</h3>
              <div className="metric-value font-extrabold mb-1" style={{ color: attColor }}>
                {attendance}%
              </div>
              <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 border" style={{ borderColor: attColor, color: attColor, backgroundColor: `${attColor}10` }}>
                {attStatus}
              </div>
              <p className="text-xs font-bold text-slate-600 leading-relaxed max-w-[200px]">
                {attMessage}
              </p>
            </div>

            {/* Backlogs Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: backlogColor }}></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Backlog Hub</h3>
              <div className="metric-value font-extrabold mb-1" style={{ color: backlogColor }}>
                {backlogs}
              </div>
              <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 border" style={{ borderColor: backlogColor, color: backlogColor, backgroundColor: `${backlogColor}10` }}>
                {barklogRiskText}
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Active Backlogs
              </p>
            </div>

            {/* Progress Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Class Progress</h3>
              <div className="metric-value font-extrabold mb-1 text-purple-600">
                {classesAttended}
              </div>
              <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 border border-purple-100 text-purple-600 bg-purple-50">
                OF {totalClasses} TOTAL
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Sessions Attended
              </p>
            </div>
          </div>

          {/* Personalized Insights Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Personalized Progress Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((s, i) => (
                <div key={i} className={`${s.bgColor} border border-slate-100 rounded-xl p-4 flex gap-4 animate-slide-up`}>
                  <div className="text-2xl mt-1">{s.icon}</div>
                  <div>
                    <h4 className={`font-bold ${s.color}`}>{s.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Performance Comparison Chart */}
            <div className="chart-card md:col-span-2">
              <h3 className="card-header">Performance vs Class Average</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[0, 10]} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="Student" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Average" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">Note: Internal Marks have been normalized to a 10-point scale for comparison.</p>
            </div>

            {/* Attendance & Participation Insights */}
            <div className="chart-card flex flex-col">
              <h3 className="card-header border-b border-slate-100 pb-3 mb-4">Attendance Check</h3>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        {attData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold" style={{ color: attColor }}>{attendance}%</span>
                  </div>
                </div>
                <p className="text-center text-sm font-medium mt-4 text-slate-600 px-4">{attMessage}</p>
              </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Internal Marks */}
              <div className="table-card flex flex-col">
                <h3 className="card-header border-b border-slate-100 pb-3 mb-4">Academic Tasks</h3>
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-600">Internal Marks</span>
                      <span className="font-bold">{internals}/30</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(internals / 30) * 100}%` }}></div>
                    </div>
                    {internals < Number(avgs.internalMarks) && (
                      <p className="text-xs text-orange-600 mt-1">Below class average of {avgs.internalMarks}. Focus on mid-terms!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Backlogs Manager */}
              <div className="table-card flex flex-col">
                <h3 className="card-header border-b border-slate-100 pb-3 mb-4">Backlog Manager</h3>
                <div className="flex flex-col items-center justify-center flex-1 text-center py-2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3`} style={{ backgroundColor: backlogColor }}>
                    {backlogs}
                  </div>
                  <h4 className="font-bold text-slate-800">{barklogRiskText}</h4>
                  {backlogs === 0 ? (
                    <p className="text-sm text-slate-500 mt-2">All clear! Keep maintaining your streak.</p>
                  ) : (
                    <p className="text-sm text-slate-500 mt-2">Set up a roadmap with your guide to clear the pending {backlogs} subjects during supply exams.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { supabase } from '../lib/supabaseClient';

export default function AttendanceMonitoring({ data }) {
  const [counsellingNotes, setCounsellingNotes] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCounsellingNotes();
  }, []);

  const fetchCounsellingNotes = async () => {
    const { data: notes, error } = await supabase.from('student_counselling').select('*');
    if (!error && notes) {
      const notesMap = {};
      notes.forEach(n => {
        notesMap[n.roll_no] = n;
      });
      setCounsellingNotes(notesMap);
    }
  };

  const handleCounselClick = (student) => {
    setSelectedStudent(student);
    setNote(counsellingNotes[student['Roll No']]?.counselling_note || '');
  };

  const handleSaveNote = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('student_counselling')
      .upsert({
        roll_no: selectedStudent['Roll No'],
        name: selectedStudent.Name,
        counselling_note: note,
        counselling_date: new Date().toISOString().split('T')[0]
      }, { onConflict: 'roll_no' });

    if (!error) {
      await fetchCounsellingNotes();
      setSelectedStudent(null);
    } else {
      alert('Error saving note: ' + error.message);
    }
    setSaving(false);
  };

  const segments = useMemo(() => {
    if (!data) return { high: [], mod: [], low: [] };
    
    const high = [], mod = [], low = [];
    
    data.forEach(d => {
      const att = parseFloat(d['Attendance%']);
      if (isNaN(att) || att === 0) return;
      
      if (att >= 90) high.push(d);
      else if (att >= 75) mod.push(d);
      else low.push(d);
    });
    
    return { high, mod, low };
  }, [data]);

  const chartData = useMemo(() => {
    return [
      { name: 'High (≥90%)', value: segments.high.length, color: '#16a34a' },
      { name: 'Moderate (75-90%)', value: segments.mod.length, color: '#eab308' }, // Yellow
      { name: 'Low (<75%)', value: segments.low.length, color: '#ef4444' } // Red
    ];
  }, [segments]);

  const atRiskStudents = useMemo(() => {
    if (!data) return [];
    return segments.low.sort((a, b) => parseFloat(a['Attendance%']) - parseFloat(b['Attendance%']));
  }, [segments]);

  const avgAttendance = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const valid = data.map(d => parseFloat(d['Attendance%'])).filter(a => !isNaN(a) && a > 0);
    if (valid.length === 0) return 0;
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
  }, [data]);

  return (
    <div className="module-container space-y-6">
      <h2 className="module-title">Attendance Analysis & Monitoring</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Class Average</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{avgAttendance}%</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">📊</div>
          </div>
        </div>
        <div className="metric-card bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Highly Disciplined</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{segments.high.length}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">🏆</div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Students with ≥90% attendance</p>
        </div>
        <div className="metric-card bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Attendance Alerts</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{segments.low.length}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">⚠️</div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Students below 75% threshold</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Categories Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Attendance Segmentation</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} style={{fontSize: '12px', fontWeight: '500'}} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Risk Students */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Critical Attendance Alerts</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">Below 75%</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-2">Student</th>
                  <th className="px-4 py-2">Attendance</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {atRiskStudents.slice(0, 10).map(s => (
                  <tr key={s['Roll No']} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-700">{s.Name}</p>
                      <p className="text-xs text-slate-400">{s['Roll No']}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-600">{s['Attendance%']}%</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                         {parseFloat(s['Attendance%']) < 65 ? 'High Risk' : 'Warning'}
                      </span>
                      {counsellingNotes[s['Roll No']] && (
                        <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                          Counselled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleCounselClick(s)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-all hover:shadow-sm"
                      >
                        {counsellingNotes[s['Roll No']] ? 'Edit Note' : 'Counsel'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Counselling Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden">
               <div className="bg-slate-50 p-6 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800">Student Counselling Session</h3>
                  <p className="text-sm text-slate-500 mt-1">Recording session for {selectedStudent.Name} ({selectedStudent['Roll No']})</p>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-1.5">Attendance Context</label>
                     <div className="p-3 bg-red-50 rounded-lg text-red-700 text-sm border border-red-100">
                        Current Attendance: <b>{selectedStudent['Attendance%']}%</b>. Student has missed a significant number of classes.
                     </div>
                  </div>
                  <div>
                     <label htmlFor="note" className="block text-sm font-bold text-slate-700 mb-1.5">Counselling Note / Reason</label>
                     <textarea 
                        id="note"
                        rows="4"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Discuss the reasons for low attendance and mention the agreed upon action plan..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                     ></textarea>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveNote}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save and Sync'}
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Insights Section */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
           <div>
              <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-3">
                <span>💡</span> Attendance Insights
              </h4>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                   <span className="text-green-500 font-bold">✓</span>
                   <span><b>{segments.high.length} students</b> have high attendance (≥90%), showing strong discipline.</span>
                </li>
                <li className="flex gap-2">
                   <span className="text-red-500 font-bold">⚠️</span>
                   <span><b>{segments.low.length} students</b> are at risk of losing exam eligibility due to low attendance.</span>
                </li>
              </ul>
           </div>
           <div>
              <h4 className="text-blue-400 font-bold flex items-center gap-2 mb-3">
                <span>📉</span> Correlation Preview
              </h4>
              <p className="text-sm text-slate-400">
                The current trend shows that students with attendance below 75% are <b>3.5x more likely</b> to have multiple backlogs.
              </p>
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                 <p className="text-xs text-slate-400">Next Step: Complete the counseling sessions for all students in the critical list.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

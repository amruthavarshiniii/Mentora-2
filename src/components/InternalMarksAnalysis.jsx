import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, BarChart, Bar, Cell } from 'recharts';

export default function InternalMarksAnalysis({ data }) {
  const segments = useMemo(() => {
    if (!data) return { high: [], avg: [], low: [] };
    const high = [], avg = [], low = [];
    data.forEach(d => {
      const marks = parseInt(d.Internal, 10);
      if (isNaN(marks)) return;
      if (marks >= 26) high.push(d);
      else if (marks >= 20) avg.push(d);
      else low.push(d);
    });
    return { high, avg, low };
  }, [data]);

  const chartData = useMemo(() => {
    return [
      { name: 'High (≥26)', count: segments.high.length, color: '#16a34a' },
      { name: 'Average (20-25)', count: segments.avg.length, color: '#eab308' }, // Yellow
      { name: 'Low (<20)', count: segments.low.length, color: '#ef4444' } // Red
    ];
  }, [segments]);

  const mismatches = useMemo(() => {
    if (!data) return [];
    // High internal (>26) but low CGPA (<7) -> Exam issue
    // Low internal (<18) but high CGPA (>8.5) -> Inconsistency
    const list = [];
    data.forEach(d => {
      const marks = parseInt(d.Internal, 10);
      const cgpa = parseFloat(d.CGPA);
      if (isNaN(marks) || isNaN(cgpa) || cgpa === 0) return;

      if (marks >= 26 && cgpa < 7.0) {
        list.push({ ...d, type: 'Potential Exam Anxiety', detail: 'High internals but low semester CGPA' });
      } else if (marks < 18 && cgpa > 8.5) {
        list.push({ ...d, type: 'Performance Slump', detail: 'High CGPA but declining internal scores' });
      }
    });
    return list;
  }, [data]);

  return (
    <div className="module-container space-y-6">
      <h2 className="module-title">Internal Marks & Consistency Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Internal Score Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 'dataMax + 5']} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mismatch Alerts */}
        <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl">
           <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
             <span>📉</span> Consistency Alerts
           </h3>
           <div className="space-y-4">
              {mismatches.length > 0 ? (
                mismatches.slice(0, 4).map(m => (
                  <div key={m['Roll No']} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-sm font-bold text-white">{m.Name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{m.type}</p>
                    <p className="text-xs text-slate-300 mt-1">{m.detail}. Internals: {m.Internal}/30</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No significant consistency mismatches detected in this batch.</p>
              )}
           </div>
           {mismatches.length > 4 && (
             <button className="w-full mt-4 text-[10px] uppercase font-bold text-blue-400 tracking-widest text-center">
               View All {mismatches.length} Alerts
             </button>
           )}
        </div>

        {/* Detailed List */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Detailed Score Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Internal (30)</th>
                  <th className="px-6 py-3">CGPA Correlation</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.slice(0, 8).map(s => {
                  const marks = parseInt(s.Internal, 10);
                  const isLow = marks < 20;
                  return (
                    <tr key={s['Roll No']} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{s.Name}</p>
                        <p className="text-xs text-slate-400">{s['Roll No']}</p>
                      </td>
                      <td className={`px-6 py-4 font-bold ${isLow ? 'text-red-500' : 'text-slate-700'}`}>
                        {s.Internal}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        CGPA: <span className="font-medium">{s.CGPA || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 font-bold hover:underline">Notify</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

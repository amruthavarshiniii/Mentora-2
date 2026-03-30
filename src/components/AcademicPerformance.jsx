import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function AcademicPerformance({ data }) {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return { avg: 0, high: 0, low: 0, passRate: 0 };
    
    const validCgpas = data.map(d => parseFloat(d.CGPA)).filter(c => !isNaN(c) && c > 0);
    if (validCgpas.length === 0) return { avg: 0, high: 0, low: 0, passRate: 0 };

    const avg = validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length;
    const high = Math.max(...validCgpas);
    const low = Math.min(...validCgpas);
    
    // Pass rate: CGPA >= 5.0 (assuming 5 is pass)
    const passCount = validCgpas.filter(c => c >= 5.0).length;
    const passRate = (passCount / data.length) * 100;
    
    return { 
      avg: avg.toFixed(2), 
      high: high.toFixed(2), 
      low: low.toFixed(2),
      passRate: passRate.toFixed(1)
    };
  }, [data]);

  const segments = useMemo(() => {
    if (!data) return { top: [], avg: [], low: [], missing: [] };
    
    const top = [], avgArr = [], low = [], missing = [];
    
    data.forEach(d => {
      const c = parseFloat(d.CGPA);
      if (isNaN(c) || c === 0) missing.push(d);
      else if (c >= 9.0) top.push(d);
      else if (c >= 7.0) avgArr.push(d);
      else low.push(d);
    });
    
    return { top, avg: avgArr, low, missing };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Top (≥9)', count: segments.top.length, color: '#16a34a' },
      { name: 'Average (7-9)', count: segments.avg.length, color: '#2563eb' },
      { name: 'Low (<7)', count: segments.low.length, color: '#ef4444' },
      { name: 'Missing (-)', count: segments.missing.length, color: '#94a3b8' }
    ];
  }, [segments]);

  const rankHolders = useMemo(() => {
    if (!data) return [];
    return [...data]
      .filter(d => parseFloat(d.CGPA) > 0)
      .sort((a, b) => parseFloat(b.CGPA) - parseFloat(a.CGPA))
      .slice(0, 5);
  }, [data]);

  return (
    <div className="module-container space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="module-title mb-0">Academic Performance Analysis</h2>
        <div className="flex gap-2">
           <span className="badge badge-success">{segments.top.length} Top</span>
           <span className="badge badge-primary">{segments.avg.length} Avg</span>
           <span className="badge badge-danger">{segments.low.length} Low</span>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card bg-white">
          <h3 className="metric-label text-slate-500">Average CGPA</h3>
          <p className="metric-value font-extrabold text-blue-600">{metrics.avg}</p>
        </div>
        <div className="metric-card bg-white">
          <h3 className="metric-label text-slate-500">Highest Score</h3>
          <p className="metric-value font-extrabold text-green-600">{metrics.high}</p>
        </div>
        <div className="metric-card bg-white">
          <h3 className="metric-label text-slate-500">Pass Percentage</h3>
          <p className="metric-value font-extrabold text-purple-600">{metrics.passRate}%</p>
        </div>
        <div className="metric-card bg-white">
          <h3 className="metric-label text-slate-500">Missing Evaluation</h3>
          <p className={`metric-value font-extrabold ${segments.missing.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
            {segments.missing.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CGPA Distribution Chart */}
        <div className="chart-card lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Student Distribution by Performance Tier</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 justify-center">
             {chartData.map(d => (
               <div key={d.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                 <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}}></div>
                 {d.name}
               </div>
             ))}
          </div>
        </div>

        {/* Rank Holders */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🏆</span>
            <h3 className="text-lg font-bold text-slate-800">Class Rank Holders</h3>
          </div>
          <div className="space-y-3">
            {rankHolders.map((student, idx) => (
              <div key={student['Roll No']} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-700 leading-tight">{student.Name}</p>
                    <p className="text-xs text-slate-500">{student['Roll No']}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">{student.CGPA}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

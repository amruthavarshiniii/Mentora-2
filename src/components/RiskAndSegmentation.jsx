import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function RiskAndSegmentation({ data }) {
  const segmentation = useMemo(() => {
    if (!data) return { excellent: [], moderate: [], critical: [] };
    
    const excellent = [], moderate = [], critical = [];
    
    data.forEach(d => {
      const cgpa = parseFloat(d.CGPA);
      const att = parseFloat(d['Attendance%']);
      const backlogs = parseInt(d.Backlogs, 10);
      
      if (isNaN(cgpa) || isNaN(att) || isNaN(backlogs)) return;
      
      // Excellent: CGPA >= 9, Att >= 90%, No backlogs
      if (cgpa >= 9.0 && att >= 90 && backlogs === 0) {
        excellent.push(d);
      } 
      // Critical: CGPA < 7 OR Attendance < 75 OR Backlogs > 0
      else if (cgpa < 7.0 || att < 75 || backlogs > 0) {
        critical.push(d);
      }
      // Moderate: Others (7-9 CGPA, 75-90% Att)
      else {
        moderate.push(d);
      }
    });
    
    return { excellent, moderate, critical };
  }, [data]);

  const pieData = [
    { name: 'Excellent', value: segmentation.excellent.length, color: '#16a34a' },
    { name: 'Moderate', value: segmentation.moderate.length, color: '#eab308' }, // Yellow
    { name: 'Critical', value: segmentation.critical.length, color: '#ef4444' }
  ];

  const atRiskList = useMemo(() => {
    if (!data) return [];
    return segmentation.critical.sort((a, b) => {
      // Sort by backlog count first, then by CGPA
      const bDiff = parseInt(b.Backlogs, 10) - parseInt(a.Backlogs, 10);
      if (bDiff !== 0) return bDiff;
      return parseFloat(a.CGPA) - parseFloat(b.CGPA);
    });
  }, [segmentation]);

  return (
    <div className="module-container space-y-6">
      <h2 className="module-title">Risk & Student Segmentation</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segmentation Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 self-start mb-2">Class Health Overview</h3>
          <p className="text-sm text-slate-500 self-start mb-6">Categorization based on CGPA, Attendance, and Backlogs.</p>
          
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full mt-6 pt-6 border-t border-slate-50">
             <div className="text-center">
                <p className="text-2xl font-extrabold text-green-600">{segmentation.excellent.length}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Excellent</p>
             </div>
             <div className="text-center border-x border-slate-100">
                <p className="text-2xl font-extrabold text-yellow-600">{segmentation.moderate.length}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Moderate</p>
             </div>
             <div className="text-center">
                <p className="text-2xl font-extrabold text-red-600">{segmentation.critical.length}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Critical</p>
             </div>
          </div>
        </div>

        {/* Predictive Insights */}
        <div className="flex flex-col gap-4">
           <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg flex-1">
              <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                <span>📈</span> Predictive Insights
              </h3>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <span className="text-lg">🎯</span>
                    <p className="text-sm text-slate-300">
                      <b>Topper Watch:</b> {segmentation.excellent.length > 0 ? segmentation.excellent[0].Name : 'N/A'} is showing high consistency and is likely to maintain top rank.
                    </p>
                 </div>
                 <div className="flex items-start gap-3">
                    <span className="text-lg">🚩</span>
                    <p className="text-sm text-slate-300">
                      <b>Failure Risk:</b> {segmentation.critical.length} students are at risk of semester failure due to multiple backlogs and low scores.
                    </p>
                 </div>
              </div>
           </div>
           
           <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex-1">
              <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                <span>📋</span> Actionable Decisions
              </h3>
              <ul className="space-y-2">
                 <li className="text-sm text-slate-600 flex gap-2">
                    <span className="text-blue-500">•</span> Enroll critical students in <b>Remedial Classes</b> starting next Monday.
                 </li>
                 <li className="text-sm text-slate-600 flex gap-2">
                    <span className="text-blue-500">•</span> Assign <b>Final Year Mentors</b> to the moderate group to push them to Excellent tier.
                 </li>
                 <li className="text-sm text-slate-600 flex gap-2">
                    <span className="text-blue-500">•</span> Conduct 1-on-1 parent meetings for students with <b>3+ backlogs</b>.
                 </li>
              </ul>
           </div>
        </div>

        {/* At-Risk Student Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Critical Intervention List (At-Risk)</h3>
              <button className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full">Report All Critical</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3 text-center">CGPA</th>
                    <th className="px-6 py-3 text-center">Att %</th>
                    <th className="px-6 py-3 text-center">Backlogs</th>
                    <th className="px-6 py-3 text-right">Primary Risk Factor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {atRiskList.map(s => {
                    const bl = parseInt(s.Backlogs, 10);
                    const risk = bl >= 3 ? 'Critical (Failure Risk)' : (bl > 0 ? 'Moderate (Backlogs)' : (parseFloat(s['Attendance%']) < 75 ? 'Low Attendance' : 'Low CGPA'));
                    
                    return (
                      <tr key={s['Roll No']} className={`hover:bg-slate-50 transition-colors ${bl >= 3 ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{s.Name}</p>
                          <p className="text-xs text-slate-500">{s['Roll No']}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`${parseFloat(s.CGPA) < 7 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>{s.CGPA || '-'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`${parseFloat(s['Attendance%']) < 75 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>{s['Attendance%']}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${bl > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                            {bl}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-xs font-bold ${bl >= 3 ? 'text-red-700' : 'text-slate-500'}`}>{risk}</span>
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

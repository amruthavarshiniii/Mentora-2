import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function AttendanceMonitoring({ data }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Group attendance into bins: 50-60, 60-70, 70-80, 80-90, 90-100
    const bins = {
      '50-60%': 0,
      '61-70%': 0,
      '71-80%': 0,
      '81-90%': 0,
      '91-100%': 0
    };

    data.forEach(d => {
      const att = parseFloat(d.Attendance_Percentage);
      if (isNaN(att) || att === 0) return;
      
      if (att <= 60) bins['50-60%']++;
      else if (att <= 70) bins['61-70%']++;
      else if (att <= 80) bins['71-80%']++;
      else if (att <= 90) bins['81-90%']++;
      else bins['91-100%']++;
    });

    return Object.keys(bins).map(key => ({
      range: key,
      count: bins[key]
    }));
  }, [data]);

  const belowThreshold = useMemo(() => {
    if (!data) return [];
    return data.filter(d => {
      const att = parseFloat(d.Attendance_Percentage);
      return !isNaN(att) && att > 0 && att < 75;
    }).sort((a,b) => parseFloat(a.Attendance_Percentage) - parseFloat(b.Attendance_Percentage));
  }, [data]);

  return (
    <div className="module-container">
      <h2 className="module-title">Attendance Monitoring Dashboard</h2>
      
      <div className="dashboard-grid">
        {/* Histogram */}
        <div className="chart-card span-full lg:span-2">
          <h3 className="card-header">Attendance Distribution (Histogram)</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  cursor={{fill: 'rgba(26, 86, 219, 0.05)'}}
                  contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}}
                />
                <Bar dataKey="count" name="Number of Students" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.range === '50-60%' || entry.range === '61-70%' ? '#ef4444' : '#1a56db'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Attendance Table */}
        <div className="table-card table-danger span-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-header mb-0 text-red-600">Action Required: Below 75% Attendance</h3>
            <span className="badge badge-danger">{belowThreshold.length} Students</span>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Reg No</th>
                  <th>Attendance %</th>
                  <th>Risk Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {belowThreshold.map(student => {
                  const att = parseFloat(student.Attendance_Percentage);
                  const isHighRisk = att <= 60;
                  
                  return (
                    <tr key={student.Reg_No} className={isHighRisk ? 'bg-red-50' : ''}>
                      <td className="font-medium">{student.Name}</td>
                      <td className="text-muted">{student.Reg_No}</td>
                      <td className={`font-bold ${isHighRisk ? 'text-red-600' : 'text-orange-500'}`}>
                        {student.Attendance_Percentage}%
                      </td>
                      <td>
                        {isHighRisk ? (
                          <span className="badge badge-danger">High Risk</span>
                        ) : (
                          <span className="badge badge-warning">Warning</span>
                        )}
                      </td>
                      <td>
                        <button className={`btn-sm ${isHighRisk ? 'btn-danger' : 'btn-outline'}`}>
                          Counseling
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

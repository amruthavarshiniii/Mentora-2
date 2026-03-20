import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AcademicPerformance({ data }) {
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return { avg: 0, high: 0, low: 0 };
    
    const validCgpas = data.map(d => parseFloat(d.CGPA)).filter(c => !isNaN(c) && c > 0);
    if (validCgpas.length === 0) return { avg: 0, high: 0, low: 0 };

    const avg = validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length;
    const high = Math.max(...validCgpas);
    const low = Math.min(...validCgpas);
    
    return { avg: avg.toFixed(2), high: high.toFixed(2), low: low.toFixed(2) };
  }, [data]);

  // Use raw data mapping for bar chart. Recharts likes arrays of objects.
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.filter(d => d.CGPA > 0).map(d => ({
      name: d.Name,
      cgpa: parseFloat(d.CGPA)
    })).sort((a,b) => b.cgpa - a.cgpa);
  }, [data]);

  const top10 = useMemo(() => {
    if (!data) return [];
    return [...data]
      .filter(d => d.CGPA > 0)
      .sort((a, b) => parseFloat(b.CGPA) - parseFloat(a.CGPA))
      .slice(0, 10);
  }, [data]);

  const below7 = useMemo(() => {
    if (!data) return [];
    return data.filter(d => {
      const c = parseFloat(d.CGPA);
      return !isNaN(c) && c > 0 && c < 7;
    }).sort((a, b) => parseFloat(a.CGPA) - parseFloat(b.CGPA));
  }, [data]);

  return (
    <div className="module-container">
      <h2 className="module-title">Academic Performance Dashboard</h2>
      
      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3 className="metric-label">Average CGPA</h3>
          <p className="metric-value text-blue-600">{metrics.avg}</p>
        </div>
        <div className="metric-card">
          <h3 className="metric-label">Highest CGPA</h3>
          <p className="metric-value text-green-600">{metrics.high}</p>
        </div>
        <div className="metric-card">
          <h3 className="metric-label">Lowest CGPA</h3>
          <p className="metric-value text-red-600">{metrics.low}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Chart */}
        <div className="chart-card span-full lg:span-2">
          <h3 className="card-header">CGPA Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={false} />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  cursor={{fill: 'rgba(26, 86, 219, 0.1)'}} 
                  contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}}
                />
                <Bar dataKey="cgpa" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cgpa < 7 ? '#ef4444' : '#1a56db'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Table */}
        <div className="table-card">
          <h3 className="card-header">Top 10 Performers</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((student, idx) => (
                  <tr key={student.Reg_No}>
                    <td>#{idx + 1}</td>
                    <td className="font-medium">{student.Name}</td>
                    <td className="text-muted">{student.Reg_No}</td>
                    <td className="text-green-600 font-medium">{student.CGPA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Performers Table */}
        <div className="table-card table-danger">
          <h3 className="card-header text-red-600">Action Required: Below 7 CGPA</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>CGPA</th>
                </tr>
              </thead>
              <tbody>
                {below7.length > 0 ? (
                  below7.map((student) => (
                    <tr key={student.Reg_No}>
                      <td className="font-medium text-red-700">{student.Name}</td>
                      <td className="text-muted">{student.Reg_No}</td>
                      <td className="text-red-600 font-bold">{student.CGPA}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4">No students below 7 CGPA</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

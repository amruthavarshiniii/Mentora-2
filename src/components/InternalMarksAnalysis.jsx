import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

export default function InternalMarksAnalysis({ data }) {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    return data
      .filter(d => d.CGPA > 0 && d.Internal_Marks > 0)
      .map(d => ({
        id: d.Reg_No,
        name: d.Name,
        cgpa: parseFloat(d.CGPA),
        marks: parseInt(d.Internal_Marks, 10),
        attendance: parseFloat(d.Attendance_Percentage)
      }));
  }, [data]);

  // Students with good attendance (>80%) but low marks (<15)
  const lowMarksHighAtt = useMemo(() => {
    return chartData
      .filter(d => d.attendance > 80 && d.marks < 15)
      .sort((a,b) => a.marks - b.marks);
  }, [chartData]);

  // Custom Tooltip for Scatter
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-bold text-slate-800 mb-1">{data.name}</p>
          <p className="text-sm text-slate-600">CGPA: <span className="font-medium text-slate-800">{data.cgpa}</span></p>
          <p className="text-sm text-slate-600">Internal Marks: <span className="font-medium text-slate-800">{data.marks}</span></p>
          <p className="text-sm text-slate-600">Attendance: <span className="font-medium text-slate-800">{data.attendance}%</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="module-container">
      <h2 className="module-title">Internal Marks Analysis</h2>

      <div className="dashboard-grid">
        {/* Scatter Plot */}
        <div className="chart-card span-full lg:span-2">
           <h3 className="card-header">Targeted Analysis: CGPA vs Internal Marks</h3>
           <p className="text-sm text-slate-500 mb-6 -mt-2">
             Identify students who might be struggling with understanding rather than attendance.
           </p>
           
           <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                
                <XAxis 
                  type="number" 
                  dataKey="cgpa" 
                  name="CGPA" 
                  domain={[4, 10]} 
                  label={{ value: "CGPA", position: "bottom", offset: 0 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="marks" 
                  name="Internal Marks" 
                  domain={[0, 30]} 
                  label={{ value: "Internal Marks (Out of 30)", angle: -90, position: "left", offset: 0 }} 
                />
                <ZAxis type="category" dataKey="name" name="Student" />
                <Tooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                
                <Scatter 
                  name="Students" 
                  data={chartData} 
                  fill="#1a56db" 
                  shape="circle"
                  opacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Table */}
        <div className="table-card span-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="card-header mb-1 text-orange-600">Core Understanding Risk</h3>
              <p className="text-sm text-slate-500 max-w-2xl text-left">
                Students with &gt;80% attendance but poor internal marks (&lt;15). 
                Requires subject-level intervention, possible tutoring, or concept checks.
              </p>
            </div>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Reg No</th>
                  <th>Attendance %</th>
                  <th>Internal Marks</th>
                  <th>Insight</th>
                </tr>
              </thead>
              <tbody>
                {lowMarksHighAtt.length > 0 ? (
                  lowMarksHighAtt.map(student => (
                    <tr key={student.id} className="bg-orange-50">
                      <td className="font-medium text-orange-900">{student.name}</td>
                      <td className="text-muted">{student.id}</td>
                      <td className="font-medium text-green-600">{student.attendance}%</td>
                      <td className="font-bold text-red-600">{student.marks}/30</td>
                      <td>
                        <span className="badge badge-warning">Needs subject tutoring</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-500">
                      No students found in this high-risk category.
                    </td>
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

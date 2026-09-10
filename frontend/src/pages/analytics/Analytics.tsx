import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { analyticsService } from '../../services/analyticsService';
import { ClassAttendanceStat } from '../../types/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Analytics: React.FC = () => {
  const [classStats, setClassStats] = useState<ClassAttendanceStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService.getClassStats()
      .then(data => {
        setClassStats(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Unable to load analytics.');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics & Insights" description="Deep dive into attendance data across classes and time periods." />
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm mt-2">Please ensure the backend server is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics & Insights" 
        description="Deep dive into attendance data across classes and time periods."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class-wise Attendance %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {classStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="className" axisLine={false} tickLine={false} dy={10} />
                    <YAxis axisLine={false} tickLine={false} dx={-10} domain={[0, 100]} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="attendancePercentage" radius={[4, 4, 0, 0]}>
                      {classStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.attendancePercentage >= 95 ? '#22c55e' : entry.attendancePercentage >= 90 ? '#3b82f6' : '#eab308'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>No class attendance data available yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Placeholder for more charts */}
        <Card className="flex flex-col items-center justify-center text-center p-12 text-gray-500 bg-gray-50">
          <p className="font-medium text-lg text-gray-700">More analytics coming soon</p>
          <p className="text-sm mt-2">Student trends, early departures, and anomalies detection.</p>
        </Card>
      </div>
    </div>
  );
};

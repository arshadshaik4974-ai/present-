import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, ScanFace, Activity, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { analyticsService } from '../../services/analyticsService';
import { aiService } from '../../services/aiService';
import { DashboardAnalytics } from '../../types/analytics';
import { AIStatus } from '../../types/ai';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, aiData] = await Promise.allSettled([
          analyticsService.getDashboard(),
          aiService.getStatus(),
        ]);

        if (dashData.status === 'fulfilled') {
          setDashboard(dashData.value);
        } else {
          setError('Unable to load dashboard analytics.');
        }

        if (aiData.status === 'fulfilled') {
          setAiStatus(aiData.value);
        }
      } catch {
        setError('Unable to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertTriangle className="h-12 w-12 mb-4 text-amber-500" />
        <p className="text-lg font-medium">{error}</p>
        <p className="text-sm mt-2">Please ensure the backend server is running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={String(dashboard?.totalStudents ?? 0)} icon={Users} color="info" />
        <StatCard title="Present Today" value={String(dashboard?.presentToday ?? 0)} icon={UserCheck} color="success" />
        <StatCard title="Absent Today" value={String(dashboard?.absentToday ?? 0)} icon={UserX} color="danger" />
        <StatCard
          title="AI Engine"
          value={aiStatus?.status === 'running' ? 'Active' : aiStatus?.status ?? 'Offline'}
          icon={ScanFace}
          color="primary"
        />
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {dashboard?.trend && dashboard.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboard.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(label) => new Date(String(label)).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      />
                      <Area type="monotone" dataKey="present" stroke="#aa3bff" fillOpacity={1} fill="url(#colorPresent)" />
                      <Area type="monotone" dataKey="absent" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" />
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#aa3bff" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#aa3bff" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No attendance data available yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-500" />
                AI System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      aiStatus?.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">AI Engine</span>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded shadow-sm ${
                    aiStatus?.status === 'running'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {aiStatus?.status ?? 'unknown'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 px-3">
                  {aiStatus?.message ?? 'Unable to retrieve AI status.'}
                </p>
                <div className="px-3 pt-2">
                  <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                    Camera feeds and live detections will be available once the AI engine is implemented in the next phase.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

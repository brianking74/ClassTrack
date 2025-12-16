import React from 'react';
import { Users, CreditCard, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import { Attendee, PaymentStatus } from '../types';
import StatsCard from './StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  attendees: Attendee[];
  aiInsights: string | null;
  onGenerateInsights: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ attendees, aiInsights, onGenerateInsights }) => {
  const totalAttendees = attendees.length;
  const pendingPayments = attendees.filter(a => a.paymentStatus === PaymentStatus.PENDING).length;
  const overduePayments = attendees.filter(a => a.paymentStatus === PaymentStatus.OVERDUE).length;
  const lowSessions = attendees.filter(a => a.sessionsRemaining <= 2 && a.totalSessions > 0).length;
  const totalRevenuePotential = attendees.length * 150; // Mock value per head

  // Chart Data Preparation
  const classDistribution = attendees.reduce((acc: Record<string, number>, curr) => {
    acc[curr.classType] = (acc[curr.classType] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(classDistribution).map(key => ({
    name: key,
    count: classDistribution[key]
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your classes today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Attendees" 
          value={totalAttendees} 
          icon={Users} 
          trend="12%" 
          trendUp={true} 
          colorClass="text-indigo-600 bg-indigo-600" 
        />
        <StatsCard 
          title="Payments Pending" 
          value={pendingPayments} 
          icon={CreditCard} 
          trend="4%" 
          trendUp={false} 
          colorClass="text-amber-500 bg-amber-500" 
        />
        <StatsCard 
          title="Low Sessions" 
          value={lowSessions} 
          icon={AlertCircle} 
          colorClass="text-red-500 bg-red-500" 
        />
        <StatsCard 
          title="Est. Revenue" 
          value={`$${totalRevenuePotential}`} 
          icon={TrendingUp} 
          trend="8%" 
          trendUp={true} 
          colorClass="text-green-500 bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Class Distribution</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-xl shadow-lg text-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg">✨</span>
              </div>
              <h2 className="font-semibold">Gemini Insights</h2>
            </div>
          </div>
          
          <div className="flex-1 bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10 text-sm leading-relaxed text-slate-200 overflow-y-auto">
            {aiInsights ? (
              <div className="whitespace-pre-wrap">{aiInsights}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <p className="mb-2">Generate AI-powered insights about your attendance and revenue.</p>
              </div>
            )}
          </div>

          <button 
            onClick={onGenerateInsights}
            className="mt-4 w-full py-2 bg-white text-indigo-900 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"
          >
            <TrendingUp size={16} />
            <span>Analyze Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

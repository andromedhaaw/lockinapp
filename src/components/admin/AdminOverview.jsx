import { Users, DollarSign, Activity, Clock, TrendingUp, BarChart2 } from 'lucide-react';
import { Card } from '../ui';
import { formatDurationHours } from '../../utils/timeUtils';

export const AdminOverview = () => {
  // Mock Stats
  const stats = [
    { label: 'Total Users', value: '1,248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Monthly Revenue', value: '$8,450', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Active Sessions', value: '42', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Total Hours Tracked', value: '154,320', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  const recentActivity = [
    { user: 'Alice M.', action: 'Completed a 2h deep work session', time: '2 mins ago' },
    { user: 'Bob K.', action: 'Joined "Early Birds" Pod', time: '15 mins ago' },
    { user: 'Charlie D.', action: 'Achieved "Week Streak" Badge', time: '42 mins ago' },
    { user: 'Diana P.', action: 'Started a Focus Session', time: '1 hour ago' },
    { user: 'Evan R.', action: 'Upgraded to Pro', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="flex items-center gap-4 p-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area (Mock) */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5" /> Revenue & Usage Growth
              </h3>
              <select className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last Year</option>
              </select>
            </div>
            
            {/* Mock Chart Visual */}
            <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-8">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((h, i) => (
                <div key={i} className="w-full bg-green-100 dark:bg-green-900/20 rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-green-500 dark:bg-green-400 rounded-t-lg transition-all duration-500 group-hover:bg-green-600"
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded pointer-events-none">
                    {h * 10} Users
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-400 uppercase font-mono">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Live Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      <span className="font-bold">{item.user}</span> {item.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-green-600 font-medium hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg transition-colors">
              View All Activity
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

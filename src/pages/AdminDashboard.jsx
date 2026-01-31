import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Layers,
  Search,
  User
} from 'lucide-react';
import { AdminOverview, UserManagement, ContentManagement } from '../components/admin';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content CMS', icon: Layers },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <UserManagement />;
      case 'content': return <ContentManagement />;
      case 'settings': return <div className="p-12 text-center text-gray-500">System settings coming soon...</div>;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex font-sans text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Admin</h1>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 text-gray-400">
            <Search className="w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="bg-transparent border-none focus:outline-none text-sm w-64 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <div className="text-xs font-bold text-gray-900 dark:text-white">Admin User</div>
               <div className="text-[10px] text-gray-400">Super Admin</div>
             </div>
             <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
               <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
             {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

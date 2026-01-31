import { Moon, Bell } from 'lucide-react';

const ProfileSettings = ({ grindMode, setGrindMode, darkMode, setDarkMode }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4">
      <h3 className="font-bold text-gray-800 dark:text-white text-lg">Detailed Settings</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${grindMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-gray-800 dark:text-white">Deep Work Mode</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Hide Goals, Insights, Social & distractions</div>
          </div>
        </div>
        
        <button 
          onClick={() => setGrindMode(!grindMode)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            grindMode ? 'bg-green-500' : 'bg-gray-200'
          }`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            grindMode ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-orange-100 text-orange-500'}`}>
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-gray-800 dark:text-white">Theme</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Toggle light/dark mode</div>
          </div>
        </div>
        
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            darkMode ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
           <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            darkMode ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>



      <div className="text-xs text-gray-400 pt-2 border-t border-gray-50">
        When enabled, we hide Goals, Insights, and Social tabs. No notifications, no distractions. Just you and the work.
      </div>
    </div>
  );
};

export default ProfileSettings;

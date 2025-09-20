import { Link, useLocation } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Bike,
  User,
  Shield
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Bike Registry', href: '/bikes', icon: Bike },
    { name: 'Theft Tracking', href: '/theft-tracking', icon: Shield },
    { name: 'Emergency Contacts', href: '/contacts', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CycleGuard</h1>
            <p className="text-xs text-slate-400">Safety Dashboard</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.google_user_data.given_name?.[0] || user.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {user.google_user_data.name || user.email}
              </p>
              <p className="text-slate-400 text-xs">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-6 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

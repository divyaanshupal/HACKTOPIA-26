import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  LayoutDashboard,
  Inbox,
  Search,
  PlusCircle,
  ClipboardList,
  ArrowRightLeft,
  Users,
  LogOut,
  ChevronLeft,
  UserIcon,
  BarChart3,
  FolderOpen
} from 'lucide-react';

const adminNavItems = [
  { path: '/adminDashboard/inbox', label: 'Inbox', icon: Inbox },
  { path: '/adminDashboard/digitalDesk', label: 'Digital Desk', icon: FolderOpen },
  { path: '/adminDashboard/trackFiles', label: 'Track a file', icon: Search },
  { path: '/adminDashboard/createUser', label: 'Create / Add', icon: PlusCircle },
  { path: '/adminDashboard/logDesk', label: 'Log / Record', icon: ClipboardList },
  { path: '/adminDashboard/handleTransfer', label: 'Handle Transfer', icon: ArrowRightLeft },
  { path: '/adminDashboard/userManagement', label: 'User Management', icon: Users },
  { path: '/adminDashboard/analytics', label: 'Analytics', icon: BarChart3 },
];

const userNavItems = [
  { path: '/userDashboard/DigitalDesk', label: 'Digital Desk', icon: FolderOpen },
  { path: '/userDashboard/logDesk', label: 'Log / Record', icon: ClipboardList },
  { path: '/userDashboard/analytics', label: 'My Analytics', icon: BarChart3 },
];

export default function Sidebar({ isAdmin = false }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    try {
      await api.get('/users/logout');
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      setUser(null);
      navigate('/');
    }
  };

  return (
    <aside
      className={`
        sticky top-0
        h-screen 
        ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}
        bg-white/80 border-r border-slate-100 
        backdrop-blur-sm
        flex flex-col font-sans 
        transition-all duration-300 ease-in-out rounded-2xl
      `}
    >

      {/* --- TOP HEADER --- */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isCollapsed && (
            <img
              src="/assets/img/iiitbh-logo.png"
              alt="IIIT Logo"
              className="h-12 w-12"
            />
          )}

          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-md font-bold text-slate-800 leading-tight">
                IIIT Bhagalpur
              </h1>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 flex items-center justify-center rounded-lg 
            bg-slate-50 text-slate-400 
            hover:bg-slate-100 hover:text-slate-600 
            transition-all"
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''
              }`}
          />
        </button>
      </div>

      {/* --- NAVIGATION --- */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        {!isCollapsed && (
          <div className="mb-2 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>
        )}

        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    group relative flex items-center 
                    ${isCollapsed ? 'justify-center' : 'gap-3 px-4'}
                    py-3 rounded-xl text-sm font-medium 
                    transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors ${isActive
                      ? 'text-blue-600'
                      : 'text-slate-500 group-hover:text-slate-600'
                      }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* --- BOTTOM PROFILE CARD --- */}
      {!isCollapsed && (
        <div className="p-5">
          <div className="relative mt-8 rounded-[24px] bg-[#EAF5FF] p-5 pb-6 transition-transform hover:scale-[1.02]">

            <div className="absolute -top-6 left-5 h-12 w-12 rounded-2xl bg-white p-1 shadow-sm ring-4 ring-white">
              <div className="h-full w-full rounded-xl bg-slate-400 flex items-center justify-center text-white font-bold text-lg">
                <UserIcon size={24} />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Current User
              </p>
              <h3 className="text-sm font-bold text-slate-800 truncate pr-10">
                {user?.name || 'Admin User'}
              </h3>
            </div>

            <button
              onClick={handleLogout}
              className="absolute bottom-4 right-4 h-10 w-10 
                flex items-center justify-center rounded-xl 
                bg-white text-slate-400 
                shadow-[0_2px_10px_rgba(0,0,0,0.03)] 
                hover:text-red-500 hover:shadow-md transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

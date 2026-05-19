"use client";

import { useAuth } from '@/context/AuthContext';
import { LogOut, Target, LayoutDashboard, CheckSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null; // Will be redirected by AuthContext

  const navItems = {
    employee: [
      { name: 'My Goals', href: '/employee', icon: Target },
      { name: 'Achievements', href: '/employee/achievements', icon: CheckSquare },
    ],
    manager: [
      { name: 'Team Dashboard', href: '/manager', icon: LayoutDashboard },
      { name: 'Approvals', href: '/manager/approvals', icon: Target },
      { name: 'Check-ins', href: '/manager/checkins', icon: CheckSquare },
    ],
    admin: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard },
      { name: 'System Settings', href: '/admin/settings', icon: Settings },
    ]
  };

  const links = navItems[user.role] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      
      {/* Sidebar */}
      <div className="w-64 glass-card m-4 rounded-xl flex flex-col h-[calc(100vh-2rem)] shadow-lg shadow-black/20">
        
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Atmoquest</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-400 font-medium' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user.name}</span>
              <span className="text-xs text-slate-400 capitalize">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pl-0">
        <div className="h-full w-full rounded-xl p-8">
          {children}
        </div>
      </main>

    </div>
  );
}

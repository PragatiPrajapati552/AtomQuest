"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Target, LayoutDashboard, CheckSquare, Settings, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass-card m-4 rounded-xl flex flex-col h-[calc(100vh-2rem)] shadow-lg shadow-black/20 transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
        
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
                onClick={() => setIsMobileMenuOpen(false)}
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
      <main className="flex-1 overflow-y-auto w-full">
        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Atmoquest</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-white/5 rounded-lg text-slate-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="h-full w-full rounded-xl p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}

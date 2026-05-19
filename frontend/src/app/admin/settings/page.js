"use client";

import DashboardLayout from '@/components/DashboardLayout';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-slate-400 mt-1">Configure global application parameters</p>
        </div>
      </div>
      <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
        <Settings className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-xl font-medium mb-2 text-white">Settings Page Coming Soon</h3>
        <p className="text-slate-400 max-w-md">
          This module is scheduled for development in a future sprint.
        </p>
      </div>
    </DashboardLayout>
  );
}

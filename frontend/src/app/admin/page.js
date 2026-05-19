"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Users, FileDown, ShieldAlert, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  const exportCSV = async () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,Employee,Email,Role,Manager,Goal Sheet Status,Total Goals,Total Weightage\n";
      
      users.forEach(u => {
        const status = u.goalSheet ? u.goalSheet.status : 'Not Submitted';
        const goalsCount = u.goalSheet?.goals?.length || 0;
        const totalWeight = u.goalSheet?.goals?.reduce((sum, g) => sum + g.weightage, 0) || 0;
        const managerName = u.managerId ? u.managerId.name : 'N/A';
        
        csvContent += `${u.name},${u.email},${u.role},${managerName},${status},${goalsCount},${totalWeight}%\n`;
      });
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "goal_achievement_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  if (loading) {
    return <DashboardLayout><div className="text-slate-400">Loading admin dashboard...</div></DashboardLayout>;
  }

  const employeeCount = users.filter(u => u.role === 'employee').length;
  const managerCount = users.filter(u => u.role === 'manager').length;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Console</h1>
          <p className="text-slate-400 mt-1">System overview and governance</p>
        </div>
        <button onClick={exportCSV} className="btn-primary flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600">
          <FileDown className="w-5 h-5" />
          Export Global Report (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-white">{employeeCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500/50" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Managers</p>
              <p className="text-3xl font-bold text-white">{managerCount}</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-purple-500/50" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Active Cycle</p>
              <p className="text-xl font-bold text-white mt-1">FY 2026-2027</p>
            </div>
            <BarChart3 className="w-8 h-8 text-emerald-500/50" />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">System Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-300 text-sm">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{user.name}</td>
                  <td className="p-4 text-slate-400">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                      user.role === 'manager' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {user.managerId ? user.managerId.name : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

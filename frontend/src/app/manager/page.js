"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboard() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get('/users/team');
        setTeam(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return <DashboardLayout><div className="text-slate-400">Loading team...</div></DashboardLayout>;
  }

  const pendingApprovals = team.filter(member => member.goalSheet?.status === 'Submitted').length;
  const approvedGoals = team.filter(member => member.goalSheet?.status === 'Approved').length;
  const noGoals = team.filter(member => !member.goalSheet || member.goalSheet.status === 'Draft').length;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Team Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your team's goal progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Pending Approvals</p>
              <p className="text-3xl font-bold text-white">{pendingApprovals}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500/50" />
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Approved</p>
              <p className="text-3xl font-bold text-white">{approvedGoals}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-400 mb-1">Action Required</p>
              <p className="text-3xl font-bold text-white">{noGoals}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500/50" />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" /> Team Members
          </h2>
          {pendingApprovals > 0 && (
            <Link href="/manager/approvals" className="text-blue-400 text-sm hover:underline">
              Review Approvals →
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-300 text-sm">
                <th className="p-4 font-medium">Employee Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Goal Sheet Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {team.map((member) => (
                <tr key={member._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{member.name}</td>
                  <td className="p-4 text-slate-400">{member.email}</td>
                  <td className="p-4">
                    {!member.goalSheet || member.goalSheet.status === 'Draft' ? (
                      <span className="text-slate-400 bg-slate-400/10 px-2 py-1 rounded-full text-xs font-medium">Not Submitted</span>
                    ) : member.goalSheet.status === 'Submitted' ? (
                      <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full text-xs font-medium">Pending Approval</span>
                    ) : member.goalSheet.status === 'Approved' ? (
                      <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full text-xs font-medium">Approved</span>
                    ) : (
                      <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded-full text-xs font-medium">Returned</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {member.goalSheet?.status === 'Submitted' ? (
                      <Link href={`/manager/approvals`} className="text-blue-400 hover:text-blue-300 text-sm">Review</Link>
                    ) : member.goalSheet?.status === 'Approved' ? (
                      <Link href={`/manager/checkins`} className="text-emerald-400 hover:text-emerald-300 text-sm">Check-in</Link>
                    ) : (
                      <span className="text-slate-500 text-sm">Wait</span>
                    )}
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

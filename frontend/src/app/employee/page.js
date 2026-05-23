"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import GoalSettingForm from '@/components/GoalSettingForm';
import api from '@/lib/api';
import { Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const [goalSheet, setGoalSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchGoalSheet = async () => {
    try {
      const res = await api.get('/goalsheets');
      setGoalSheet(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setGoalSheet(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalSheet();
  }, []);

  if (loading) {
    return <DashboardLayout><div className="text-slate-400">Loading your goals...</div></DashboardLayout>;
  }

  // If user is actively creating/editing a draft
  if (isCreating || (goalSheet && goalSheet.status === 'Draft')) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Draft Your Goals</h1>
          <p className="text-slate-400 mt-1">Ensure total weightage equals 100%.</p>
        </div>
        <GoalSettingForm 
          existingGoals={goalSheet?.goals || []} 
          onSuccess={() => {
            setIsCreating(false);
            fetchGoalSheet();
          }} 
        />
      </DashboardLayout>
    );
  }

  // If no goal sheet exists at all
  if (!goalSheet) {
    return (
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Goals</h1>
            <p className="text-slate-400 mt-1">Manage your objectives for FY 2026-2027</p>
          </div>
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            + Create Goal Sheet
          </button>
        </div>

        <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-white">No Goals Created Yet</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            You haven't submitted your goal sheet for this cycle. The goal setting window is open.
          </p>
          <button onClick={() => setIsCreating(true)} className="btn-primary px-8">
            Start Goal Setting
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Goal sheet exists (Submitted, Approved, or Returned)
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'Approved':
        return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle2 className="w-4 h-4"/> Approved</span>;
      case 'Submitted':
        return <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-sm font-medium"><Clock className="w-4 h-4"/> Pending Approval</span>;
      case 'Returned':
        return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-sm font-medium"><AlertCircle className="w-4 h-4"/> Returned for Rework</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Goals</h1>
          <p className="text-slate-400 mt-1">FY 2026-2027 Goal Sheet</p>
        </div>
        <StatusBadge status={goalSheet.status} />
      </div>

      {goalSheet.status === 'Returned' && (
        <div className="mb-6 p-4 glass-card border border-red-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-red-400 font-medium">Your manager returned this sheet for rework.</h3>
            <p className="text-sm text-slate-400 mt-1">Please review and adjust your goals, then resubmit.</p>
          </div>
          <button onClick={() => setIsCreating(true)} className="btn-primary bg-red-500 hover:bg-red-600">
            Edit & Resubmit
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400 mb-1">Total Goals</p>
          <p className="text-2xl font-bold text-white">{goalSheet.goals?.length || 0}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400 mb-1">Total Weightage</p>
          <p className="text-2xl font-bold text-blue-400">100%</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-slate-400 mb-1">Submitted On</p>
          <p className="text-lg font-medium text-white">
            {new Date(goalSheet.submittedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {goalSheet.goals?.map((goal, index) => (
          <div key={goal._id} className="glass-card p-6 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-1 block">
                  {goal.thrustArea}
                </span>
                <h3 className="text-xl font-medium text-white">{goal.title}</h3>
              </div>
              <div className="bg-slate-800 px-4 py-2 rounded-lg text-center min-w-[80px]">
                <span className="block text-xs text-slate-400 mb-1">Weight</span>
                <span className="font-bold text-white">{goal.weightage}%</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">{goal.description}</p>
            <div className="flex flex-wrap gap-4 sm:gap-6 bg-slate-800/50 p-4 rounded-lg inline-flex">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Target</span>
                <span className="font-medium text-white">{goal.target} {goal.uom === '%' ? '%' : ''}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">UoM</span>
                <span className="font-medium text-white">{goal.uom}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

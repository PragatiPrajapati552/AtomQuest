"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function AchievementsPage() {
  const [goalSheet, setGoalSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeQuarter, setActiveQuarter] = useState('q1'); // Normally determined by server date based on BRD schedule

  const fetchGoalSheet = async () => {
    try {
      const res = await api.get('/goalsheets');
      setGoalSheet(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoalSheet();
  }, []);

  const handleUpdate = async (goalId, field, value) => {
    const updatedSheet = { ...goalSheet };
    const goalIndex = updatedSheet.goals.findIndex(g => g._id === goalId);
    if (!updatedSheet.goals[goalIndex][activeQuarter]) {
      updatedSheet.goals[goalIndex][activeQuarter] = { status: 'Not Started', actual: '' };
    }
    updatedSheet.goals[goalIndex][activeQuarter][field] = value;
    setGoalSheet(updatedSheet);
  };

  const saveAchievements = async (goalId) => {
    const goal = goalSheet.goals.find(g => g._id === goalId);
    const data = {
      quarter: activeQuarter,
      actual: goal[activeQuarter]?.actual || 0,
      status: goal[activeQuarter]?.status || 'Not Started'
    };

    setSaving(true);
    try {
      await api.put(`/goals/${goalId}/achievement`, data);
      alert('Achievement updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div className="text-slate-400">Loading achievements...</div></DashboardLayout>;
  }

  if (!goalSheet || !goalSheet.isLocked) {
    return (
      <DashboardLayout>
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-medium mb-2 text-white">Goals Not Approved Yet</h3>
          <p className="text-slate-400 max-w-md">
            You can only log achievements after your manager has approved and locked your goal sheet.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const quarters = [
    { id: 'q1', name: 'Q1 (Jul)' },
    { id: 'q2', name: 'Q2 (Oct)' },
    { id: 'q3', name: 'Q3 (Jan)' },
    { id: 'q4', name: 'Q4 (Mar)' }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Quarterly Achievements</h1>
          <p className="text-slate-400 mt-1">Log your progress and actuals</p>
        </div>
        
        {/* Quarter Selector */}
        <div className="flex bg-slate-800/50 p-1 rounded-lg">
          {quarters.map(q => (
            <button
              key={q.id}
              onClick={() => setActiveQuarter(q.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeQuarter === q.id 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {q.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {goalSheet.goals.map((goal) => (
          <div key={goal._id} className="glass-card p-6 border-l-4 border-l-emerald-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Goal Info */}
              <div className="lg:col-span-5">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-1 block">
                  {goal.thrustArea}
                </span>
                <h3 className="text-lg font-medium text-white mb-2">{goal.title}</h3>
                <div className="flex gap-4 text-sm text-slate-400">
                  <span>Target: <strong className="text-white">{goal.target} {goal.uom === '%' ? '%' : ''}</strong></span>
                  <span>Weight: <strong className="text-white">{goal.weightage}%</strong></span>
                </div>
              </div>

              {/* Achievement Input */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs text-slate-400">Actual Achievement</label>
                  <input 
                    type="number"
                    value={goal[activeQuarter]?.actual || ''}
                    onChange={(e) => handleUpdate(goal._id, 'actual', e.target.value)}
                    className="glass-input"
                    placeholder="Enter actual value..."
                  />
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs text-slate-400">Status</label>
                  <select 
                    value={goal[activeQuarter]?.status || 'Not Started'}
                    onChange={(e) => handleUpdate(goal._id, 'status', e.target.value)}
                    className="glass-input"
                  >
                    <option className="bg-slate-800" value="Not Started">Not Started</option>
                    <option className="bg-slate-800" value="On Track">On Track</option>
                    <option className="bg-slate-800" value="Completed">Completed</option>
                  </select>
                </div>
                <button 
                  onClick={() => saveAchievements(goal._id)}
                  disabled={saving}
                  className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap px-6 py-[10px]"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

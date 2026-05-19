"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { MessageSquare, Save } from 'lucide-react';

export default function CheckInsPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [activeQuarter, setActiveQuarter] = useState('q1');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/users/team');
      // Only show approved sheets for check-ins
      const approved = res.data.data.filter(m => m.goalSheet?.status === 'Approved');
      setTeam(approved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSelectSheet = (sheet) => {
    setSelectedSheet(sheet);
    setComments('');
  };

  const handleSaveCheckIn = async () => {
    if (!comments.trim()) {
      alert('Please provide structured comments before saving.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/checkins', {
        goalSheetId: selectedSheet._id,
        quarter: activeQuarter,
        comments
      });
      alert('Check-in logged successfully!');
      setComments('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save check-in');
    } finally {
      setSaving(false);
    }
  };

  const quarters = [
    { id: 'q1', name: 'Q1 Check-in' },
    { id: 'q2', name: 'Q2 Check-in' },
    { id: 'q3', name: 'Q3 Check-in' },
    { id: 'q4', name: 'Q4 Check-in' }
  ];

  if (loading) {
    return <DashboardLayout><div className="text-slate-400">Loading team...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Quarterly Check-ins</h1>
        <p className="text-slate-400 mt-1">Review team progress and provide structured feedback</p>
      </div>

      {!selectedSheet ? (
        <div className="space-y-4">
          {team.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-400">
              No approved goal sheets available for check-ins yet.
            </div>
          ) : (
            team.map((member) => (
              <div key={member._id} className="glass-card p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white">{member.name}</h3>
                  <p className="text-sm text-slate-400">Goals: {member.goalSheet.goals.length}</p>
                </div>
                <button 
                  onClick={() => handleSelectSheet(member.goalSheet)}
                  className="btn-primary"
                >
                  Conduct Check-in
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedSheet(null)}
            className="text-blue-400 text-sm hover:underline mb-2"
          >
            ← Back to list
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Check-in Session</h2>
              <p className="text-sm text-slate-400">Reviewing progress for selected quarter.</p>
            </div>
            
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Goal Progress List */}
            <div className="xl:col-span-2 space-y-4">
              <h3 className="font-medium text-white mb-4">Goal Progress vs Target</h3>
              {selectedSheet.goals.map(goal => (
                <div key={goal._id} className="glass-card p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-white">{goal.title}</h4>
                      <p className="text-sm text-slate-400">{goal.thrustArea}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      goal[activeQuarter]?.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      goal[activeQuarter]?.status === 'On Track' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {goal[activeQuarter]?.status || 'Not Started'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-3 rounded-lg">
                    <div>
                      <span className="block text-xs text-slate-500">Planned Target</span>
                      <span className="font-medium text-white">{goal.target} {goal.uom === '%' ? '%' : ''}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Actual Achievement</span>
                      <span className="font-medium text-blue-400">{goal[activeQuarter]?.actual || 'No data'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Check-in Form */}
            <div className="space-y-4">
              <h3 className="font-medium text-white mb-4">Structured Feedback</h3>
              <div className="glass-card p-5 border-t-4 border-t-purple-500">
                <div className="flex items-center gap-2 mb-4 text-purple-400">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Manager Comments</span>
                </div>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="glass-input h-48 resize-none mb-4"
                  placeholder="Document the check-in discussion, performance feedback, and next steps..."
                />
                <button 
                  onClick={handleSaveCheckIn}
                  disabled={saving}
                  className="w-full btn-primary flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600"
                >
                  <Save className="w-4 h-4" />
                  Save Check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

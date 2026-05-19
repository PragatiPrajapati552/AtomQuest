"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Target, CheckCircle, XCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [inlineEdits, setInlineEdits] = useState([]); // [{ goalId, target, weightage }]
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/users/team');
      const submitted = res.data.data.filter(m => m.goalSheet?.status === 'Submitted');
      setTeam(submitted);
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
    setInlineEdits(
      sheet.goals.map(g => ({ goalId: g._id, target: g.target, weightage: g.weightage }))
    );
  };

  const updateEdit = (goalId, field, value) => {
    const edits = [...inlineEdits];
    const index = edits.findIndex(e => e.goalId === goalId);
    edits[index][field] = value;
    setInlineEdits(edits);
  };

  const handleAction = async (status) => {
    const totalWeight = inlineEdits.reduce((sum, e) => sum + Number(e.weightage), 0);
    if (status === 'Approved' && totalWeight !== 100) {
      alert('Total weightage must be exactly 100% before approving.');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/goalsheets/${selectedSheet._id}/approve`, {
        status,
        inlineEdits
      });
      alert(`Goal sheet successfully ${status.toLowerCase()}!`);
      setSelectedSheet(null);
      fetchTeam();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update sheet');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div className="text-slate-400">Loading pending approvals...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Goal Approvals</h1>
        <p className="text-slate-400 mt-1">Review, edit, and approve team member goals</p>
      </div>

      {!selectedSheet ? (
        <div className="space-y-4">
          {team.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-400">
              No pending approvals at the moment.
            </div>
          ) : (
            team.map((member) => (
              <div key={member._id} className="glass-card p-6 flex justify-between items-center hover:border-blue-500/50 transition-colors border border-transparent">
                <div>
                  <h3 className="text-lg font-medium text-white">{member.name}</h3>
                  <p className="text-sm text-slate-400">Submitted: {new Date(member.goalSheet.submittedAt).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => handleSelectSheet(member.goalSheet)}
                  className="btn-primary"
                >
                  Review Goals
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
          
          <div className="glass-card p-6 sticky top-4 z-20 flex justify-between items-center border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold text-white">Reviewing Goal Sheet</h2>
              <p className="text-slate-400 text-sm">You can edit target values and weightages inline.</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-2xl font-bold ${
                inlineEdits.reduce((s, e) => s + Number(e.weightage), 0) === 100 
                  ? 'text-emerald-400' 
                  : 'text-red-400'
              }`}>
                {inlineEdits.reduce((s, e) => s + Number(e.weightage), 0)}%
              </span>
              <span className="text-xs text-slate-500">Total Weightage</span>
            </div>
          </div>

          <div className="space-y-4">
            {selectedSheet.goals.map((goal, i) => {
              const edit = inlineEdits.find(e => e.goalId === goal._id);
              return (
                <div key={goal._id} className="glass-card p-6 border-l-4 border-l-blue-500">
                  <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-1 block">
                    {goal.thrustArea}
                  </span>
                  <h3 className="text-xl font-medium text-white mb-2">{goal.title}</h3>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">{goal.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/50 p-4 rounded-lg items-end">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">UoM</span>
                      <span className="font-medium text-white">{goal.uom}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Target</span>
                      <input 
                        type="text"
                        value={edit?.target || ''}
                        onChange={(e) => updateEdit(goal._id, 'target', e.target.value)}
                        className="glass-input py-1 px-2"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Weightage (%)</span>
                      <input 
                        type="number"
                        min="10" max="100"
                        value={edit?.weightage || ''}
                        onChange={(e) => updateEdit(goal._id, 'weightage', parseInt(e.target.value))}
                        className="glass-input py-1 px-2"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <button 
              onClick={() => handleAction('Returned')}
              disabled={actionLoading}
              className="px-6 py-2 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" /> Return to Employee
            </button>
            <button 
              onClick={() => handleAction('Approved')}
              disabled={actionLoading || inlineEdits.reduce((s, e) => s + Number(e.weightage), 0) !== 100}
              className="px-6 py-2 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" /> Approve & Lock
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

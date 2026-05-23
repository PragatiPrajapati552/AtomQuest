"use client";

import { useState } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle, Save } from 'lucide-react';
import api from '@/lib/api';

export default function GoalSettingForm({ existingGoals = [], onSuccess }) {
  const [goals, setGoals] = useState(
    existingGoals.length > 0 
      ? existingGoals.map(g => ({ ...g, isSaved: true }))
      : [{
          title: '',
          description: '',
          thrustArea: 'Business Growth',
          uom: 'Numeric',
          target: '',
          weightage: 10,
          isSaved: false
        }]
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);

  const totalWeightage = goals.reduce((sum, g) => sum + (Number(g.weightage) || 0), 0);
  const allSaved = goals.length > 0 && goals.every(g => g.isSaved);
  
  const addGoal = () => {
    if (goals.length >= 8) {
      setError('Maximum 8 goals allowed');
      return;
    }
    setGoals([...goals, {
      title: '',
      description: '',
      thrustArea: 'Business Growth',
      uom: 'Numeric',
      target: '',
      weightage: 10,
      isSaved: false
    }]);
    setError('');
  };

  const removeGoal = (index) => {
    const newGoals = [...goals];
    newGoals.splice(index, 1);
    setGoals(newGoals);
    setError('');
  };

  const updateGoal = (index, field, value) => {
    const newGoals = [...goals];
    newGoals[index][field] = value;
    newGoals[index].isSaved = false;
    setGoals(newGoals);
    setError('');
  };

  const saveGoalDraft = async (index) => {
    const goal = goals[index];
    if (!goal.title.trim() || !goal.description.trim() || !goal.target.toString().trim() || !goal.weightage) {
      setError(`Please fill all fields for Goal #${index + 1} before saving to draft.`);
      return;
    }
    if (goal.weightage < 10) {
      setError(`Goal #${index + 1} must have a minimum weightage of 10%`);
      return;
    }
    
    setDraftLoading(true);
    try {
      // Save all current goals to backend as Draft
      await api.post('/goalsheets', { goals, status: 'Draft' });
      const newGoals = [...goals];
      newGoals[index].isSaved = true;
      setGoals(newGoals);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save draft');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (goals.length === 0) {
      setError('Please add at least one goal.');
      return;
    }
    
    if (!allSaved) {
      setError('Please click Save on all individual goals before submitting.');
      return;
    }

    if (totalWeightage !== 100) {
      setError('Total weightage must exactly equal 100%');
      return;
    }

    setLoading(true);
    try {
      await api.post('/goalsheets', { goals, status: 'Submitted' });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Weightage Progress Bar */}
      <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-4 z-20">
        <div>
          <h2 className="text-xl font-semibold text-white">Goal Weightage</h2>
          <p className="text-slate-400 text-sm mt-1">{goals.length}/8 Goals Added</p>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-bold ${totalWeightage === 100 ? 'text-emerald-400' : totalWeightage > 100 ? 'text-red-400' : 'text-blue-400'}`}>
            {totalWeightage}%
          </span>
          <span className="text-xs text-slate-500">Target: 100%</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className={`glass-card p-6 border-l-4 transition-all duration-300 relative group ${goal.isSaved ? 'border-l-emerald-500' : 'border-l-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]'}`}>
            <button 
              onClick={() => removeGoal(index)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete Goal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pr-8 gap-2">
              <h3 className="font-medium text-white flex items-center gap-2">
                Goal #${index + 1} 
                {goal.isSaved && <span className="text-emerald-400 text-xs font-medium ml-2 px-2 py-1 bg-emerald-500/10 rounded-full">Saved to Draft</span>}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Goal Title *</label>
                <input 
                  type="text" 
                  value={goal.title}
                  onChange={(e) => updateGoal(index, 'title', e.target.value)}
                  className="glass-input" 
                  placeholder="Increase Q3 Sales"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Thrust Area</label>
                <select 
                  value={goal.thrustArea}
                  onChange={(e) => updateGoal(index, 'thrustArea', e.target.value)}
                  className="glass-input"
                >
                  <option className="bg-slate-800" value="Business Growth">Business Growth</option>
                  <option className="bg-slate-800" value="Operational Excellence">Operational Excellence</option>
                  <option className="bg-slate-800" value="Innovation">Innovation</option>
                  <option className="bg-slate-800" value="Customer Satisfaction">Customer Satisfaction</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-slate-400">Description *</label>
                <textarea 
                  value={goal.description}
                  onChange={(e) => updateGoal(index, 'description', e.target.value)}
                  className="glass-input h-20 resize-none" 
                  placeholder="Detailed description of the goal..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">UoM (Unit of Measurement)</label>
                <select 
                  value={goal.uom}
                  onChange={(e) => updateGoal(index, 'uom', e.target.value)}
                  className="glass-input"
                >
                  <option className="bg-slate-800" value="Numeric">Numeric</option>
                  <option className="bg-slate-800" value="%">%</option>
                  <option className="bg-slate-800" value="Timeline">Timeline</option>
                  <option className="bg-slate-800" value="Zero-based">Zero-based</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Target Value *</label>
                <input 
                  type="text" 
                  value={goal.target}
                  onChange={(e) => updateGoal(index, 'target', e.target.value)}
                  className="glass-input" 
                  placeholder={goal.uom === 'Timeline' ? 'YYYY-MM-DD' : 'e.g., 1000'}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Weightage (%) *</label>
                <input 
                  type="number" 
                  min="10" 
                  max="100"
                  value={goal.weightage === '' ? '' : goal.weightage}
                  onChange={(e) => updateGoal(index, 'weightage', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="glass-input" 
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => saveGoalDraft(index)}
                disabled={draftLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${goal.isSaved ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
              >
                <Save className="w-4 h-4" /> {goal.isSaved ? 'Saved' : 'Save Goal to Draft'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {goals.length < 8 && (
        <button 
          onClick={addGoal}
          className="w-full py-4 border-2 border-dashed border-slate-700 text-slate-400 rounded-xl hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Another Goal
        </button>
      )}

      <div className="flex justify-end pt-6 border-t border-white/10 mt-8">
        <button 
          onClick={handleSubmit}
          disabled={loading || totalWeightage !== 100 || !allSaved}
          className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            totalWeightage === 100 && allSaved
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Goals For Approval'}
          {!loading && totalWeightage === 100 && allSaved && <CheckCircle className="w-5 h-5" />}
        </button>
      </div>

    </div>
  );
}

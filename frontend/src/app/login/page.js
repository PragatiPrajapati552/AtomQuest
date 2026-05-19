"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Target, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const res = await login({ email, password });
    if (!res.success) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-500/10 rounded-full mb-4">
            <Target className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ATOMQUEST Portal</h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to manage your goals</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-10" 
                placeholder="employee@test.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-10" 
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3">
            Sign In
          </button>
          
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Demo Accounts:</p>
          <p>employee@test.com / manager@test.com / admin@test.com</p>
          <p>Password: password123</p>
        </div>

      </div>
    </div>
  );
}

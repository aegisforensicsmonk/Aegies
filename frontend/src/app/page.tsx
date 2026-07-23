'use client';

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Fingerprint, Lock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('marcus.wright@ciip.gov');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-cyber-bg">
        <div className="absolute inset-0 hex-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10" />
        {/* Animated grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Security Notice */}
        <div className="flex items-center gap-2 justify-center mb-6">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] text-amber-400/80 tracking-wide uppercase">Authorized Personnel Only — All Access is Monitored</span>
        </div>

        <div className="glass-panel p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-cyber-border/50 mb-4">
              <Image src="/logo.jpg" alt="Aegis Logo" width={96} height={96} className="object-cover w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold text-white">AEGIS</h1>
            <p className="text-xs text-cyber-muted mt-1 tracking-wider uppercase">AI-Powered Digital Forensics Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-cyber-muted mb-2 uppercase tracking-wider">
                Email / Badge ID
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyber-input pl-10"
                  placeholder="agent@ciip.gov"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-cyber-muted mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input pl-10 pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text transition-colors z-10"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-cyber-border bg-cyber-surface text-cyber-accent focus:ring-cyber-accent/30" />
                <span className="text-xs text-cyber-muted">Remember this device</span>
              </label>
              <a href="#" className="text-xs text-cyber-accent hover:text-cyber-accent-glow transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn-primary w-full py-3 text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Secure Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-center text-[10px] text-cyber-muted leading-relaxed">
              This system is restricted to authorized law enforcement and<br />
              investigation personnel. Unauthorized access is prohibited<br />
              and subject to prosecution under applicable laws.
            </p>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-[10px] text-cyber-muted mt-4">
          Aegis Sandbox AI v2.1.0 · Encrypted Connection · TLS 1.3
        </p>
      </div>
    </div>
  );
}

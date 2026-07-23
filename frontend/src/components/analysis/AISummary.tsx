'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Cpu, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AISummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    // Simulate AI generation time
    const timer = setTimeout(() => {
      setSummary("The analyzed sample (svchost_update.exe) demonstrates behaviors strongly aligning with the ALPHV/BlackCat ransomware family. Written in Rust, it establishes persistence via the HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run registry key. The executable exhibits high-entropy sections suggesting packing, and spawns a child process for intermittent file encryption using AES-256. Network telemetry indicates communication with a known malicious IP (103.235.46.18). After encryption, it drops the standard BlackCat ransom note.");
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-cyber-surface/30 rounded-lg border border-cyber-accent/30 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-accent/5 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyber-accent" />
          Aegis AI Security Analyst
        </h3>
        <span className="cyber-badge badge-purple text-[10px] flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Llama 3
        </span>
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-cyber-border rounded w-full" />
            <div className="h-3 bg-cyber-border rounded w-5/6" />
            <div className="h-3 bg-cyber-border rounded w-4/6" />
            <div className="flex items-center gap-2 mt-4 text-[10px] text-cyber-muted">
              <Cpu className="w-3 h-3 animate-spin" /> Synthesizing behavioral telemetry...
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-cyber-text-dim leading-relaxed">
              {summary}
            </p>
            <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-[10px] text-red-200">Critical: System recovery inhibited (T1490). Immediate isolation recommended.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

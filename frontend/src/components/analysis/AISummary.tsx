'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Cpu, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISummaryProps {
  fileName?: string;
  threatLevel?: string;
}

export default function AISummary({ fileName = 'svchost_update.exe', threatLevel = 'High Threat' }: AISummaryProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    setLoading(true);
    // Simulate AI generation time
    const timer = setTimeout(() => {
      if (threatLevel === 'High Threat') {
        setSummary(`The analyzed sample (${fileName}) demonstrates behaviors strongly aligning with the ALPHV/BlackCat ransomware family. Written in Rust, it establishes persistence via the HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run registry key. The executable exhibits high-entropy sections suggesting packing, and spawns a child process for intermittent file encryption using AES-256. Network telemetry indicates communication with a known malicious IP (103.235.46.18). After encryption, it drops the standard BlackCat ransom note.`);
      } else if (threatLevel === 'Suspicious') {
        setSummary(`The analyzed sample (${fileName}) exhibits anomalous execution patterns. While it doesn't perfectly match known ransomware signatures, it attempts to modify system configuration and initiates unexpected outbound network connections. Its behavior deviates from standard application baselines and warrants further manual inspection by an analyst.`);
      } else {
        setSummary(`The analyzed sample (${fileName}) executed within expected parameters. No malicious payloads, suspicious execution patterns, unauthorized registry modifications, or anomalous network connections were detected during dynamic sandbox execution. The file appears benign.`);
      }
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [fileName, threatLevel]);

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
            {threatLevel === 'High Threat' && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-[10px] text-red-200">Critical: System recovery inhibited (T1490). Immediate isolation recommended.</span>
              </div>
            )}
            {threatLevel === 'Suspicious' && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-amber-200">Warning: Anomalous behavior detected. Monitor endpoints.</span>
              </div>
            )}
            {threatLevel === 'Safe' && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-emerald-200">Safe: No threats detected.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

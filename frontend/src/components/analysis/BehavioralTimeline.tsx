'use client';

import React from 'react';
import { Clock, Download, Globe, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockTimeline = [
  { time: '00:00:01', type: 'execution', desc: 'Process svchost_update.exe started (PID: 4502)', severity: 'medium', icon: Cpu },
  { time: '00:00:03', type: 'file', desc: 'Dropped ransomware payload into %APPDATA%', severity: 'high', icon: Download },
  { time: '00:00:05', type: 'network', desc: 'DNS Query for api.update-service.meridian-cdn.com', severity: 'high', icon: Globe },
  { time: '00:00:08', type: 'network', desc: 'TLS Connection to 103.235.46.18:443', severity: 'critical', icon: Globe },
  { time: '00:00:15', type: 'execution', desc: 'Spawned cmd.exe (vssadmin.exe Delete Shadows)', severity: 'critical', icon: ShieldAlert },
  { time: '00:00:18', type: 'file', desc: 'Intermittent file encryption started (AES-256)', severity: 'critical', icon: Download },
];

export default function BehavioralTimeline() {
  return (
    <div className="bg-cyber-bg rounded-lg border border-cyber-border p-4">
      <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-cyber-border before:to-transparent">
        {mockTimeline.map((event, i) => {
          const Icon = event.icon;
          return (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 bg-cyber-bg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow",
                event.severity === 'critical' ? "border-red-500 shadow-red-500/50" : 
                event.severity === 'high' ? "border-amber-500 shadow-amber-500/50" : "border-cyber-accent shadow-cyber-accent/50"
              )}>
                <Icon className={cn("w-3 h-3", 
                  event.severity === 'critical' ? "text-red-500" : 
                  event.severity === 'high' ? "text-amber-500" : "text-cyber-accent"
                )} />
              </div>
              
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-cyber-border bg-cyber-surface/50 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-white text-xs">{event.type.toUpperCase()}</div>
                  <time className="text-[10px] font-mono text-cyber-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {event.time}
                  </time>
                </div>
                <div className="text-xs text-cyber-text-dim">{event.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

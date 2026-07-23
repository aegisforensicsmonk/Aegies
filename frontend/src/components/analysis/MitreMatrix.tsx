'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Network, Server, Shield, Unlock, Zap, Eye, Download, Users, Key } from 'lucide-react';

const tactics = [
  { id: 'TA0001', name: 'Initial Access', icon: Unlock },
  { id: 'TA0002', name: 'Execution', icon: Zap },
  { id: 'TA0003', name: 'Persistence', icon: Server },
  { id: 'TA0004', name: 'Privilege Escalation', icon: Users },
  { id: 'TA0005', name: 'Defense Evasion', icon: Shield },
  { id: 'TA0011', name: 'Command & Control', icon: Network },
  { id: 'TA0040', name: 'Impact', icon: Eye }
];

const mappedTechniques = {
  'TA0001': [{ id: 'T1566', name: 'Phishing', active: true }],
  'TA0002': [{ id: 'T1059', name: 'Command and Scripting Interpreter', active: true }, { id: 'T1204', name: 'User Execution', active: true }],
  'TA0003': [{ id: 'T1547', name: 'Boot or Logon Autostart Execution', active: true }],
  'TA0004': [{ id: 'T1055', name: 'Process Injection', active: false }],
  'TA0005': [{ id: 'T1027', name: 'Obfuscated Files or Information', active: true }, { id: 'T1070', name: 'Indicator Removal', active: true }],
  'TA0011': [{ id: 'T1071', name: 'Application Layer Protocol', active: true }, { id: 'T1090', name: 'Proxy', active: false }],
  'TA0040': [{ id: 'T1486', name: 'Data Encrypted for Impact', active: true }, { id: 'T1490', name: 'Inhibit System Recovery', active: true }]
};

export default function MitreMatrix() {
  return (
    <div className="bg-cyber-bg rounded-lg border border-cyber-border p-4 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {tactics.map(tactic => {
          const Icon = tactic.icon;
          const techniques = mappedTechniques[tactic.id as keyof typeof mappedTechniques] || [];
          
          return (
            <div key={tactic.id} className="w-48 flex-shrink-0">
              <div className="bg-cyber-surface border border-cyber-border/50 rounded p-2 mb-3 flex items-center gap-2">
                <Icon className="w-4 h-4 text-cyber-muted" />
                <div className="text-xs font-bold text-white truncate" title={tactic.name}>
                  {tactic.name}
                </div>
              </div>
              
              <div className="space-y-2">
                {techniques.map(tech => (
                  <div 
                    key={tech.id} 
                    className={cn(
                      "p-2 rounded text-[10px] border transition-all cursor-default",
                      tech.active 
                        ? "bg-red-500/10 border-red-500/30 text-red-200" 
                        : "bg-cyber-surface/30 border-cyber-border/30 text-cyber-muted"
                    )}
                  >
                    <div className="font-mono mb-1">{tech.id}</div>
                    <div className="truncate" title={tech.name}>{tech.name}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

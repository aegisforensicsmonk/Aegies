'use client';

import React, { useState } from 'react';
import { Terminal, FileDigit, Server, ChevronRight, ChevronDown, Network, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProcessNode = {
  id: string;
  name: string;
  pid: number;
  cmdline: string;
  malicious: boolean;
  children?: ProcessNode[];
  events?: { type: string; desc: string }[];
};

const mockProcessTree: ProcessNode = {
  id: 'p1',
  name: 'explorer.exe',
  pid: 1024,
  cmdline: 'C:\\Windows\\explorer.exe',
  malicious: false,
  children: [
    {
      id: 'p2',
      name: 'svchost_update.exe',
      pid: 4502,
      cmdline: '"C:\\Users\\Admin\\Downloads\\svchost_update.exe"',
      malicious: true,
      events: [
        { type: 'File', desc: 'Dropped ransomware payload in %APPDATA%' },
        { type: 'Registry', desc: 'Added HKLM...\\Run key for persistence' }
      ],
      children: [
        {
          id: 'p3',
          name: 'cmd.exe',
          pid: 4510,
          cmdline: 'cmd.exe /c vssadmin.exe Delete Shadows /All /Quiet',
          malicious: true,
          events: [{ type: 'Process', desc: 'Attempted to delete shadow copies' }],
          children: [
            {
              id: 'p4',
              name: 'vssadmin.exe',
              pid: 4522,
              cmdline: 'vssadmin.exe Delete Shadows /All /Quiet',
              malicious: true
            }
          ]
        },
        {
          id: 'p5',
          name: 'svchost_update.exe',
          pid: 4588,
          cmdline: 'svchost_update.exe --child',
          malicious: true,
          events: [
            { type: 'Network', desc: 'Connected to 103.235.46.18:443' },
            { type: 'Crypto', desc: 'Accessed RSA keys for AES-256 encryption' }
          ]
        }
      ]
    }
  ]
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'File': return <FileDigit className="w-3 h-3 text-blue-400" />;
    case 'Registry': return <Key className="w-3 h-3 text-purple-400" />;
    case 'Network': return <Network className="w-3 h-3 text-amber-400" />;
    default: return <Server className="w-3 h-3 text-gray-400" />;
  }
};

const ProcessTreeNode = ({ node, level = 0 }: { node: ProcessNode, level?: number }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex items-start gap-2 py-2 px-3 rounded-md hover:bg-cyber-surface transition-colors",
          node.malicious ? "border-l-2 border-red-500 bg-red-500/5" : ""
        )}
        style={{ marginLeft: `${level * 20}px` }}
      >
        {node.children && node.children.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="mt-1 text-cyber-muted hover:text-white">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4 h-4 mt-1" /> // spacer
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Terminal className={cn("w-4 h-4", node.malicious ? "text-red-400" : "text-cyber-muted")} />
            <span className={cn("text-sm font-bold font-mono", node.malicious ? "text-red-400" : "text-white")}>
              {node.name}
            </span>
            <span className="text-[10px] text-cyber-muted bg-cyber-bg px-1.5 py-0.5 rounded border border-cyber-border">
              PID: {node.pid}
            </span>
          </div>
          <div className="text-[10px] text-cyber-muted font-mono mt-1 break-all bg-black/20 p-1 rounded border border-cyber-border/50">
            {node.cmdline}
          </div>
          
          {node.events && (
            <div className="mt-2 space-y-1">
              {node.events.map((ev, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  {getEventIcon(ev.type)}
                  <span className="text-cyber-text-dim">{ev.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {expanded && node.children && (
        <div className="flex flex-col border-l border-cyber-border/50 ml-5 mt-1 mb-1">
          {node.children.map(child => (
            <ProcessTreeNode key={child.id} node={child} level={0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProcessTree() {
  return (
    <div className="bg-cyber-bg rounded-lg border border-cyber-border p-4 max-h-[400px] overflow-y-auto">
      <ProcessTreeNode node={mockProcessTree} />
    </div>
  );
}

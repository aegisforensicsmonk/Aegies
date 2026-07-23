'use client';

import React, { useState } from 'react';

import ProcessTree from '@/components/analysis/ProcessTree';
import BehavioralTimeline from '@/components/analysis/BehavioralTimeline';
import AISummary from '@/components/analysis/AISummary';
import MitreMatrix from '@/components/analysis/MitreMatrix';
import ReportGenerator from '@/components/analysis/ReportGenerator';
import SandboxView from '@/components/analysis/SandboxView';
import {
  ShieldAlert, Skull, Lock, AlertTriangle, Search, Upload, Shield,
  Key, Bug, FileWarning, Server, ExternalLink, CheckCircle, XCircle, Hash, Activity, FileDigit, ShieldCheck, Clock, Map
} from 'lucide-react';
import { cn, formatDate, formatDateTime, getStatusColor, truncateHash } from '@/lib/utils';
import { mockRansomware, mockIOCs } from '@/data/mock-data';

const killChainStages = [
  { stage: 'Reconnaissance', icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10', done: true },
  { stage: 'Weaponization', icon: Bug, color: 'text-purple-400', bg: 'bg-purple-500/10', done: true },
  { stage: 'Delivery', icon: FileWarning, color: 'text-amber-400', bg: 'bg-amber-500/10', done: true },
  { stage: 'Exploitation', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', done: true },
  { stage: 'Installation', icon: Server, color: 'text-red-400', bg: 'bg-red-500/10', done: true },
  { stage: 'C2', icon: ExternalLink, color: 'text-red-400', bg: 'bg-red-500/10', done: true },
  { stage: 'Actions', icon: Skull, color: 'text-red-500', bg: 'bg-red-500/15', done: true },
];

export default function RansomwarePage() {
  const finding = mockRansomware[0];
  const ransomwareIOCs = mockIOCs.filter(i => i.case_id === 'case-002');
  
  // Simulated upload response with static analysis telemetry
  const recentUpload = {
    filename: 'svchost_update.exe',
    file_size: 2845120,
    status: 'ANALYSIS COMPLETE',
    entropy: 7.91,
    yara_matches: ['Ransomware_BlackCat_ALPHV', 'High_Entropy_Packed', 'Rust_Compiled_Binary'],
    pe_headers: { machine: 'AMD64', sections: 6, timestamp: '2026-06-25T14:32:11Z' },
    sha256: 'd0b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4'
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-400" />
            Ransomware Lab
          </h1>
          <p className="text-sm text-cyber-muted mt-1">Ransomware IOC analysis, family identification, and decryptor lookup</p>
        </div>
        <div className="flex gap-2">
          <ReportGenerator />
          <button onClick={() => document.getElementById('sandbox')?.scrollIntoView({ behavior: 'smooth' })} className="cyber-btn-primary text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Sample
          </button>
        </div>
      </div>

      {/* Active Ransomware Finding */}
      <div className="cyber-card-flat border-red-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/30">
              <Skull className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{finding.family_name}</h2>
              <p className="text-sm text-cyber-muted">Variant: {finding.variant} · Case: CIIP-2026-0163</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {finding.decryptor_available ? (
              <span className="cyber-badge badge-success text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Decryptor Available
              </span>
            ) : (
              <span className="cyber-badge badge-danger text-xs flex items-center gap-1">
                <XCircle className="w-3 h-3" /> No Decryptor
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Encryption', value: finding.encryption_type, icon: Lock },
            { label: 'Ransom Amount', value: finding.ransom_amount || 'Unknown', icon: Key },
            { label: 'BTC Address', value: finding.bitcoin_address ? truncateHash(finding.bitcoin_address, 16) : 'N/A', icon: Hash },
            { label: 'First Seen', value: formatDate(finding.first_seen), icon: AlertTriangle },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-cyber-bg rounded-lg p-3 border border-cyber-border">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-cyber-muted" />
                  <span className="text-[10px] text-cyber-muted uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm text-cyber-text font-mono">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-cyber-bg rounded-lg p-4 border border-cyber-border">
          <p className="text-sm text-cyber-text-dim leading-relaxed">{finding.notes}</p>
        </div>
      </div>

      {/* AI Summary */}
      <AISummary />

      {/* Static Analysis Telemetry */}
      <div className="cyber-card-flat border-cyber-accent/20">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyber-accent" />
          Recent Static Analysis Telemetry
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-cyber-bg rounded-lg p-3 border border-cyber-border">
            <p className="text-[10px] text-cyber-muted uppercase tracking-wider mb-1">File</p>
            <p className="text-sm text-white font-mono truncate">{recentUpload.filename}</p>
            <div className="flex gap-2 mt-2">
              <span className="cyber-badge badge-warning text-[10px]">{recentUpload.status}</span>
              <span className="cyber-badge badge-neutral text-[10px]">{(recentUpload.file_size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
          
          <div className="bg-cyber-bg rounded-lg p-3 border border-cyber-border">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-cyber-muted uppercase tracking-wider">Shannon Entropy</p>
              <span className={cn("text-xs font-bold", recentUpload.entropy > 7.0 ? "text-red-400" : "text-emerald-400")}>
                {recentUpload.entropy}
              </span>
            </div>
            <div className="w-full h-1.5 bg-cyber-surface rounded-full overflow-hidden">
              <div 
                className={cn("h-full", recentUpload.entropy > 7.0 ? "bg-red-500" : "bg-emerald-500")}
                style={{ width: `${(recentUpload.entropy / 8) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-cyber-muted mt-2">{recentUpload.entropy > 7.0 ? 'Highly packed/encrypted' : 'Normal entropy'}</p>
          </div>

          <div className="bg-cyber-bg rounded-lg p-3 border border-cyber-border">
            <p className="text-[10px] text-cyber-muted uppercase tracking-wider mb-1">PE Headers</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-cyber-muted">Arch:</span> <span className="text-white font-mono">{recentUpload.pe_headers.machine}</span></div>
              <div><span className="text-cyber-muted">Sections:</span> <span className="text-white font-mono">{recentUpload.pe_headers.sections}</span></div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-cyber-muted uppercase tracking-wider mb-2">YARA Matches</p>
          <div className="flex flex-wrap gap-2">
            {recentUpload.yara_matches.map(rule => (
              <span key={rule} className="cyber-badge badge-danger text-xs font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {rule}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Sandbox Execution */}
      <div id="sandbox" className="mb-6">
        <SandboxView />
      </div>

      {/* Dynamic Analysis Telemetry */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="cyber-card-flat">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-accent" />
            Process Execution Tree
          </h3>
          <ProcessTree />
        </div>
        
        <div className="cyber-card-flat">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyber-accent" />
            Behavioral Timeline
          </h3>
          <BehavioralTimeline />
        </div>
      </div>

      {/* MITRE ATT&CK Mapping */}
      <div className="cyber-card-flat">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Map className="w-4 h-4 text-cyber-accent" />
          MITRE ATT&CK Matrix Mapping
        </h3>
        <MitreMatrix />
      </div>

      {/* Kill Chain */}
      <div className="cyber-card-flat">
        <h3 className="text-sm font-semibold text-white mb-4">Kill Chain Progression</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {killChainStages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.stage}>
                <div className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border min-w-[100px] transition-all',
                  stage.done
                    ? `${stage.bg} border-current/20`
                    : 'bg-cyber-surface border-cyber-border'
                )}>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stage.bg)}>
                    <Icon className={cn('w-5 h-5', stage.done ? stage.color : 'text-cyber-muted')} />
                  </div>
                  <span className={cn('text-[10px] font-medium', stage.done ? stage.color : 'text-cyber-muted')}>
                    {stage.stage}
                  </span>
                  {stage.done && (
                    <CheckCircle className={cn('w-3 h-3', stage.color)} />
                  )}
                </div>
                {i < killChainStages.length - 1 && (
                  <div className={cn('w-6 h-px flex-shrink-0', stage.done ? 'bg-red-500/30' : 'bg-cyber-border')} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* IOC Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IOCs */}
        <div className="cyber-card-flat overflow-hidden p-0">
          <div className="p-4 border-b border-cyber-border">
            <h3 className="text-sm font-semibold text-white">Associated IOCs ({ransomwareIOCs.length})</h3>
          </div>
          <div className="divide-y divide-cyber-border/50">
            {ransomwareIOCs.map(ioc => (
              <div key={ioc.id} className="flex items-center justify-between px-4 py-3 hover:bg-cyber-surface/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={cn('cyber-badge text-[10px] w-16 justify-center',
                    ioc.ioc_type === 'ip' && 'badge-danger',
                    ioc.ioc_type === 'hash_sha256' && 'badge-purple',
                    ioc.ioc_type === 'file_name' && 'badge-cyan',
                    ioc.ioc_type === 'registry_key' && 'badge-neutral',
                  )}>
                    {ioc.ioc_type.replace('hash_', '')}
                  </span>
                  <div>
                    <p className="text-sm font-mono text-cyber-text truncate max-w-[250px]">{ioc.value}</p>
                    <p className="text-[10px] text-cyber-muted">{ioc.description}</p>
                  </div>
                </div>
                {ioc.matched && (
                  <CheckCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Known Ransomware Families */}
        <div className="cyber-card-flat">
          <h3 className="text-sm font-semibold text-white mb-4">Known Ransomware Families Database</h3>
          <div className="space-y-3">
            {[
              { name: 'ALPHV/BlackCat', variant: 'v2.1', samples: 1247, decryptor: false, color: 'border-red-500/30' },
              { name: 'LockBit 3.0', variant: 'Black', samples: 3891, decryptor: false, color: 'border-red-500/20' },
              { name: 'Conti', variant: 'v3', samples: 2156, decryptor: true, color: 'border-amber-500/20' },
              { name: 'REvil/Sodinokibi', variant: 'v2', samples: 1834, decryptor: true, color: 'border-amber-500/20' },
              { name: 'Hive', variant: 'v5', samples: 987, decryptor: true, color: 'border-emerald-500/20' },
              { name: 'Royal', variant: 'v1', samples: 654, decryptor: false, color: 'border-red-500/20' },
            ].map(family => (
              <div key={family.name} className={cn('flex items-center justify-between p-3 bg-cyber-bg rounded-lg border', family.color)}>
                <div>
                  <p className="text-sm font-medium text-cyber-text">{family.name}</p>
                  <p className="text-[10px] text-cyber-muted">Variant {family.variant} · {family.samples.toLocaleString()} samples</p>
                </div>
                {family.decryptor ? (
                  <span className="cyber-badge badge-success text-[10px]">Decryptor ✓</span>
                ) : (
                  <span className="cyber-badge badge-danger text-[10px]">No Decryptor</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

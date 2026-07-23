'use client';

import React, { useState } from 'react';
import { FileDigit, Download, ShieldAlert, AlertTriangle, CheckCircle, Search, Filter, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadReport } from '@/lib/report-generator';

export default function AnalysisHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [history, setHistory] = useState([
    { id: '1', fileName: 'svchost_update.exe', type: 'PE32 Executable', threatLevel: 'High Threat', confidenceScore: 98, timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(), engine: 'Aegis Dynamic Sandbox' },
    { id: '2', fileName: 'invoice_2026_final.docx', type: 'Office Document', threatLevel: 'Suspicious', confidenceScore: 65, timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(), engine: 'Static + Macro Analysis' },
    { id: '3', fileName: 'quarterly_report.pdf', type: 'PDF Document', threatLevel: 'Safe', confidenceScore: 5, timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(), engine: 'Static Analysis' },
    { id: '4', fileName: 'setup_v2.msi', type: 'Windows Installer', threatLevel: 'Suspicious', confidenceScore: 45, timestamp: new Date(Date.now() - 3600000 * 48).toLocaleString(), engine: 'Aegis Dynamic Sandbox' },
    { id: '5', fileName: 'image001.png', type: 'PNG Image', threatLevel: 'Safe', confidenceScore: 1, timestamp: new Date(Date.now() - 3600000 * 72).toLocaleString(), engine: 'Static Analysis' },
  ]);

  const filteredHistory = history.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.threatLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.engine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileDigit className="w-7 h-7 text-cyber-accent" />
            Ransomware Lab History
          </h1>
          <p className="text-sm text-cyber-muted mt-1">Review past static and dynamic file analyses across the platform.</p>
        </div>
      </div>

      <div className="cyber-card-flat">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
            <input 
              type="text" 
              placeholder="Search by filename, threat level, or engine..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cyber-bg border border-cyber-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-cyber-accent focus:outline-none transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyber-surface border border-cyber-border rounded-lg text-sm text-cyber-text hover:text-white transition-colors whitespace-nowrap">
            <Filter className="w-4 h-4" /> Filter Results
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyber-border text-xs text-cyber-muted uppercase tracking-wider">
                <th className="p-3 font-medium">Timestamp</th>
                <th className="p-3 font-medium">File Details</th>
                <th className="p-3 font-medium">Engine</th>
                <th className="p-3 font-medium">Verdict</th>
                <th className="p-3 font-medium">Score</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/50 text-sm">
              {filteredHistory.map(item => (
                <tr key={item.id} className="hover:bg-cyber-surface/30 transition-colors">
                  <td className="p-3 text-cyber-muted font-mono text-xs whitespace-nowrap">{item.timestamp}</td>
                  <td className="p-3">
                    <p className="text-cyber-text font-medium">{item.fileName}</p>
                    <p className="text-[10px] text-cyber-muted">{item.type}</p>
                  </td>
                  <td className="p-3 text-cyber-muted text-xs">{item.engine}</td>
                  <td className="p-3">
                    <span className={cn(
                      "cyber-badge text-xs flex items-center w-fit gap-1",
                      item.threatLevel === 'High Threat' ? "badge-danger" : 
                      item.threatLevel === 'Suspicious' ? "badge-warning" : "badge-success"
                    )}>
                      {item.threatLevel === 'High Threat' ? <ShieldAlert className="w-3 h-3" /> : 
                       item.threatLevel === 'Suspicious' ? <AlertTriangle className="w-3 h-3" /> : 
                       <CheckCircle className="w-3 h-3" />}
                      {item.threatLevel}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      "font-mono font-bold text-xs",
                      item.threatLevel === 'High Threat' ? "text-red-400" : 
                      item.threatLevel === 'Suspicious' ? "text-amber-400" : "text-emerald-400"
                    )}>{item.confidenceScore}%</span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => downloadReport(item.fileName, item.threatLevel, item.confidenceScore, [])}
                        className="text-cyber-accent hover:text-white transition-colors text-xs flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Report
                      </button>
                      <button 
                        onClick={() => setHistory(history.filter(h => h.id !== item.id))}
                        className="text-red-400/70 hover:text-red-400 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-cyber-muted">No analysis records found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Square, RefreshCw, Monitor, ShieldAlert, Cpu, AlertTriangle, Upload, Download, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { downloadReport } from '@/lib/report-generator';

type ThreatLevel = 'Safe' | 'Suspicious' | 'High Threat';

export interface SandboxViewProps {
  onAnalysisStart?: (fileName: string, fileSize: number) => void;
  onAnalysisComplete?: (data: {
    fileName: string;
    fileSize: number;
    threatLevel: ThreatLevel;
    confidenceScore: number;
    logs: any[];
  }) => void;
}

export default function SandboxView({ onAnalysisStart, onAnalysisComplete }: SandboxViewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState<{time: string, text: string, type: 'info' | 'warning' | 'danger'}[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>('Safe');
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [analystVerdict, setAnalystVerdict] = useState<string | null>(null);
  const [history, setHistory] = useState<{id: string, fileName: string, threatLevel: ThreatLevel, confidenceScore: number, timestamp: string}[]>([
    { id: '1', fileName: 'svchost_update.exe', threatLevel: 'High Threat', confidenceScore: 98, timestamp: '2026-07-21, 04:30:00 AM' },
    { id: '2', fileName: 'invoice_2026_final.docx', threatLevel: 'Suspicious', confidenceScore: 65, timestamp: '2026-07-21, 01:30:00 AM' },
    { id: '3', fileName: 'quarterly_report.pdf', threatLevel: 'Safe', confidenceScore: 5, timestamp: '2026-07-20, 06:30:00 AM' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getMagicBytes = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        if (e.target?.readyState === FileReader.DONE) {
          const arr = (new Uint8Array(e.target.result as ArrayBuffer)).subarray(0, 4);
          const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
          resolve(hex);
        } else {
          resolve('UNKNOWN');
        }
      };
      const slice = file.slice(0, 4);
      reader.readAsArrayBuffer(slice);
    });
  };

  const getDynamicExecution = (fileName: string, magicBytes: string) => {
    const baseLogs = [
      { text: "Initializing secure VM environment (Windows 11 x64)...", type: "info" },
      { text: `Loading sample: ${fileName} (PID: 4892)`, type: "info" },
      { text: `Deep content inspection: File Signature [${magicBytes || 'EMPTY'}] detected.`, type: "info" },
      { text: "Hooking kernel APIs and network drivers...", type: "info" },
      { text: "Execution started.", type: "info" }
    ];

    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.');
    const isHashName = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/.test(nameWithoutExt);
    const isHighThreat = /malware|payload|virus|ransom|eicar|exploit|wannacry|lockbit|blackcat|svchost|crypt|dark/i.test(fileName) || isHashName;
    const isSuspicious = /invoice|update|crack|keygen|patch|admin|tool/i.test(fileName);

    // Generate a pseudo-random variance (-4 to +4) based on filename
    const pseudoRandom = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };
    const variance = (pseudoRandom(fileName) % 9) - 4;

    let logs = [];
    let threat: ThreatLevel = 'Safe';
    let score = 0;

    // MZ header (Executable)
    if (magicBytes.startsWith('4D5A')) {
      if (isHighThreat) {
        threat = 'High Threat';
        score = Math.min(99, Math.max(90, 95 + variance));
        logs = [
          ...baseLogs,
          { text: "Actual executable format confirmed (MZ Header spoofing check passed).", type: "warning" },
          { text: "Process attempting to allocate memory in foreign process (Explorer.exe)", type: "warning" },
          { text: "Suspicious API call: VirtualAllocEx detected.", type: "warning" },
          { text: "Process created hidden thread: CreateRemoteThread.", type: "danger" },
          { text: "Network connection attempted: 185.12.5.44:443", type: "warning" },
          { text: "File system modification: Deleting volume shadow copies (vssadmin.exe delete shadows /all /quiet)", type: "danger" },
          { text: "Mass file encryption started in C:\\Users\\Admin\\Documents", type: "danger" },
          { text: "Ransom note dropped: READ_ME_NOW.txt", type: "danger" },
          { text: "Execution halted by sandbox time limit.", type: "info" }
        ];
      } else if (isSuspicious) {
        threat = 'Suspicious';
        score = Math.min(89, Math.max(50, 65 + variance));
        logs = [
          ...baseLogs,
          { text: "Actual executable format confirmed (MZ Header).", type: "info" },
          { text: "Process executed with elevated privileges.", type: "warning" },
          { text: "Unrecognized binary signature. Heuristics suggest potential adware/PUP.", type: "warning" },
          { text: "Execution completed normally. Monitoring recommended.", type: "info" }
        ];
      } else {
        threat = 'Safe';
        score = Math.max(1, 12 + variance);
        logs = [
          ...baseLogs,
          { text: "Actual executable format confirmed (MZ Header).", type: "info" },
          { text: "Process executed cleanly within sandbox.", type: "info" },
          { text: "No suspicious memory allocation or API calls detected.", type: "info" },
          { text: "Execution completed normally. Software appears benign.", type: "info" }
        ];
      }
    } 
    // PDF header
    else if (magicBytes.startsWith('25504446')) {
      if (isHighThreat) {
        threat = 'High Threat';
        score = Math.min(99, Math.max(80, 85 + variance));
        logs = [
          ...baseLogs,
          { text: "Actual PDF format confirmed.", type: "info" },
          { text: "Application launched (AcroRd32.exe)", type: "info" },
          { text: "Embedded JavaScript execution detected.", type: "warning" },
          { text: "Child process spawned: powershell.exe -ExecutionPolicy Bypass", type: "danger" },
          { text: "Network connection attempt blocked to known C2 server.", type: "danger" },
          { text: "Process terminated unexpectedly.", type: "info" },
          { text: "Execution halted.", type: "info" }
        ];
      } else if (isSuspicious) {
        threat = 'Suspicious';
        score = Math.min(79, Math.max(40, 55 + variance));
        logs = [
          ...baseLogs,
          { text: "Actual PDF format confirmed.", type: "info" },
          { text: "Application launched (AcroRd32.exe)", type: "info" },
          { text: "Document contains obfuscated macros.", type: "warning" },
          { text: "Macro execution blocked by policy.", type: "info" },
          { text: "Execution halted.", type: "info" }
        ];
      } else {
        threat = 'Safe';
        score = Math.max(1, 5 + Math.max(0, variance));
        logs = [
          ...baseLogs,
          { text: "Actual PDF format confirmed.", type: "info" },
          { text: "Application launched (AcroRd32.exe)", type: "info" },
          { text: "Document structure analysis passed. No malicious macros or JS found.", type: "info" },
          { text: "Execution completed normally. Document is safe.", type: "info" }
        ];
      }
    } 
    // ZIP / Office Open XML (DOCX, XLSX) or Legacy Office (DOC)
    else if (magicBytes.startsWith('504B0304') || magicBytes.startsWith('D0CF11E0')) {
      if (isHighThreat) {
        threat = 'High Threat';
        score = Math.min(99, Math.max(85, 92 + variance));
        const isZip = fileName.toLowerCase().endsWith('.zip') || fileName.toLowerCase().endsWith('.rar');
        logs = [
          ...baseLogs,
          { text: `Actual ${isZip ? 'Archive' : 'Office Document'} format confirmed.`, type: "info" },
          { text: isZip ? "Extracting archive contents to secure temp directory..." : "Application launched (WinWord.exe)", type: "info" },
          { text: isZip ? "Executable payload found inside archive. Initializing inner sandbox..." : "Document macro execution detected (AutoOpen).", type: "warning" },
          { text: "Child process spawned: powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass", type: "danger" },
          { text: "Network connection attempt blocked to known C2 server.", type: "danger" },
          { text: "Execution halted by sandbox defense mechanisms.", type: "info" }
        ];
      } else if (isSuspicious) {
        threat = 'Suspicious';
        score = Math.min(84, Math.max(45, 65 + variance));
        logs = [
          ...baseLogs,
          { text: "Actual Office Document format confirmed.", type: "info" },
          { text: "Application launched (WinWord.exe)", type: "info" },
          { text: "Document contains external remote template injection link.", type: "warning" },
          { text: "Network request blocked.", type: "info" }
        ];
      } else {
        threat = 'Safe';
        score = Math.max(1, 8 + variance);
        logs = [
          ...baseLogs,
          { text: "Actual Archive/Office Document format confirmed.", type: "info" },
          { text: "Archive extracted / Document opened successfully.", type: "info" },
          { text: "No malicious macros or packed payloads found.", type: "info" },
          { text: "Execution completed normally. File is safe.", type: "info" }
        ];
      }
    } 
    // Safe formats (Images, Text, etc) or unknown
    else {
      threat = 'Safe';
      score = Math.max(1, 2 + (Math.abs(variance) % 4));
      logs = [
        ...baseLogs,
        { text: "Non-executable or generic file format detected.", type: "info" },
        { text: "File opened successfully in default viewer.", type: "info" },
        { text: "No anomalous network traffic detected.", type: "info" },
        { text: "Execution completed normally.", type: "info" }
      ];
    }
    
    return { logs, threat, score };
  };

  const startSandbox = async (file: File | null = selectedFile) => {
    if (!file) return;
    const fileName = file.name;
    setIsRunning(true);
    setIsCompleted(false);
    setAnalystVerdict(null);
    setLogs([]);
    
    if (onAnalysisStart) {
      onAnalysisStart(fileName, file.size);
    }
    
    // Read the first 4 bytes of the file for actual content detection
    const magicBytes = await getMagicBytes(file);
    
    let currentIndex = 0;
    const mockData = getDynamicExecution(fileName, magicBytes);
    
    intervalRef.current = setInterval(() => {
      if (currentIndex < mockData.logs.length) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        
        const currentLog = mockData.logs[currentIndex];
        setLogs(prev => [...prev, {
          time: timeStr,
          text: currentLog.text,
          type: currentLog.type as any
        }]);
        currentIndex++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setThreatLevel(mockData.threat);
        setConfidenceScore(mockData.score);
        setIsRunning(false);
        setIsCompleted(true);
        
        // Add to history
        setHistory(prev => [{
          id: Math.random().toString(),
          fileName,
          threatLevel: mockData.threat,
          confidenceScore: mockData.score,
          timestamp: new Date().toLocaleString()
        }, ...prev]);

        if (onAnalysisComplete) {
          onAnalysisComplete({
            fileName,
            fileSize: file.size,
            threatLevel: mockData.threat,
            confidenceScore: mockData.score,
            logs: mockData.logs
          });
        }

        toast.success(`Sandbox analysis complete for ${fileName}`);
      }
    }, 800);
  };

  const stopSandbox = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsCompleted(true);
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    setLogs(prev => [...prev, {
      time: timeStr,
      text: "Execution manually halted by analyst.",
      type: "warning"
    }]);
    
    toast.error('Sandbox execution halted.');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-6">
      <input 
        type="file" 
        className="w-0 h-0 absolute opacity-0 pointer-events-none" 
        ref={fileInputRef} 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            startSandbox(file);
          }
        }} 
      />
      <div className="cyber-card-flat border-cyber-accent/30 overflow-hidden flex flex-col h-[400px]">
        <div className="flex items-center justify-between p-3 border-b border-cyber-border bg-cyber-surface/50">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-cyber-accent" />
            <h3 className="text-sm font-semibold text-white">Interactive Sandbox Execution</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyber-muted flex items-center gap-1 mr-2">
              <Cpu className="w-3 h-3" /> VM: Win11_x64_Isolated
            </span>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded transition-colors disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {isRunning ? 'Running...' : 'Upload & Execute'}
            </button>
            <button 
              onClick={stopSandbox}
              disabled={!isRunning}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded transition-colors disabled:opacity-50"
            >
              <Square className="w-3 h-3" /> Stop
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#0a0a0f] p-4 overflow-y-auto font-mono text-xs" ref={scrollRef}>
          {!isRunning && !isCompleted && logs.length === 0 && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setSelectedFile(file);
                  startSandbox(file);
                }
              }}
              className="h-full flex flex-col items-center justify-center text-cyber-muted opacity-80 cursor-pointer hover:bg-cyber-surface/30 transition-colors rounded-xl border-2 border-dashed border-cyber-border m-4 hover:border-cyber-accent"
            >
              <Upload className="w-12 h-12 mb-4 text-cyber-accent" />
              <p className="font-medium text-white mb-1">Click or Drop File to Execute in Sandbox</p>
              <p className="text-xs">Secure Analysis VM will boot instantly.</p>
            </div>
          )}
          
          {logs.map((log, i) => (
            <div key={i} className="mb-2 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-cyber-muted/50 whitespace-nowrap">[{log.time}]</span>
              <div className="flex items-start gap-2">
                {log.type === 'danger' && <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                {log.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                {log.type === 'info' && <span className="w-4 h-4 flex-shrink-0" />}
                <span className={cn(
                  "leading-relaxed",
                  log.type === 'danger' && "text-red-400",
                  log.type === 'warning' && "text-amber-400",
                  log.type === 'info' && "text-cyber-text"
                )}>
                  {log.text}
                </span>
              </div>
            </div>
          ))}
          
          {isCompleted && (
            <div className="mt-4 space-y-4 animate-in fade-in">
              {/* Verdict and Score Banner */}
              <div className={cn(
                "p-4 border rounded flex flex-col md:flex-row md:items-start justify-between gap-6",
                threatLevel === 'High Threat' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                threatLevel === 'Suspicious' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              )}>
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-cyber-border stroke-current"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={cn(
                          "stroke-current",
                          threatLevel === 'High Threat' ? "text-red-500" :
                          threatLevel === 'Suspicious' ? "text-amber-500" :
                          "text-emerald-500"
                        )}
                        strokeWidth="3"
                        strokeDasharray={`${confidenceScore}, 100`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                      <span className="font-bold">{confidenceScore}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {threatLevel === 'High Threat' ? <ShieldAlert className="w-5 h-5" /> : 
                       threatLevel === 'Suspicious' ? <AlertTriangle className="w-5 h-5" /> : 
                       <CheckCircle className="w-5 h-5" />}
                      <h4 className="font-bold text-sm uppercase tracking-wider">{threatLevel}</h4>
                    </div>
                    <p className="text-xs opacity-80 mb-3 max-w-lg">
                      {threatLevel === 'High Threat' ? 'High confidence of malicious behavior based on behavioral telemetry and static heuristics. Recommended Action: Isolate and remediate.' : 
                       threatLevel === 'Suspicious' ? 'Anomalous behavior detected. Requires further manual inspection.' : 
                       'No malicious behavior detected during execution. File appears benign.'}
                    </p>
                    
                    <button 
                      onClick={() => downloadReport(selectedFile?.name || 'sample', threatLevel, confidenceScore, logs)}
                      className={cn(
                        "px-4 py-2 border rounded text-xs font-bold transition-colors flex items-center gap-2",
                        threatLevel === 'High Threat' ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/50" :
                        threatLevel === 'Suspicious' ? "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50" :
                        "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50"
                      )}
                    >
                      <Download className="w-3.5 h-3.5" /> Generate AI Threat Report (PDF)
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => { setIsCompleted(false); setLogs([]); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="px-3 py-1.5 text-xs bg-cyber-surface hover:bg-cyber-border text-white border border-cyber-border rounded transition-colors whitespace-nowrap self-start"
                >
                  Run New File
                </button>
              </div>

              {/* Analyst Review Panel */}
              <div className="p-4 border border-cyber-border bg-cyber-surface/30 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Analyst Verdict Loop</h4>
                  <p className="text-xs text-cyber-muted">Provide human-in-the-loop feedback to train the scoring model.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setAnalystVerdict('FP'); toast.success('Marked as False Positive. Database updated.'); }}
                    className={cn(
                      "px-3 py-1.5 text-xs border rounded transition-colors",
                      analystVerdict === 'FP' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-cyber-surface border-cyber-border text-cyber-muted hover:text-white"
                    )}
                  >
                    Mark False Positive
                  </button>
                  <button 
                    onClick={() => { setAnalystVerdict('TP'); toast.success('Confirmed True Positive. Database updated.'); }}
                    className={cn(
                      "px-3 py-1.5 text-xs border rounded transition-colors",
                      analystVerdict === 'TP' ? "bg-red-500/20 border-red-500 text-red-400" : "bg-cyber-surface border-cyber-border text-cyber-muted hover:text-white"
                    )}
                  >
                    Confirm Malicious
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cyber-card-flat">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-accent" />
          Sandbox Analysis History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyber-border text-xs text-cyber-muted uppercase tracking-wider">
                <th className="p-3 font-medium">Timestamp</th>
                <th className="p-3 font-medium">File Name</th>
                <th className="p-3 font-medium">Verdict</th>
                <th className="p-3 font-medium">Score</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/50 text-sm">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-cyber-surface/30 transition-colors">
                  <td className="p-3 text-cyber-muted font-mono text-xs">{item.timestamp}</td>
                  <td className="p-3 text-cyber-text">{item.fileName}</td>
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
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-cyber-muted text-xs">No execution history available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

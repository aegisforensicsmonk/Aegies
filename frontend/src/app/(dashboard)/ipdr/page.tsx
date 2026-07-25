'use client';

import React, { useState } from 'react';
import {
  BarChart3, Upload, Phone, MessageSquare, Wifi, MapPin, Clock,
  AlertTriangle, TrendingUp, Download, Filter, ArrowUpDown, Trash2, Search
} from 'lucide-react';
import { cn, formatDateTime, getStatusColor } from '@/lib/utils';
import { mockIPDR } from '@/data/mock-data';

import { useVirtualizer } from '@tanstack/react-virtual';

export default function IPDRPage() {
  const [activeView, setActiveView] = useState<'table' | 'analysis'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState(mockIPDR);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load from localStorage on initial render
  React.useEffect(() => {
    const saved = localStorage.getItem('ciip_ipdr_records');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved records', e);
      }
    }
  }, []);

  const removeRecord = (id: string) => {
    setRecords(prev => {
      const newRecords = prev.filter(r => r.id !== id);
      localStorage.setItem('ciip_ipdr_records', JSON.stringify(newRecords));
      return newRecords;
    });
  };

  const removeAllRecords = () => {
    setRecords([]);
    localStorage.removeItem('ciip_ipdr_records');
  };

  const filteredRecords = React.useMemo(() => {
    return records.filter(r => 
      (r.source_number || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (r.destination_number || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [records, searchQuery]);

  const callStats = {
    total: filteredRecords.length,
    voice: filteredRecords.filter(r => r.call_type === 'voice').length,
    sms: filteredRecords.filter(r => r.call_type === 'sms').length,
    data: filteredRecords.filter(r => r.call_type === 'data').length,
    totalDuration: filteredRecords.reduce((a, r) => a + (r.duration_seconds || 0), 0),
    uniqueNumbers: new Set(filteredRecords.flatMap(r => [r.source_number, r.destination_number]).filter(Boolean)).size,
    lateNightCalls: filteredRecords.filter(r => {
      const timeStr = r.start_time;
      if (!timeStr) return false;
      const h = new Date(timeStr).getHours();
      return h >= 22 || h <= 5;
    }).length,
  };

  const analysisData = React.useMemo(() => {
    const freq: Record<string, { count: number, ips: Set<string> }> = {};
    filteredRecords.forEach(r => {
      const dest = r.destination_number;
      if (dest) {
        if (!freq[dest]) freq[dest] = { count: 0, ips: new Set() };
        freq[dest].count++;
        if (r.destination_ip) freq[dest].ips.add(r.destination_ip);
      }
    });
    const topContacts = Object.entries(freq)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 4)
      .map(([number, data], i) => {
        const ipString = data.ips.size > 0 ? Array.from(data.ips).join(', ') : '';
        return { 
          number, 
          calls: data.count, 
          ips: ipString,
          label: i === 0 ? 'Most contacted' : 'Contact' 
        };
      });
    const maxCalls = topContacts.length > 0 ? topContacts[0].calls : 1;

    const sorted = [...filteredRecords].sort((a, b) => new Date(a.start_time || 0).getTime() - new Date(b.start_time || 0).getTime());
    const cellMovements: string[] = [];
    sorted.forEach(r => {
      if (r.cell_id && (cellMovements.length === 0 || cellMovements[cellMovements.length - 1] !== r.cell_id)) {
        cellMovements.push(r.cell_id);
      }
    });
    const recentMovements = cellMovements.slice(-4);

    const patterns = [];
    const lateCalls = filteredRecords.filter(r => {
      const timeStr = r.start_time;
      if (!timeStr) return false;
      const h = new Date(timeStr).getHours();
      return h >= 22 || h <= 5;
    });
    if (lateCalls.length > 0) {
      patterns.push({
        pattern: `Late-night calls (${lateCalls.length})`,
        risk: 'high',
        details: `Found calls at unusual hours`
      });
    }

    const longCalls = filteredRecords.filter(r => r.duration_seconds > 1800);
    if (longCalls.length > 0) {
      patterns.push({
        pattern: `Long duration calls (${longCalls.length})`,
        risk: 'medium',
        details: `Found calls lasting over 30 minutes`
      });
    }

    if (cellMovements.length >= 3) {
      patterns.push({
        pattern: `Frequent cell tower changes`,
        risk: 'medium',
        details: `Subject moved between ${cellMovements.length} towers`
      });
    }

    if (patterns.length === 0) {
      patterns.push({
        pattern: 'No suspicious patterns detected',
        risk: 'low',
        details: 'All communications appear normal based on rules'
      });
    }

    return { topContacts, maxCalls, recentMovements, patterns };
  }, [filteredRecords]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Only CSV files are supported.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(30);
    
    try {
      const text = await file.text();
      setUploadProgress(60);
      
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV file appears to be empty or only contains headers.');
        return;
      }
      
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const parsedRecords = lines.slice(1).map((line, i) => {
        const values = line.split(',').map(v => v.trim());
        const record: any = {
          id: `imported-${Date.now()}-${i}`
        };
        
        headers.forEach((header, index) => {
          const val = values[index];
          if (header.includes('source_ip') || header === 'src_ip') record.source_ip = val;
          else if (header.includes('dest_ip') || header === 'dst_ip') record.destination_ip = val;
          else if (header.includes('source') || header === 'src') record.source_number = val;
          else if (header.includes('dest') || header === 'dst') record.destination_number = val;
          else if (header.includes('type')) record.call_type = val;
          else if (header.includes('start') || header === 'timestamp') record.start_time = val;
          else if (header.includes('duration')) record.duration_seconds = parseInt(val) || 0;
          else if (header.includes('cell')) record.cell_id = val;
          else if (header.includes('loc')) record.cell_location = val;
          else if (header.includes('imei')) record.imei = val;
        });
        
        // Fallbacks if mapping failed
        if (!record.source_number && values[0]) record.source_number = values[0];
        if (!record.destination_number && values[1]) record.destination_number = values[1];
        if (!record.call_type && values[2]) record.call_type = values[2];
        if (!record.start_time && values[3]) record.start_time = values[3];
        if (record.duration_seconds === undefined && values[4]) record.duration_seconds = parseInt(values[4]) || 0;
        
        return record;
      });
      
      setUploadProgress(100);
      
      if (parsedRecords.length > 0) {
        setRecords(prev => {
          const newRecords = [...prev, ...parsedRecords];
          localStorage.setItem('ciip_ipdr_records', JSON.stringify(newRecords));
          return newRecords;
        });
        alert(`Successfully imported ${parsedRecords.length} records.`);
      } else {
        alert('No valid records could be parsed from the CSV.');
      }
      
    } catch (error: any) {
      console.error(error);
      alert(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportReport = () => {
    if (filteredRecords.length === 0) {
      alert("No records to export.");
      return;
    }

    const uniqueIPs = new Set(filteredRecords.flatMap(r => [r.source_ip, r.destination_ip]).filter(Boolean));
    
    // Map every number to its IPs
    const numberToIPs: Record<string, Set<string>> = {};
    filteredRecords.forEach(r => {
      if (r.source_number) {
        if (!numberToIPs[r.source_number]) numberToIPs[r.source_number] = new Set();
        if (r.source_ip) numberToIPs[r.source_number].add(r.source_ip);
      }
      if (r.destination_number) {
        if (!numberToIPs[r.destination_number]) numberToIPs[r.destination_number] = new Set();
        if (r.destination_ip) numberToIPs[r.destination_number].add(r.destination_ip);
      }
    });

    const timestamp = new Date().getTime();
    const dateStr = new Date().toLocaleString();
    const totalDurationMins = Math.round(callStats.totalDuration / 60);

    let report = `================================================================================\n`;
    report += `          AEGIS CYBER INVESTIGATION & INTELLIGENCE PLATFORM (CIIP)\n`;
    report += `                      IPDR FORENSIC ANALYSIS BRIEF\n`;
    report += `================================================================================\n`;
    report += `Generated On   : ${dateStr}\n`;
    report += `Reference ID   : CIIP-IPDR-${timestamp}\n`;
    report += `Classification : CONFIDENTIAL / FOR OFFICIAL USE ONLY\n`;
    report += `================================================================================\n\n`;
    
    report += `1. EXECUTIVE SUMMARY\n`;
    report += `--------------------------------------------------------------------------------\n`;
    report += `This report summarizes the communication telemetry and network resolution data \n`;
    report += `extracted from the provided IP Detail Records (IPDR). The dataset comprises \n`;
    report += `${callStats.total} total communication events across ${callStats.uniqueNumbers} unique telephony entities. \n`;
    report += `A total of ${uniqueIPs.size} distinct IP addresses were resolved during analysis.\n`;
    report += `Cumulative communication duration is ${totalDurationMins} minutes, with ${callStats.lateNightCalls} events \n`;
    report += `occurring outside standard operating hours.\n\n`;

    report += `2. THREAT & BEHAVIORAL PATTERNS\n`;
    report += `--------------------------------------------------------------------------------\n`;
    if (analysisData.patterns.length > 0) {
      analysisData.patterns.forEach(p => {
        report += `[!] Severity: ${p.risk.toUpperCase()} | Type: ${p.pattern}\n`;
        report += `    Details: ${p.details}\n\n`;
      });
    } else {
      report += `[i] No anomalous behavioral patterns detected within the current dataset.\n\n`;
    }

    report += `3. PRIMARY TARGETS / FREQUENT CONTACTS\n`;
    report += `--------------------------------------------------------------------------------\n`;
    if (analysisData.topContacts.length > 0) {
      analysisData.topContacts.forEach(c => {
        const ipText = c.ips ? c.ips : 'Unresolved';
        report += `- Entity ID  : ${c.number}\n`;
        report += `  Network IPs: ${ipText}\n`;
        report += `  Engagement : ${c.calls} interactions (${c.label})\n\n`;
      });
    } else {
      report += `[i] Insufficient data to determine primary communication targets.\n\n`;
    }

    report += `4. GEOSPATIAL INTELLIGENCE (CELL TOWER TRAJECTORY)\n`;
    report += `--------------------------------------------------------------------------------\n`;
    if (analysisData.recentMovements.length > 0) {
      report += `Recent movement trajectory indicates transitions across the following sectors:\n`;
      report += `[ ${analysisData.recentMovements.join('  >>>  ')} ]\n\n`;
    } else {
      report += `[i] No definitive spatial movement or cell tower handoffs detected.\n\n`;
    }

    report += `5. COMPREHENSIVE ENTITY-TO-IP RESOLUTION DIRECTORY\n`;
    report += `--------------------------------------------------------------------------------\n`;
    report += `The following index maps all extracted telephony endpoints to their correlated \n`;
    report += `network addresses (IPv4/IPv6) observed during the collection window.\n\n`;
    
    Object.entries(numberToIPs)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([num, ips]) => {
        const ipStr = ips.size > 0 ? Array.from(ips).join(', ') : 'N/A';
        report += `[+] Entity: ${num}\n`;
        report += `    Resolved IPs: ${ipStr}\n\n`;
      });

    report += `================================================================================\n`;
    report += `                         *** END OF FORENSIC BRIEF ***\n`;
    report += `================================================================================\n`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CIIP_IPDR_Forensic_Brief_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredRecords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 10,
  });

  return (
    <div suppressHydrationWarning className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-cyber-accent" />
            IPDR Analyzer
          </h1>
          <p className="text-sm text-cyber-muted mt-1">IP Detail Records & Call Data Record analysis</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <button className="cyber-btn-secondary text-sm text-red-400 hover:text-red-300 border-red-900/30 hover:border-red-500/50 hover:bg-red-900/20" onClick={removeAllRecords}>
              <Trash2 className="w-4 h-4" /> Remove All
            </button>
            <button className="cyber-btn-secondary text-sm" onClick={exportReport}>
              <Download className="w-4 h-4" /> Export
            </button>
            
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport} 
            />
            <button 
              className="cyber-btn-primary text-sm flex items-center gap-2 min-w-[140px] justify-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4" /> 
              {isUploading ? `${uploadProgress}%` : 'Import Data'}
            </button>
          </div>
          {isUploading && (
            <div className="w-full bg-cyber-surface rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-cyber-accent h-1.5 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: callStats.total, icon: Phone, color: 'text-cyan-400' },
          { label: 'Unique Numbers', value: callStats.uniqueNumbers, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Total Duration', value: `${Math.round(callStats.totalDuration / 60)}m`, icon: Clock, color: 'text-amber-400' },
          { label: 'Late Night Calls', value: callStats.lateNightCalls, icon: AlertTriangle, color: 'text-red-400' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="cyber-card-flat">
              <div className="flex items-center gap-3">
                <Icon className={cn('w-5 h-5', stat.color)} />
                <div>
                  <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
                  <p className="text-[10px] text-cyber-muted uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls: View Toggle & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 bg-cyber-surface rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveView('table')}
            className={cn('px-4 py-2 rounded-md text-xs font-medium transition-all',
              activeView === 'table' ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30' : 'text-cyber-muted hover:text-cyber-text'
            )}
          >
            Records Table
          </button>
          <button
            onClick={() => setActiveView('analysis')}
            className={cn('px-4 py-2 rounded-md text-xs font-medium transition-all',
              activeView === 'analysis' ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30' : 'text-cyber-muted hover:text-cyber-text'
            )}
          >
            Pattern Analysis
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input
            type="text"
            placeholder="Search numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-cyber-surface border border-cyber-border rounded-md text-sm text-cyber-text focus:outline-none focus:border-cyber-accent min-w-[250px]"
          />
        </div>
      </div>

      {activeView === 'table' ? (
        /* Records Table */
        <div className="cyber-card-flat p-0 flex flex-col h-[600px] border border-cyber-border rounded-xl">
          {/* Custom Table Header */}
          <div className="grid grid-cols-[1.5fr_1.5fr_0.8fr_1.5fr_1fr_1fr_1.5fr_1fr_0.5fr] gap-4 px-4 py-3 border-b border-cyber-border bg-cyber-bg text-xs font-semibold text-cyber-muted tracking-wider uppercase">
            <div>Source Number</div>
            <div>Destination</div>
            <div>Type</div>
            <div>Start Time</div>
            <div>Duration</div>
            <div>Cell ID</div>
            <div>Location</div>
            <div>IMEI</div>
            <div>Actions</div>
          </div>
          
          <div className="overflow-auto flex-1 custom-scrollbar" ref={parentRef}>
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const record = filteredRecords[virtualRow.index];
                return (
                  <div 
                    key={record.id || Math.random().toString()}
                    className="grid grid-cols-[1.5fr_1.5fr_0.8fr_1.5fr_1fr_1fr_1.5fr_1fr_0.5fr] gap-4 px-4 items-center border-b border-cyber-border/30 hover:bg-cyber-surface/50 transition-colors"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                      height: `${virtualRow.size}px`
                    }}
                  >
                    <div><span className="font-mono text-sm text-cyber-text">{record.source_number || 'Unknown'}</span></div>
                    <div><span className="font-mono text-sm text-cyber-text">{record.destination_number || 'Unknown'}</span></div>
                    <div>
                      <span className={cn('cyber-badge text-[10px]',
                        record.call_type === 'voice' && 'badge-success',
                        record.call_type === 'sms' && 'badge-warning',
                        record.call_type === 'data' && 'badge-info'
                      )}>
                        {record.call_type || 'unknown'}
                      </span>
                    </div>
                    <div><span className="text-xs text-cyber-muted">{formatDateTime(record.start_time)}</span></div>
                    <div>
                      <span className={cn('text-xs font-mono',
                        (record.duration_seconds || 0) > 1800 ? 'text-amber-400' : 'text-cyber-text-dim'
                      )}>
                        {Math.floor((record.duration_seconds || 0) / 60)}m {(record.duration_seconds || 0) % 60}s
                      </span>
                    </div>
                    <div><span className="text-xs font-mono text-cyber-muted">{record.cell_id}</span></div>
                    <div>
                      <span className="text-xs text-cyber-text-dim flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {record.cell_location}
                      </span>
                    </div>
                    <div><span className="text-xs font-mono text-cyber-muted">{record.imei}</span></div>
                    <div>
                      <button 
                        className="p-1 hover:bg-cyber-surface rounded text-cyber-muted hover:text-red-400 transition-colors"
                        onClick={() => removeRecord(record.id)}
                        title="Remove Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Pattern Analysis */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suspicious Patterns */}
          <div className="cyber-card-flat">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Suspicious Patterns Detected
            </h3>
            <div className="space-y-3">
              {analysisData.patterns.map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-cyber-bg rounded-lg border border-cyber-border">
                  <AlertTriangle className={cn('w-4 h-4 flex-shrink-0 mt-0.5',
                    p.risk === 'high' ? 'text-red-400' : p.risk === 'medium' ? 'text-amber-400' : 'text-green-400'
                  )} />
                  <div>
                    <p className="text-sm text-cyber-text">{p.pattern}</p>
                    <p className="text-xs text-cyber-muted mt-0.5">{p.details}</p>
                  </div>
                  <span className={cn('cyber-badge text-[10px] flex-shrink-0', getStatusColor(p.risk))}>{p.risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call frequency by hour */}
          <div className="cyber-card-flat">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyber-accent" />
              Communication Frequency
            </h3>
            <div className="space-y-3">
              {/* Dynamic bar chart */}
              {analysisData.topContacts.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyber-text w-36 flex-shrink-0">{item.number}</span>
                  <div className="flex-1 h-6 bg-cyber-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500/40 to-cyan-500/20 rounded-full flex items-center px-2"
                      style={{ width: `${Math.max(5, (item.calls / Math.max(1, analysisData.maxCalls)) * 100)}%` }}
                    >
                      <span className="text-[10px] text-cyan-300 font-mono">{item.calls}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyber-muted w-20 text-right">{item.label}</span>
                </div>
              ))}
              {analysisData.topContacts.length === 0 && (
                <p className="text-sm text-cyber-muted italic">No communication records found.</p>
              )}
            </div>

            {/* Cell tower movement */}
            <div className="mt-6 pt-4 border-t border-cyber-border">
              <h4 className="text-xs font-semibold text-white mb-3">Recent Cell Tower Movement</h4>
              <div className="flex items-center gap-2">
                {analysisData.recentMovements.length > 0 ? analysisData.recentMovements.map((cell, i) => (
                  <React.Fragment key={`${cell}-${i}`}>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-cyber-bg rounded-lg border border-cyber-border flex items-center justify-center">
                        <Wifi className="w-4 h-4 text-cyber-accent" />
                      </div>
                      <p className="text-[8px] text-cyber-muted mt-1">{cell.split('-').pop()}</p>
                    </div>
                    {i < analysisData.recentMovements.length - 1 && <div className="w-6 h-px bg-cyber-accent/30" />}
                  </React.Fragment>
                )) : (
                  <p className="text-sm text-cyber-muted italic">No cell tower data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Database, Users, Clock, GitBranch, Map, Brain,
  ClipboardList, Download, Share2, MoreHorizontal, ShieldCheck, AlertTriangle,
  CheckCircle, XCircle, Upload, ExternalLink, Eye, MapPin, Hash, ShieldAlert,
  Copy, ShieldBan, FileJson, FileType2, FileSpreadsheet, Search, Target
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatDate, formatDateTime, formatFileSize, truncateHash, getStatusColor, getSeverityIcon, timeAgo } from '@/lib/utils';
import {
  mockCases, mockEvidence, mockEntities, mockRelationships, mockTimeline,
  mockIOCs, mockCustody, mockAuditLogs, mockAIReports
} from '@/data/mock-data';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const GeoMap = dynamic(() => import('@/components/analysis/GeoMap'), { ssr: false, loading: () => <div className="h-[500px] bg-cyber-bg rounded-xl border border-cyber-border flex items-center justify-center animate-pulse"><Map className="w-16 h-16 text-cyber-muted/30" /></div> });

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'iocs', label: 'Indicators', icon: ShieldAlert },
  { id: 'evidence', label: 'Evidence', icon: Database },
  { id: 'entities', label: 'Entities', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'graph', label: 'Graph', icon: GitBranch },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'ai', label: 'AI Summary', icon: Brain },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList },
];

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCase = async () => {
      try {
        // First try to check local storage since cases page saves there
        const saved = localStorage.getItem('cases_list');
        if (saved) {
          const casesList = JSON.parse(saved);
          const found = casesList.find((c: any) => c.id === caseId);
          if (found) {
            setCaseData(found);
            setLoading(false);
            return;
          }
        }

        const res = await fetch(`/api/v1/cases/${caseId}`);
        if (!res.ok) throw new Error('Case not found in API');
        const data = await res.json();
        setCaseData(data);
      } catch (err: any) {
        console.error(err);
        // Fallback to mock data
        import('@/data/mock-data').then(({ mockCases }) => {
          const found = mockCases.find(c => c.id === caseId);
          if (found) {
            setCaseData(found);
          } else {
            setError('Case not found');
          }
        }).catch(() => {
          setError('Failed to load case');
        }).finally(() => {
          setLoading(false);
        });
        return; // Early return to avoid duplicate setLoading
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center animate-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-cyber-accent border-t-transparent animate-spin" />
          <p className="text-cyber-muted font-mono text-sm">LOADING_CASE_DATA...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex h-64 items-center justify-center animate-in">
        <div className="cyber-card border-red-500/20 bg-red-500/5 text-center p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Case Not Found</h2>
          <p className="text-sm text-cyber-muted mb-6">{error}</p>
          <Link href="/cases" className="cyber-btn-primary">Return to Cases</Link>
        </div>
      </div>
    );
  }

  const caseEvidence = mockEvidence.filter(e => e.case_id === caseData.id || e.case_id === caseData.case_number);
  const caseEntities = mockEntities.filter(e => e.case_id === caseData.id || e.case_id === caseData.case_number);
  const caseTimeline = mockTimeline.filter(t => t.case_id === caseData.id || t.case_id === caseData.case_number);
  const caseIOCs = mockIOCs.filter(i => i.case_id === caseData.id || i.case_id === caseData.case_number);
  const caseAuditLogs = mockAuditLogs.filter(a => a.resource_id === caseData.id || a.resource_id === caseData.case_number);
  const caseAIReports = mockAIReports.filter(r => r.case_id === caseData.id || r.case_id === caseData.case_number);

  const handleExport = () => {
    if (!caseData) return;
    const exportData = {
      caseInfo: caseData,
      evidence: caseEvidence,
      entities: caseEntities,
      timeline: caseTimeline,
      iocs: caseIOCs,
      auditLogs: caseAuditLogs,
      aiReports: caseAIReports
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case_${caseData.case_number}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!caseData) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`Case Report: ${caseData.case_number}`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Case Details', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Attribute', 'Value']],
      body: [
        ['Title', caseData.title],
        ['Type', caseData.case_type.replace('_', ' ')],
        ['Severity', caseData.severity],
        ['Status', caseData.status.replace('_', ' ')],
        ['Lead Investigator', caseData.lead_investigator.full_name],
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.setFontSize(14);
    doc.text('Summary', 14, (doc as any).lastAutoTable.finalY + 15);
    doc.setFontSize(10);
    const splitDescription = doc.splitTextToSize(caseData.description, 180);
    doc.text(splitDescription, 14, (doc as any).lastAutoTable.finalY + 22);
    
    const statsY = (doc as any).lastAutoTable.finalY + 25 + (splitDescription.length * 5);
    doc.setFontSize(14);
    doc.text('Quick Stats', 14, statsY);
    
    autoTable(doc, {
      startY: statsY + 5,
      head: [['Evidence Items', 'Entities Found', 'Threat Indicators', 'Timeline Events']],
      body: [
        [caseEvidence.length.toString(), caseEntities.length.toString(), caseIOCs.length.toString(), caseTimeline.length.toString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`case_${caseData.case_number}_brief.pdf`);
  };

  const exportIocsJson = () => {
    const blob = new Blob([JSON.stringify(caseIOCs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case_${caseData.case_number}_iocs.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportIocsCsv = () => {
    if (!caseIOCs.length) return;
    const headers = ['id', 'ioc_type', 'value', 'severity', 'description', 'source'];
    const csvContent = [
      headers.join(','),
      ...caseIOCs.map((ioc: any) => headers.map(h => `"${(ioc[h] || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case_${caseData.case_number}_iocs.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportIocsStix = () => {
    const stixBundle = {
      type: "bundle",
      id: `bundle--${Math.random().toString(36).substring(2, 10)}`,
      objects: caseIOCs.map((ioc: any) => ({
        type: "indicator",
        id: `indicator--${ioc.id || Math.random().toString(36).substring(2, 10)}`,
        created: new Date().toISOString(),
        name: ioc.value,
        description: ioc.description,
        pattern: `[${ioc.ioc_type}:value = '${ioc.value}']`,
        pattern_type: "stix",
        valid_from: new Date().toISOString()
      }))
    };
    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case_${caseData.case_number}_iocs_stix.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Back + Header */}
      <div>
        <Link href="/cases" className="inline-flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-accent transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Cases
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-cyber-accent">{caseData.case_number}</span>
              <span className={cn('cyber-badge text-[10px]', getStatusColor(caseData.severity))}>
                {getSeverityIcon(caseData.severity)} {caseData.severity}
              </span>
              <span className={cn('cyber-badge text-[10px]', getStatusColor(caseData.status))}>
                {caseData.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{caseData.title}</h1>
            <p className="text-sm text-cyber-muted mt-1.5 max-w-3xl leading-relaxed">{caseData.description}</p>
            <div className="flex items-center gap-4 mt-3">
              {caseData.tags?.map((tag: string) => (
                <span key={tag} className="text-[10px] text-cyber-muted bg-cyber-surface px-2 py-0.5 rounded-full border border-cyber-border">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="cyber-btn-secondary text-sm" onClick={handleExport}>
              <Download className="w-4 h-4" /> JSON
            </button>
            <button className="cyber-btn-secondary text-sm" onClick={handleExportPdf}>
              <FileType2 className="w-4 h-4" /> PDF Brief
            </button>
            <button className="cyber-btn-secondary text-sm" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Case link copied to clipboard!');
            }}>
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="cyber-btn-primary text-sm" onClick={() => router.push(`/evidence?upload=true&caseId=${caseData.id}`)}>
              <Upload className="w-4 h-4" /> Add Evidence
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cyber-surface/50 rounded-xl p-1.5 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                activeTab === tab.id ? 'cyber-tab-active' : 'cyber-tab',
                'flex items-center gap-2'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Metadata */}
            <div className="lg:col-span-2 space-y-6">
              <div className="cyber-card-flat">
                <h3 className="text-sm font-semibold text-white mb-4">Case Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Case Number', caseData.case_number],
                    ['Type', caseData.case_type.replace('_', ' ')],
                    ['Created', formatDate(caseData.created_at)],
                    ['Last Updated', formatDateTime(caseData.updated_at)],
                    ['Lead Investigator', caseData.lead_investigator.full_name],
                    ['Department', caseData.lead_investigator.department],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] text-cyber-muted uppercase tracking-wider">{label}</p>
                      <p className="text-sm text-cyber-text mt-0.5 capitalize">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Evidence', value: caseEvidence.length, color: 'text-cyan-400' },
                  { label: 'Entities', value: caseEntities.length, color: 'text-purple-400' },
                  { label: 'IOCs', value: caseIOCs.length, color: 'text-red-400' },
                  { label: 'Events', value: caseTimeline.length, color: 'text-amber-400' },
                ].map(s => (
                  <div key={s.label} className="cyber-card-flat text-center">
                    <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                    <p className="text-[10px] text-cyber-muted uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Threat Indicators */}
              <div className="cyber-card-flat">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Threat Indicators</h3>
                  </div>
                  <span className="text-[10px] font-medium text-red-400 bg-red-400/10 border border-red-400/30 px-3 py-1 rounded-full">
                    {caseIOCs.length} Active IOCs
                  </span>
                </div>
                
                <div className="space-y-4 mt-6">
                  {caseIOCs.map((ioc: any) => (
                    <div key={ioc.id} className="flex flex-col gap-2 p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border/50 hover:border-cyber-accent/30 transition-colors group cursor-default">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={cn('w-24 text-center py-1 rounded-full text-[10px] border', 
                            ioc.ioc_type === 'ip' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                            ioc.ioc_type === 'domain' ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' :
                            ioc.ioc_type === 'file_name' ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' :
                            'text-cyber-text bg-cyber-surface border-cyber-border'
                          )}>
                            {ioc.ioc_type}
                          </span>
                          <span className="text-sm font-mono text-white truncate max-w-[250px]" title={ioc.value}>
                            {ioc.value.length > 35 ? ioc.value.substring(0, 32) + '...' : ioc.value}
                          </span>
                        </div>
                        <span className={cn('px-4 py-1 rounded-full text-[10px] border',
                          (ioc.threat_level || ioc.severity) === 'critical' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                          (ioc.threat_level || ioc.severity) === 'high' ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' :
                          'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                        )}>
                          {ioc.threat_level || ioc.severity}
                        </span>
                      </div>
                      
                      {/* Summary & Path Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1 pl-[112px]">
                        <p className="text-xs text-cyber-muted truncate max-w-[280px]" title={ioc.description}>
                          {ioc.description || 'No description available.'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {ioc.source && (
                            <span className="text-[10px] text-cyber-text-dim px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border">
                              {ioc.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {caseIOCs.length === 0 && (
                    <p className="text-sm text-cyber-muted text-center py-4">No active threat indicators.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Team & Timeline */}
            <div className="space-y-6">
              <div className="cyber-card-flat">
                <h3 className="text-sm font-semibold text-white mb-3">Assigned Team</h3>
                <div className="space-y-3">
                  {[caseData.lead_investigator, ...caseData.assigned_analysts].map((user, i) => (
                    <div key={user.id + i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{user.full_name.split(' ').map((n: string) => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm text-cyber-text">{user.full_name}</p>
                        <p className="text-[10px] text-cyber-muted capitalize">{i === 0 ? 'Lead Investigator' : user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cyber-card-flat">
                <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {caseTimeline.slice(0, 4).map(event => (
                    <div key={event.id} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent mt-1.5" />
                      <div>
                        <p className="text-xs text-cyber-text">{event.title}</p>
                        <p className="text-[10px] text-cyber-muted">{timeAgo(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== IOCS TAB ===== */}
        {activeTab === 'iocs' && (
          <div className="space-y-6">
            {/* Header & Actions */}
            <div className="cyber-card-flat flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">Threat Indicators</h3>
                  <span className="text-[10px] font-medium text-red-400 bg-red-400/10 border border-red-400/30 px-3 py-1 rounded-full">
                    {caseIOCs.length} Active IOCs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">
                    Critical Risk - {caseIOCs.filter((i:any) => i.threat_level === 'critical' || i.severity === 'critical').length} Critical IOCs detected
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyber-muted mr-2">Export:</span>
                <button className="cyber-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 hover:text-white hover:border-cyber-border-light transition-all" onClick={exportIocsJson}>
                  <FileJson className="w-3.5 h-3.5" /> JSON
                </button>
                <button className="cyber-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 hover:text-white hover:border-cyber-border-light transition-all" onClick={exportIocsCsv}>
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </button>
                <button className="cyber-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 hover:text-white hover:border-cyber-border-light transition-all" onClick={exportIocsStix}>
                  <FileType2 className="w-3.5 h-3.5" /> STIX
                </button>
              </div>
            </div>

            {/* Indicator List */}
            <div className="grid gap-4">
              {caseIOCs.map((ioc: any) => (
                <div key={ioc.id} className="cyber-card-flat bg-cyber-bg/40 hover:bg-cyber-bg/80 hover:border-cyber-accent/30 transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
                  
                  {/* Left Side: Type, Value, Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border',
                        ioc.ioc_type === 'ip' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                        ioc.ioc_type === 'domain' ? 'text-amber-400 bg-amber-400/10 border-amber-400/30' :
                        ioc.ioc_type === 'file_name' ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' :
                        'text-purple-400 bg-purple-400/10 border-purple-400/30'
                      )}>
                        {ioc.ioc_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-mono text-white truncate max-w-sm" title={ioc.value}>
                        {ioc.value.length > 50 ? ioc.value.substring(0, 47) + '...' : ioc.value}
                      </span>
                      <button 
                        className="text-cyber-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100" 
                        title="Copy full value to clipboard"
                        onClick={() => {
                          navigator.clipboard.writeText(ioc.value);
                          alert(`Copied ${ioc.value} to clipboard!`);
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="text-cyber-text-dim max-w-md truncate" title={ioc.description}>
                        {ioc.description || 'No description available'}
                      </span>
                      <span className="text-cyber-border-light hidden sm:inline">|</span>
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-cyber-muted" />
                        <span className="text-cyber-muted">Analysis Category:</span>
                        <span className="text-cyber-text font-medium">{ioc.source || 'Unknown Analysis'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Badges & Actions */}
                  <div className="flex flex-col md:items-end gap-3 flex-shrink-0 border-t md:border-t-0 md:border-l border-cyber-border/50 pt-3 md:pt-0 md:pl-4">
                    <span className={cn('px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border self-start md:self-end shadow-sm',
                      (ioc.threat_level || ioc.severity) === 'critical' ? 'text-red-400 bg-red-400/10 border-red-400/30 shadow-red-500/10' :
                      (ioc.threat_level || ioc.severity) === 'high' ? 'text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-amber-500/10' :
                      'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-emerald-500/10'
                    )}>
                      {ioc.threat_level || ioc.severity}
                    </span>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <button 
                        className="cyber-btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1.5 hover:bg-cyber-accent/10 hover:text-cyber-accent hover:border-cyber-accent/30 transition-colors"
                        onClick={() => setActiveTab('evidence')}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Files
                      </button>
                      <button 
                        className="cyber-btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1.5 hover:bg-cyber-accent/10 hover:text-cyber-accent hover:border-cyber-accent/30 transition-colors"
                        onClick={() => router.push(`/osint?target=${encodeURIComponent(ioc.value)}`)}
                      >
                        <Search className="w-3.5 h-3.5" /> Investigate
                      </button>
                      <button 
                        className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300 rounded px-3 py-1.5 text-[11px] flex items-center gap-1.5 transition-colors font-medium shadow-sm"
                        onClick={() => toast.success(`Block request submitted for ${ioc.value} across all firewall endpoints.`)}
                      >
                        <ShieldBan className="w-3.5 h-3.5" /> Block
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {caseIOCs.length === 0 && (
                <div className="cyber-card-flat text-center py-12 bg-cyber-bg/40">
                  <ShieldCheck className="w-12 h-12 text-cyber-muted mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-white mb-1">No Threat Indicators</h3>
                  <p className="text-cyber-muted">There are currently no active IOCs linked to this case.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== EVIDENCE TAB ===== */}
        {activeTab === 'evidence' && (
          <div className="cyber-card-flat overflow-hidden p-0">
            <div className="p-4 border-b border-cyber-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{caseEvidence.length} Evidence Items</h3>
              <button className="cyber-btn-primary text-xs" onClick={() => router.push(`/evidence?upload=true&caseId=${caseData.id}`)}>
                <Upload className="w-3.5 h-3.5" /> Upload Evidence
              </button>
            </div>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>SHA-256</th>
                  <th>Status</th>
                  <th>Hash ✓</th>
                  <th>Handler</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {caseEvidence.map(ev => (
                  <tr key={ev.id} onClick={() => router.push(`/evidence?id=${ev.id}`)} className="cursor-pointer hover:bg-cyber-accent/5 group">
                    <td><span className="font-mono text-xs text-cyber-accent">{ev.evidence_number}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyber-muted flex-shrink-0" />
                        <span className="text-sm text-cyber-text truncate max-w-[200px]">{ev.file_name}</span>
                      </div>
                    </td>
                    <td><span className="cyber-badge badge-neutral text-[10px]">{ev.evidence_type.replace('_', ' ')}</span></td>
                    <td><span className="text-xs font-mono text-cyber-text-dim">{formatFileSize(ev.file_size)}</span></td>
                    <td><span className="text-[11px] font-mono text-cyber-muted">{truncateHash(ev.sha256_hash, 16)}</span></td>
                    <td><span className={cn('cyber-badge text-[10px]', getStatusColor(ev.status))}>{ev.status}</span></td>
                    <td className="text-center">
                      {ev.hash_verified ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 inline" />
                      )}
                    </td>
                    <td><span className="text-xs text-cyber-text-dim">{ev.handler}</span></td>
                    <td><span className="text-xs text-cyber-muted">{formatDate(ev.upload_date)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== ENTITIES TAB ===== */}
        {activeTab === 'entities' && (
          <div className="cyber-card-flat overflow-hidden p-0">
            <div className="p-4 border-b border-cyber-border">
              <h3 className="text-sm font-semibold text-white">{caseEntities.length} Entities Identified</h3>
            </div>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Label</th>
                  <th>Risk Score</th>
                  <th>First Seen</th>
                  <th>Last Seen</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {caseEntities.map(ent => (
                  <tr key={ent.id}>
                    <td>
                      <span className={cn('cyber-badge text-[10px]',
                        ent.entity_type === 'ip_address' && 'badge-danger',
                        ent.entity_type === 'domain' && 'badge-warning',
                        ent.entity_type === 'email' && 'badge-info',
                        ent.entity_type === 'person' && 'badge-purple',
                        ent.entity_type === 'file_hash' && 'badge-neutral',
                        ent.entity_type === 'cryptocurrency' && 'badge-cyan',
                      )}>
                        {ent.entity_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td><span className="text-sm font-mono text-cyber-text">{ent.value}</span></td>
                    <td><span className="text-sm text-cyber-text-dim">{ent.label}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-cyber-surface rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full',
                            ent.risk_score >= 80 ? 'bg-red-500' : ent.risk_score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          )} style={{ width: `${ent.risk_score}%` }} />
                        </div>
                        <span className="text-xs font-mono text-cyber-text-dim">{ent.risk_score}</span>
                      </div>
                    </td>
                    <td><span className="text-xs text-cyber-muted">{formatDate(ent.first_seen)}</span></td>
                    <td><span className="text-xs text-cyber-muted">{formatDate(ent.last_seen)}</span></td>
                    <td>
                      <div className="flex gap-1">
                        {ent.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] text-cyber-muted bg-cyber-surface px-1.5 py-0.5 rounded border border-cyber-border">{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== TIMELINE TAB ===== */}
        {activeTab === 'timeline' && (
          <div className="cyber-card-flat">
            <h3 className="text-sm font-semibold text-white mb-6">Investigation Timeline</h3>
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-cyber-border" />
              <div className="space-y-6">
                {caseTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((event, i) => (
                  <div key={event.id} className="relative">
                    <div className={cn(
                      'absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 border-cyber-bg',
                      event.severity === 'critical' ? 'bg-red-400' :
                      event.severity === 'high' ? 'bg-amber-400' :
                      event.event_type === 'evidence_added' ? 'bg-cyan-400' :
                      event.event_type === 'entity_discovered' ? 'bg-purple-400' :
                      'bg-cyber-muted'
                    )} />
                    <div className="ml-2 cyber-card group hover:border-cyber-border-light">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{event.title}</p>
                          <p className="text-xs text-cyber-muted mt-1 leading-relaxed">{event.description}</p>
                        </div>
                        {event.severity && (
                          <span className={cn('cyber-badge text-[10px] flex-shrink-0 ml-3', getStatusColor(event.severity))}>
                            {event.severity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-cyber-border/50">
                        <span className="text-[10px] text-cyber-muted">{formatDateTime(event.timestamp)}</span>
                        <span className="text-[10px] text-cyber-accent">{event.actor}</span>
                        <span className="cyber-badge badge-neutral text-[10px]">{event.event_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== GRAPH TAB ===== */}
        {activeTab === 'graph' && (
          <div className="cyber-card-flat">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Entity Relationship Graph</h3>
              <div className="flex gap-2">
                <span className="cyber-badge badge-danger text-[10px]">● IP Address</span>
                <span className="cyber-badge badge-warning text-[10px]">● Domain</span>
                <span className="cyber-badge badge-info text-[10px]">● Email</span>
                <span className="cyber-badge badge-purple text-[10px]">● Person</span>
              </div>
            </div>
            <div className="h-[500px] bg-cyber-bg rounded-xl border border-cyber-border flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 hex-bg opacity-30" />
              {/* Simulated graph nodes */}
              <svg className="w-full h-full" viewBox="0 0 800 500">
                {/* Edges */}
                <line x1="400" y1="180" x2="250" y2="300" stroke="rgba(6,182,212,0.3)" strokeWidth="2" />
                <line x1="400" y1="180" x2="550" y2="280" stroke="rgba(6,182,212,0.3)" strokeWidth="2" />
                <line x1="250" y1="300" x2="150" y2="200" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" />
                <line x1="250" y1="300" x2="350" y2="400" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" />
                <line x1="550" y1="280" x2="650" y2="180" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" />
                <line x1="400" y1="180" x2="350" y2="400" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
                {/* Nodes */}
                <circle cx="400" cy="180" r="28" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.6)" strokeWidth="2" />
                <text x="400" y="175" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">185.220</text>
                <text x="400" y="190" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">.101.42</text>

                <circle cx="250" cy="300" r="24" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.6)" strokeWidth="2" />
                <text x="250" y="295" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="monospace">meridian</text>
                <text x="250" y="308" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="monospace">-cdn.com</text>

                <circle cx="550" cy="280" r="24" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.6)" strokeWidth="2" />
                <text x="550" y="275" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">45.77</text>
                <text x="550" y="290" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="monospace">.65.211</text>

                <circle cx="150" cy="200" r="20" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.6)" strokeWidth="2" />
                <text x="150" y="195" textAnchor="middle" fill="#60a5fa" fontSize="8" fontFamily="monospace">admin@</text>
                <text x="150" y="207" textAnchor="middle" fill="#60a5fa" fontSize="8" fontFamily="monospace">m-cdn</text>

                <circle cx="350" cy="400" r="22" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.6)" strokeWidth="2" />
                <text x="350" y="395" textAnchor="middle" fill="#a78bfa" fontSize="9">Viktor</text>
                <text x="350" y="408" textAnchor="middle" fill="#a78bfa" fontSize="9">Petrov</text>

                <circle cx="650" cy="180" r="18" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.6)" strokeWidth="2" />
                <text x="650" y="175" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">a7f1b2</text>
                <text x="650" y="187" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">c3d4...</text>
              </svg>
              <div className="absolute bottom-4 left-4 text-[10px] text-cyber-muted">
                Interactive graph powered by Cytoscape.js · Drag to pan, scroll to zoom
              </div>
            </div>
          </div>
        )}

        {/* ===== MAP TAB ===== */}
        {activeTab === 'map' && (
          <div className="cyber-card-flat">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Geographic Intelligence Map</h3>
              <span className="text-xs text-cyber-muted">{caseEntities.filter(e => e.entity_type === 'ip_address').length} IP locations plotted</span>
            </div>
            <GeoMap 
              markers={caseEntities
                .filter(e => e.entity_type === 'ip_address')
                .map(e => {
                  let lat = 0, lng = 0;
                  if (e.metadata.country === 'Russia') { lat = 55.7558; lng = 37.6173; }
                  else if (e.metadata.country === 'China') { lat = 39.9042; lng = 116.4074; }
                  else if (e.metadata.country === 'Netherlands') { lat = 52.3676; lng = 4.9041; }
                  
                  return {
                    id: e.id,
                    lat,
                    lng,
                    label: e.value,
                    details: e.metadata.country || 'Unknown',
                    isMalicious: (e.risk_score as number) > 80
                  };
                })}
            />
          </div>
        )}

        {/* ===== AI SUMMARY TAB ===== */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button className="cyber-btn-primary text-sm" onClick={() => toast.success('Final report generation started. This may take a few minutes.')}>
                <Brain className="w-4 h-4" /> Generate Summary
              </button>
              <button className="cyber-btn-secondary text-sm" onClick={() => toast.success('Analyzing timeline and generating next steps...')}>
                <Brain className="w-4 h-4" /> Suggest Next Steps
              </button>
              <button className="cyber-btn-secondary text-sm" onClick={() => toast.success('Scanning case data for missing artifacts...')}>
                <AlertTriangle className="w-4 h-4" /> Find Missing Artifacts
              </button>
            </div>

            {caseAIReports.map(report => (
              <div key={report.id} className="cyber-card-flat">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-white capitalize">{report.report_type.replace('_', ' ')}</h3>
                      <p className="text-[10px] text-cyber-muted">Generated {formatDateTime(report.generated_at)} · {report.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-cyber-muted">Confidence</span>
                      <div className="w-16 h-1.5 bg-cyber-surface rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${report.confidence * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-purple-400 font-mono">{Math.round(report.confidence * 100)}%</span>
                    </div>
                    <span className={cn('cyber-badge text-[10px]', getStatusColor(report.status))}>
                      {report.status}
                    </span>
                  </div>
                </div>
                <div className="bg-cyber-bg rounded-lg p-5 border border-cyber-border">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-sm text-cyber-text-dim leading-relaxed whitespace-pre-wrap">
                      {report.content}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-cyber-border">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] text-amber-400">AI-generated content — Advisory only. Verify all findings independently.</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== AUDIT LOG TAB ===== */}
        {activeTab === 'audit' && (
          <div className="cyber-card-flat overflow-hidden p-0">
            <div className="p-4 border-b border-cyber-border">
              <h3 className="text-sm font-semibold text-white">Audit Trail</h3>
              <p className="text-xs text-cyber-muted mt-0.5">Immutable record of all actions on this case</p>
            </div>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLogs.slice(0, 8).map(log => (
                  <tr key={log.id}>
                    <td><span className="text-xs font-mono text-cyber-muted">{formatDateTime(log.timestamp)}</span></td>
                    <td><span className="text-xs text-cyber-text">{log.user_name}</span></td>
                    <td>
                      <span className={cn('cyber-badge text-[10px]',
                        log.action === 'CREATE' && 'badge-success',
                        log.action === 'UPLOAD' && 'badge-cyan',
                        log.action === 'ACCESS' && 'badge-info',
                        log.action === 'GENERATE' && 'badge-purple',
                        log.action === 'REVIEW' && 'badge-warning',
                        log.action === 'LOGIN' && 'badge-neutral',
                        log.action === 'EXPORT' && 'badge-info',
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td><span className="text-xs text-cyber-muted capitalize">{log.resource_type}</span></td>
                    <td><span className="text-xs text-cyber-text-dim truncate max-w-[250px] block">{log.details}</span></td>
                    <td><span className="text-xs font-mono text-cyber-muted">{log.ip_address}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

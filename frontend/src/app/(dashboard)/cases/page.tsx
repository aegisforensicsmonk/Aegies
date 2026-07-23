'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FolderOpen, Plus, Search, Filter, ArrowUpDown, ArrowUpRight,
  Calendar, Tag, Users, MoreHorizontal, X, MapPin, Sparkles, PenLine, UploadCloud, LayoutGrid, Map, Trash2
} from 'lucide-react';
import { cn, formatDate, getStatusColor, getSeverityIcon } from '@/lib/utils';
import { mockCases, mockEvidence, mockEntities, mockIOCs } from '@/data/mock-data';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const GeoMap = dynamic(() => import('@/components/analysis/GeoMap'), { ssr: false, loading: () => <div className="h-[500px] bg-cyber-bg rounded-xl border border-cyber-border flex items-center justify-center animate-pulse"><Map className="w-16 h-16 text-cyber-muted/30" /></div> });

const statusFilters = ['All', 'Open', 'In Progress', 'Closed', 'Archived'];
const severityFilters = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function CasesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-cyber-border border-t-cyber-accent rounded-full animate-spin" />
      </div>
    }>
      <CasesPageContent />
    </Suspense>
  );
}

function CasesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [casesList, setCasesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showNewCase, setShowNewCase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [crimeType, setCrimeType] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [narrative, setNarrative] = useState('');
  const [manualSectionInput, setManualSectionInput] = useState('');
  const [manualSections, setManualSections] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        // Prototype Persistence: Check local storage first
        const saved = localStorage.getItem('cases_list');
        if (saved) {
          setCasesList(JSON.parse(saved));
          setLoading(false);
          return;
        }

        const response = await fetch('/api/v1/cases');
        if (!response.ok) throw new Error('Failed to fetch cases');
        const data = await response.json();
        setCasesList(data);
        localStorage.setItem('cases_list', JSON.stringify(data));
      } catch (error) {
        console.error(error);
        const { mockCases } = await import('@/data/mock-data');
        setCasesList(mockCases);
        localStorage.setItem('cases_list', JSON.stringify(mockCases));
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowNewCase(true);
      router.replace('/cases');
    }
  }, [searchParams, router]);

  const filteredCases = casesList.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter.toLowerCase().replace(' ', '_')) return false;
    if (severityFilter !== 'All' && c.severity !== severityFilter.toLowerCase()) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.case_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSaveFIR = async () => {
    if (!title) return;
    
    setIsSubmitting(true);
    const severityMap: Record<string, string> = {
      'Critical': 'critical',
      'High': 'high',
      'Normal': 'medium',
      'Low': 'low'
    };

    try {
      const response = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'New Registered FIR',
          description: narrative || 'No description provided.',
          severity: severityMap[priority] || 'medium',
          case_type: crimeType || 'General',
          tags: ['FIR', crimeType || 'General', ...manualSections, ...aiSuggestions].filter(Boolean)
        })
      });
      
      if (!response.ok) throw new Error('Failed to save FIR');
      
      const newCase = await response.json();
      const updatedCases = [newCase, ...casesList];
      setCasesList(updatedCases);
      localStorage.setItem('cases_list', JSON.stringify(updatedCases));
      
      // Handle Evidence Upload if a file was selected
      if (selectedFile) {
        const newEvidence = {
          id: `ev-${Date.now()}`,
          evidence_number: `EV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          case_id: newCase.id,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type || 'application/octet-stream',
          evidence_type: 'other',
          sha256_hash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          md5_hash: Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
          source: 'Initial Report Upload',
          handler: 'Current User',
          status: 'processing',
          hash_verified: true,
          upload_date: new Date().toISOString(),
          metadata: {
            "Original Filename": selectedFile.name,
            "MIME Type": selectedFile.type || 'application/octet-stream'
          },
          description: narrative || 'Uploaded during case creation.'
        };
        
        // Save to evidence_list in local storage
        const savedEvidence = localStorage.getItem('evidence_list');
        const evList = savedEvidence ? JSON.parse(savedEvidence) : mockEvidence;
        localStorage.setItem('evidence_list', JSON.stringify([newEvidence, ...evList]));
      }

      setShowNewCase(false);
      
      // Reset form
      setTitle('');
      setCrimeType('');
      setPriority('Normal');
      setNarrative('');
      setManualSections([]);
      setAiSuggestions([]);
      setAiReport(null);
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiIntelligence = async () => {
    let currentNarrative = narrative;
    if (!currentNarrative) {
      currentNarrative = "On the evening of 21st July 2026, I received a fraudulent email that appeared to be from my bank. I inadvertently clicked a link and provided my login details. Shortly after, ₹1,50,000 was transferred out of my account. The attackers also gained unauthorized access to my social media accounts, locked me out, and started posting defamatory messages and asking my contacts for money under my name.";
      setNarrative(currentNarrative);
    }
    
    setIsAnalyzing(true);
    setAiReport(null);
    setAiSuggestions([]); // clear old suggestions
    
    try {
      const response = await fetch('/api/v1/cases/analyze-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrative: currentNarrative })
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setAiReport(data);
    } catch (error) {
      console.error("AI Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSection = () => {
    if (manualSectionInput.trim()) {
      setManualSections([...manualSections, manualSectionInput.trim()]);
      setManualSectionInput('');
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-cyber-accent" />
            Cases
          </h1>
          {!loading && <p className="text-sm text-cyber-muted mt-1">{casesList.length} total cases · {casesList.filter(c => c.status === 'in_progress' || c.status === 'open').length} active</p>}
        </div>
        <button onClick={() => setShowNewCase(true)} className="cyber-btn-primary">
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="cyber-card-flat">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
            <input
              type="text"
              placeholder="Search cases..."
              className="cyber-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Status Filter */}
          <div className="flex gap-1 bg-cyber-surface rounded-lg p-1">
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  statusFilter === f ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30' : 'text-cyber-muted hover:text-cyber-text'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Severity Filter */}
          <div className="flex gap-1 bg-cyber-surface rounded-lg p-1">
            {severityFilters.map((f) => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  severityFilter === f ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30' : 'text-cyber-muted hover:text-cyber-text'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {/* View Toggle */}
          <div className="flex gap-1 bg-cyber-surface rounded-lg p-1 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-1.5 rounded-md transition-all', viewMode === 'grid' ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30' : 'text-cyber-muted hover:text-cyber-text')}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn('p-1.5 rounded-md transition-all', viewMode === 'map' ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/30' : 'text-cyber-muted hover:text-cyber-text')}
              title="Map View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="overflow-hidden p-0">
        {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-cyber-border border-t-cyber-accent rounded-full animate-spin" />
        </div>
      ) : viewMode === 'map' ? (
        <div className="cyber-card-flat overflow-hidden p-0">
          <GeoMap 
            markers={filteredCases.flatMap(c => {
              const ips = mockEntities.filter(e => e.case_id === c.id && e.entity_type === 'ip_address');
              return ips.map(ip => {
                let lat = 0, lng = 0;
                if (ip.metadata.country === 'Russia') { lat = 55.7558; lng = 37.6173; }
                else if (ip.metadata.country === 'China') { lat = 39.9042; lng = 116.4074; }
                else if (ip.metadata.country === 'Netherlands') { lat = 52.3676; lng = 4.9041; }
                else { lat = 20; lng = 0; }
                
                return {
                  id: `${c.id}-${ip.id}`,
                  lat,
                  lng,
                  label: `${c.case_number}: ${ip.value}`,
                  details: `${c.title} - ${ip.metadata.country || 'Unknown'}`,
                  isMalicious: (ip.risk_score as number) > 80
                };
              });
            })}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map(caseItem => (
            <Link href={`/cases/${caseItem.id}`} key={caseItem.id} className="cyber-card-flat group hover:border-cyber-accent/30 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-cyber-accent font-mono bg-cyber-accent/10 px-2 py-1 rounded">
                    {caseItem.case_number}
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-2 group-hover:text-cyber-accent transition-colors line-clamp-1">{caseItem.title}</h3>
                </div>
                <button 
                  className="text-cyber-muted hover:text-red-400 transition-colors z-10"
                  title="Remove Case"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      // Delete from backend API (optional for prototype)
                      await fetch(`/api/v1/cases/${caseItem.id}`, { method: 'DELETE' }).catch(() => {});
                      
                      const updatedCases = casesList.filter(c => c.id !== caseItem.id);
                      setCasesList(updatedCases);
                      localStorage.setItem('cases_list', JSON.stringify(updatedCases));
                      
                      // Cascade delete evidence in local storage
                      const savedEvidence = localStorage.getItem('evidence_list');
                      if (savedEvidence) {
                        const parsed = JSON.parse(savedEvidence);
                        const filtered = parsed.filter((ev: any) => ev.case_id !== caseItem.id);
                        localStorage.setItem('evidence_list', JSON.stringify(filtered));
                      }
                      
                      toast.success(`Case ${caseItem.case_number} and its details removed permanently.`);
                    } catch (error) {
                      toast.error('Failed to remove case.');
                      console.error(error);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={cn('cyber-badge', getStatusColor(caseItem.status))}>
                  {caseItem.status.replace('_', ' ')}
                </span>
                <span className="flex items-center text-xs text-cyber-muted font-medium bg-cyber-bg px-2 py-0.5 rounded border border-cyber-border">
                  {getSeverityIcon(caseItem.severity)}
                  <span className="ml-1 capitalize">{caseItem.severity}</span>
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-xs text-cyber-muted">
                  <Calendar className="w-3.5 h-3.5 text-cyber-accent/70" />
                  <span>Opened {formatDate(caseItem.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-cyber-muted">
                  <Users className="w-3.5 h-3.5 text-cyber-accent/70" />
                  <span>{caseItem.lead_investigator?.full_name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-cyber-muted">
                  <Tag className="w-3.5 h-3.5 text-cyber-accent/70" />
                  <div className="flex gap-1 flex-wrap">
                    {caseItem.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-1.5 py-0.5 bg-cyber-bg rounded text-[10px] text-cyber-text-dim border border-cyber-border">{t}</span>
                    ))}
                    {caseItem.tags.length > 3 && <span className="text-[10px]">+{caseItem.tags.length - 3}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-cyber-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-cyber-text">{mockEvidence.filter(e => e.case_id === caseItem.id || e.case_id === caseItem.case_number).length}</p>
                  <p className="text-[10px] text-cyber-muted uppercase tracking-wider">Evidence</p>
                </div>
                <div className="w-px h-8 bg-cyber-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-cyber-text">{mockEntities.filter(e => e.case_id === caseItem.id || e.case_id === caseItem.case_number).length}</p>
                  <p className="text-[10px] text-cyber-muted uppercase tracking-wider">Entities</p>
                </div>
                <div className="w-px h-8 bg-cyber-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-cyber-text">{mockIOCs.filter(i => i.case_id === caseItem.id || i.case_id === caseItem.case_number).length}</p>
                  <p className="text-[10px] text-cyber-muted uppercase tracking-wider">IOCs</p>
                </div>
              </div>
            </Link>
          ))}
          {filteredCases.length === 0 && (
            <div className="col-span-full py-12 text-center text-cyber-muted">
              No cases found matching your filters.
            </div>
          )}
        </div>
      )}
      </div>

      {/* New Case Modal */}
      {showNewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowNewCase(false)}>
          <div className="bg-cyber-card border border-cyber-border rounded-xl w-full max-w-4xl my-auto relative animate-slide-up flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-cyber-border flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Register new FIR</h2>
              <button type="button" onClick={() => setShowNewCase(false)} className="text-cyber-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              {/* General Details */}
              <div>
                <h3 className="text-sm font-semibold text-cyber-accent mb-4 border-b border-cyber-border/50 pb-2">General Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">FIR Number</label>
                    <input type="text" className="cyber-input bg-cyber-accent/5 border-cyber-accent/30 text-cyber-accent" defaultValue="FIR/2026/017" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Title</label>
                    <input type="text" className="cyber-input" placeholder="Brief title" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Crime type</label>
                    <input type="text" className="cyber-input" placeholder="e.g. Burglary" value={crimeType} onChange={e => setCrimeType(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Priority Level</label>
                    <select className="cyber-input" value={priority} onChange={e => setPriority(e.target.value)}>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Police station</label>
                    <input type="text" className="cyber-input" placeholder="e.g. Sector 21 PS" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">District</label>
                    <input type="text" className="cyber-input" placeholder="e.g. Gandhinagar" />
                  </div>
                </div>
              </div>

              {/* Incident Details */}
              <div>
                <h3 className="text-sm font-semibold text-cyber-accent mb-4 border-b border-cyber-border/50 pb-2">Incident Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-cyber-muted mb-1.5">FIR Date & Time</label>
                      <input type="datetime-local" className="cyber-input" defaultValue="2026-07-21T22:09" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-cyber-muted mb-1.5">Incident Date & Time</label>
                      <input type="datetime-local" className="cyber-input" defaultValue="2026-07-21T22:09" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Incident Location (GPS)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                      <input type="text" className="cyber-input pl-9" placeholder="Enter location or drop pin..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Narrative</label>
                    <div className="relative">
                      <textarea 
                        className="cyber-input h-32 resize-none pb-12" 
                        placeholder="Describe the incident to get AI section suggestions..." 
                        value={narrative}
                        onChange={e => setNarrative(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={handleAiIntelligence}
                        disabled={isAnalyzing}
                        className="absolute bottom-3 right-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-colors"
                      >
                        {isAnalyzing ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" /> AI Legal Intelligence</>
                        )}
                      </button>
                    </div>
                  </div>
                  {aiReport && (
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-5 space-y-5">
                      <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
                        <Sparkles className="w-4 h-4" />
                        AI Legal Analysis Report
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                        {/* Facts & Issues */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-cyber-muted mb-1.5">Fact Extraction</h4>
                            <ul className="list-disc list-outside ml-3 text-cyber-text space-y-1">
                              {aiReport.fact_extraction?.map((fact: string, i: number) => (
                                <li key={i}>{fact}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-cyber-muted mb-1.5">Core Legal Issues</h4>
                            <ul className="list-disc list-outside ml-3 text-cyber-text space-y-1">
                              {aiReport.core_issues?.map((issue: string, i: number) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* FIR Draft */}
                        <div>
                          <h4 className="font-semibold text-cyber-muted mb-1.5">Suggested FIR Paragraph</h4>
                          <div className="bg-cyber-surface border border-cyber-border rounded p-3 text-cyber-text text-[11px] leading-relaxed font-mono">
                            {aiReport.fir_paragraph}
                          </div>
                        </div>
                      </div>

                      {/* Provisions */}
                      <div className="border-t border-orange-500/20 pt-4">
                        <h4 className="font-semibold text-cyber-muted mb-3">Recommended Provisions</h4>
                        <div className="space-y-2">
                          {aiReport.core_provisions?.map((prov: any, i: number) => (
                            <div key={`core-${i}`} className="bg-cyber-surface border border-cyber-border rounded p-3 flex justify-between items-start gap-4 hover:border-orange-500/30 transition-colors">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-white text-xs">{prov.name}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-green-500/20 text-green-400 font-medium border border-green-500/30">Core</span>
                                </div>
                                <p className="text-xs text-cyber-muted">{prov.reason}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (!manualSections.includes(prov.name)) setManualSections([...manualSections, prov.name]);
                                }}
                                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-cyber-bg hover:bg-orange-500/20 hover:text-orange-400 rounded text-xs transition-colors border border-cyber-border hover:border-orange-500/40"
                              >
                                <Plus className="w-3 h-3" /> Add
                              </button>
                            </div>
                          ))}
                          
                          {aiReport.conditional_provisions?.map((prov: any, i: number) => (
                            <div key={`cond-${i}`} className="bg-cyber-surface border border-cyber-border rounded p-3 flex justify-between items-start gap-4 opacity-80 hover:opacity-100 transition-opacity">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-cyber-text text-xs">{prov.name}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-orange-500/20 text-orange-400 font-medium border border-orange-500/30">Conditional</span>
                                </div>
                                <p className="text-xs text-cyber-muted italic">{prov.reason}</p>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  if (!manualSections.includes(prov.name)) setManualSections([...manualSections, prov.name]);
                                }}
                                className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-cyber-bg hover:bg-orange-500/20 hover:text-orange-400 rounded text-xs transition-colors border border-cyber-border hover:border-orange-500/40"
                              >
                                <Plus className="w-3 h-3" /> Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Excluded */}
                      <div className="border-t border-orange-500/20 pt-4">
                        <h4 className="font-semibold text-cyber-muted mb-2">Explicitly Excluded Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {aiReport.excluded_categories?.map((cat: any, i: number) => (
                            <div key={i} className="px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs group relative cursor-help">
                              <span className="text-red-400 line-through decoration-red-500/50">{cat.name}</span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-cyber-card border border-cyber-border rounded text-[10px] text-cyber-text hidden group-hover:block z-10 shadow-xl pointer-events-none">
                                {cat.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-cyber-muted text-center italic mt-4 pt-4 border-t border-orange-500/10">
                        This is legal information generated by AI and must be verified by a qualified advocate before use in any legal proceeding.
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Manual Sections (Optional)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="cyber-input flex-1" 
                        placeholder="e.g. BNS 101" 
                        value={manualSectionInput}
                        onChange={e => setManualSectionInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSection();
                          }
                        }}
                      />
                      <button type="button" onClick={handleAddSection} className="cyber-btn-secondary whitespace-nowrap">Add section</button>
                    </div>
                    {/* Display sections */}
                    {(manualSections.length > 0 || aiSuggestions.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {aiSuggestions.map((section, idx) => (
                          <span 
                            key={`ai-${idx}`} 
                            className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded text-xs flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3 h-3" /> {section}
                            <div className="flex items-center gap-1 ml-1 border-l border-orange-500/30 pl-2">
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (!manualSections.includes(section)) {
                                    setManualSections([...manualSections, section]);
                                  }
                                  setAiSuggestions(aiSuggestions.filter((_, i) => i !== idx));
                                }}
                                className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/20 hover:bg-orange-500/40 rounded transition-colors"
                              >
                                <Plus className="w-3 h-3" /> Add
                              </button>
                            </div>
                          </span>
                        ))}
                        {aiSuggestions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setAiSuggestions([])}
                            className="px-2 py-1 text-xs text-cyber-muted hover:text-white transition-colors flex items-center gap-1 border border-transparent hover:border-cyber-border rounded"
                            title="Remove all remaining AI suggestions"
                          >
                            <X className="w-3 h-3" /> Dismiss all suggestions
                          </button>
                        )}
                        {manualSections.map((section, idx) => (
                          <span key={`manual-${idx}`} className="px-2 py-1 bg-cyber-surface text-cyber-text border border-cyber-border rounded text-xs flex items-center gap-1.5">
                            {section}
                            <button type="button" onClick={() => setManualSections(manualSections.filter((_, i) => i !== idx))}><X className="w-3 h-3 hover:text-white" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Complainant Details */}
              <div>
                <h3 className="text-sm font-semibold text-cyber-accent mb-4 border-b border-cyber-border/50 pb-2">Complainant Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Name</label>
                    <input type="text" className="cyber-input" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Mobile</label>
                    <input type="text" className="cyber-input" placeholder="+91..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Address</label>
                    <input type="text" className="cyber-input" placeholder="Full address" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">ID Proof</label>
                    <input type="text" className="cyber-input" placeholder="Aadhar / PAN / Driving License" />
                  </div>
                </div>
              </div>

              {/* Persons Involved (Optional) */}
              <div>
                <h3 className="text-sm font-semibold text-cyber-accent mb-4 border-b border-cyber-border/50 pb-2">Persons Involved (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Suspect Details</label>
                    <div className="relative">
                      <textarea className="cyber-input h-20 resize-none" placeholder="Name, description, phone, etc..." />
                      <PenLine className="absolute bottom-3 right-3 w-4 h-4 text-cyber-muted" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cyber-muted mb-1.5">Witness Details</label>
                    <div className="relative">
                      <textarea className="cyber-input h-20 resize-none" placeholder="Name, phone, address, etc..." />
                      <PenLine className="absolute bottom-3 right-3 w-4 h-4 text-cyber-muted" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Upload */}
              <div>
                <h3 className="text-sm font-semibold text-cyber-accent mb-4 border-b border-cyber-border/50 pb-2">Evidence Upload</h3>
                <p className="text-xs text-cyber-muted mb-3">Images, Videos, Documents, Audio recordings</p>
                <div className="border-2 border-dashed border-cyber-border/50 rounded-xl p-8 flex flex-col items-center justify-center bg-cyber-surface/30 hover:bg-cyber-surface/50 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  <UploadCloud className="w-8 h-8 text-cyber-muted group-hover:text-cyber-accent transition-colors mb-3" />
                  {selectedFile ? (
                    <p className="text-sm font-medium text-cyber-accent">{selectedFile.name}</p>
                  ) : (
                    <p className="text-sm text-cyber-text">Click to upload evidence files</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-cyber-border flex justify-end gap-3 bg-cyber-card rounded-b-xl flex-shrink-0">
              <div className="flex justify-end gap-3 pt-6 border-t border-cyber-border">
                <button type="button" onClick={() => setShowNewCase(false)} disabled={isSubmitting} className="cyber-btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveFIR} disabled={isSubmitting} className="cyber-btn-primary flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-cyber-bg border-t-cyber-accent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Register FIR'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

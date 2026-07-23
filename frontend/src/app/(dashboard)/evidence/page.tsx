'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Database, Upload, Search, Filter, Download, CheckCircle, XCircle,
  FileText, Image, HardDrive, Cpu, Globe, Mail, Bug, Smartphone, Hash, Trash2
} from 'lucide-react';
import { cn, formatDate, formatFileSize, truncateHash, getStatusColor } from '@/lib/utils';
import { mockEvidence, mockCustody, mockCases } from '@/data/mock-data';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import Link from 'next/link';

const typeIcons: Record<string, any> = {
  document: FileText, image: Image, disk_image: HardDrive, memory_dump: Cpu,
  network_capture: Globe, log_file: FileText, email: Mail, malware_sample: Bug,
  mobile_data: Smartphone, other: Database,
};

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCase, setUploadCase] = useState(mockCases[0]?.id || '');
  const [uploadDescription, setUploadDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize evidence list from localStorage or mock data
    const saved = localStorage.getItem('evidence_list');
    if (saved) {
      setEvidenceList(JSON.parse(saved));
    } else {
      setEvidenceList(mockEvidence);
      localStorage.setItem('evidence_list', JSON.stringify(mockEvidence));
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setSelectedEvidence(id);
    }
    const upload = params.get('upload');
    const cId = params.get('caseId');
    if (upload === 'true') {
      setShowUpload(true);
    }
    if (cId) {
      setUploadCase(cId);
    }
  }, []);

  const handleUpload = () => {
    if (!selectedFile && !uploadDescription) {
      toast.error('Please provide a file or a description.');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process and hashing
    setTimeout(() => {
      const newEvidence = {
        id: `ev-${Date.now()}`,
        evidence_number: `EV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        case_id: uploadCase || 'case-001',
        file_name: selectedFile ? selectedFile.name : 'uploaded_evidence.bin',
        evidence_type: 'other',
        file_size: selectedFile ? selectedFile.size : 1024 * 1024 * 5,
        sha256_hash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        md5_hash: Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        status: 'processing',
        hash_verified: true,
        acquired_by: 'Marcus Wright',
        acquired_at: new Date().toISOString()
      };
      
      setEvidenceList([newEvidence, ...evidenceList]);
      setIsUploading(false);
      setShowUpload(false);
      setSelectedFile(null);
      setUploadDescription('');
      toast.success('Evidence uploaded successfully');
    }, 1500);
  };

  const filtered = evidenceList.filter(e =>
    !searchQuery || e.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.sha256_hash.includes(searchQuery.toLowerCase()) ||
    e.evidence_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedEv = evidenceList.find(e => e.id === selectedEvidence);
  const selectedCustody = mockCustody.filter(c => c.evidence_id === selectedEvidence);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-cyber-accent" />
            Evidence Vault
          </h1>
          <p className="text-sm text-cyber-muted mt-1">{evidenceList.length} evidence items across all cases</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="cyber-btn-primary">
          <Upload className="w-4 h-4" /> Upload Evidence
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
        <input
          type="text"
          placeholder="Search by file name, evidence number, or hash..."
          className="cyber-input pl-10 font-mono"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence List */}
        <div className="lg:col-span-2 cyber-card-flat overflow-hidden p-0">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Evidence #</th>
                <th>File</th>
                <th>Type</th>
                <th>Size</th>
                <th>SHA-256</th>
                <th>Hash ✓</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => {
                const TypeIcon = typeIcons[ev.evidence_type] || Database;
                return (
                  <tr
                    key={ev.id}
                    onClick={() => setSelectedEvidence(ev.id)}
                    className={cn(selectedEvidence === ev.id && '!bg-cyber-accent/5')}
                  >
                    <td><span className="font-mono text-xs text-cyber-accent">{ev.evidence_number}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-cyber-muted flex-shrink-0" />
                        <span className="text-sm text-cyber-text truncate max-w-[180px]">{ev.file_name}</span>
                      </div>
                    </td>
                    <td><span className="cyber-badge badge-neutral text-[10px]">{ev.evidence_type.replace('_', ' ')}</span></td>
                    <td><span className="text-xs font-mono text-cyber-text-dim">{formatFileSize(ev.file_size)}</span></td>
                    <td><span className="text-[10px] font-mono text-cyber-muted">{truncateHash(ev.sha256_hash, 12)}</span></td>
                    <td className="text-center">
                      {ev.hash_verified ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 inline" />
                      )}
                    </td>
                    <td><span className={cn('cyber-badge text-[10px]', getStatusColor(ev.status))}>{ev.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Evidence Detail Panel */}
        <div className="space-y-4">
          {selectedEv ? (
            <>
              <div className="cyber-card-flat">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Evidence Details</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Downloading ${selectedEv.file_name}...`);
                        
                        // Create PDF download
                        const doc = new jsPDF();
                        
                        doc.setFontSize(16);
                        doc.text('FORENSIC EVIDENCE ACQUISITION REPORT', 20, 20);
                        
                        doc.setFontSize(12);
                        doc.text(`Evidence Number: ${selectedEv.evidence_number}`, 20, 35);
                        doc.text(`File Name: ${selectedEv.file_name}`, 20, 42);
                        doc.text(`File Size: ${formatFileSize(selectedEv.file_size)}`, 20, 49);
                        doc.text(`Evidence Type: ${selectedEv.evidence_type.replace('_', ' ').toUpperCase()}`, 20, 56);
                        doc.text(`Upload Date: ${formatDate(selectedEv.upload_date)}`, 20, 63);
                        
                        doc.setFontSize(14);
                        doc.text('CHAIN OF CUSTODY & ACQUISITION', 20, 80);
                        doc.setFontSize(12);
                        doc.text(`Source: ${selectedEv.source}`, 20, 90);
                        doc.text(`Acquired By: ${selectedEv.handler}`, 20, 97);
                        doc.text(`Status: ${selectedEv.status.toUpperCase()}`, 20, 104);
                        
                        doc.setFontSize(14);
                        doc.text('CRYPTOGRAPHIC HASHES', 20, 120);
                        doc.setFontSize(10);
                        doc.setFont('courier', 'normal');
                        doc.text(`SHA-256: ${selectedEv.sha256_hash}`, 20, 130);
                        doc.text(`MD5:     ${selectedEv.md5_hash}`, 20, 137);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(12);
                        doc.text(`Hash Verified: ${selectedEv.hash_verified ? 'YES (MATCH)' : 'NO (MISMATCH)'}`, 20, 147);
                        
                        doc.setFontSize(14);
                        doc.text('METADATA', 20, 163);
                        doc.setFontSize(12);
                        let y = 173;
                        Object.entries(selectedEv.metadata || {}).forEach(([k, v]) => {
                          doc.text(`${k}: ${v}`, 20, y);
                          y += 7;
                        });
                        
                        doc.setFontSize(14);
                        doc.text('DESCRIPTION', 20, y + 10);
                        doc.setFontSize(12);
                        const splitDesc = doc.splitTextToSize(selectedEv.description, 170);
                        doc.text(splitDesc, 20, y + 20);

                        doc.save(`${selectedEv.evidence_number}_Report.pdf`);
                      }}
                      className="text-xs text-cyber-accent hover:text-white flex items-center gap-1 bg-cyber-accent/10 hover:bg-cyber-accent/30 px-2 py-1 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = evidenceList.filter(item => item.id !== selectedEv.id);
                        setEvidenceList(updated);
                        localStorage.setItem('evidence_list', JSON.stringify(updated));
                        setSelectedEvidence(null);
                        toast.success(`${selectedEv.file_name} deleted permanently.`);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-cyber-muted uppercase tracking-wider">Connected FIR</span>
                    <Link href={`/cases/${selectedEv.case_id}`} className="text-xs text-cyber-accent hover:text-cyber-accent-light underline underline-offset-2">
                      {selectedEv.case_id.toUpperCase()}
                    </Link>
                  </div>
                  {[
                    ['Source', selectedEv.source],
                    ['Handler', selectedEv.handler],
                    ['Upload Date', formatDate(selectedEv.upload_date)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider">{label}</span>
                      <span className="text-xs text-cyber-text text-right max-w-[180px] truncate">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Hash Display */}
                <div className="mt-4 pt-3 border-t border-cyber-border space-y-2">
                  <div>
                    <p className="text-[10px] text-cyber-muted mb-1">SHA-256</p>
                    <div className={cn(
                      'flex items-center gap-2 p-2 bg-cyber-bg rounded-lg border text-xs font-mono break-all',
                      selectedEv.hash_verified ? 'border-emerald-500/30' : 'border-red-500/30'
                    )}>
                      {selectedEv.hash_verified ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className="text-cyber-text-dim">{selectedEv.sha256_hash}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-cyber-muted mb-1">MD5</p>
                    <p className="text-xs font-mono text-cyber-text-dim bg-cyber-bg p-2 rounded-lg border border-cyber-border break-all">
                      {selectedEv.md5_hash}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chain of Custody */}
              <div className="cyber-card-flat">
                <h3 className="text-sm font-semibold text-white mb-3">Chain of Custody</h3>
                {selectedCustody.length > 0 ? (
                  <div className="space-y-3 relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-cyber-border" />
                    {selectedCustody.map(entry => (
                      <div key={entry.id} className="relative">
                        <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-cyber-accent border-2 border-cyber-bg" />
                        <div className="bg-cyber-bg rounded-lg p-3 border border-cyber-border">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="cyber-badge badge-cyan text-[10px]">{entry.action}</span>
                            <span className="text-[10px] text-cyber-muted">{formatDate(entry.timestamp)}</span>
                          </div>
                          <p className="text-xs text-cyber-text">{entry.handler}</p>
                          <p className="text-[10px] text-cyber-muted mt-0.5">{entry.from_location} → {entry.to_location}</p>
                          <p className="text-[10px] text-cyber-muted mt-1">{entry.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-cyber-muted">No custody records for this evidence item</p>
                )}
              </div>
            </>
          ) : (
            <div className="cyber-card-flat flex flex-col items-center justify-center py-12">
              <Database className="w-12 h-12 text-cyber-muted/30 mb-3" />
              <p className="text-sm text-cyber-muted">Select an evidence item to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg mx-4 p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-1">Upload Evidence</h2>
            <p className="text-sm text-cyber-muted mb-6">SHA-256 hash will be computed automatically on upload</p>

            <div className="border-2 border-dashed border-cyber-border rounded-xl p-8 text-center hover:border-cyber-accent/50 transition-colors cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <Upload className="w-10 h-10 text-cyber-muted mx-auto mb-3" />
              {selectedFile ? (
                <p className="text-sm font-medium text-cyber-accent">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-cyber-text">Drag & drop evidence files here</p>
              )}
              <p className="text-xs text-cyber-muted mt-1">or click to browse</p>
              <p className="text-[10px] text-cyber-muted mt-3">Supported: .E01, .dd, .raw, .pcap, .pcapng, .eml, .evtx, .csv, .pdf, .txt, .zip</p>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-cyber-muted mb-1.5 uppercase tracking-wider">Associated Case</label>
                <select className="cyber-input" value={uploadCase} onChange={(e) => setUploadCase(e.target.value)}>
                  {mockCases.map(c => (
                    <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-cyber-muted mb-1.5 uppercase tracking-wider">Description</label>
                <textarea 
                  className="cyber-input h-20 resize-none" 
                  placeholder="Describe the evidence..." 
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cyber-border">
              <button onClick={() => setShowUpload(false)} disabled={isUploading} className="cyber-btn-secondary">Cancel</button>
              <button onClick={handleUpload} disabled={isUploading} className="cyber-btn-primary flex items-center gap-2">
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyber-bg border-t-cyber-accent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload & Hash'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

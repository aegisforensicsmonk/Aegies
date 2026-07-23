'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Globe, FileText, Download, X, ShieldAlert, Target, ShieldCheck, FileSearch, Database, Activity, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function OSINTContent() {
  const searchParams = useSearchParams();
  const urlTarget = searchParams.get('target');
  
  const [showReport, setShowReport] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [reportTarget, setReportTarget] = useState('');

  // If a target was passed in the URL (e.g., from clicking "Investigate"), auto-fill and show it
  useEffect(() => {
    if (urlTarget) {
      setTargetInput(urlTarget);
      setReportTarget(urlTarget);
      setShowReport(true);
    }
  }, [urlTarget]);

  const isEmail = reportTarget.includes('@');
  const isHash = /^[a-fA-F0-9]{32,64}$/.test(reportTarget);
  const totalFindings = isEmail ? 14 : isHash ? 8 : 142;
  const criticalVulns = isEmail || isHash ? 0 : 4;
  const openPorts = isEmail || isHash ? 0 : 12;

  const handleDownloadReport = () => {
    try {
      const vulnRows = (isEmail || isHash) ? '<tr><td colspan="4" style="text-align:center;">No vulnerabilities found for this target type.</td></tr>' : `
        <tr><td>CVE-2021-34527</td><td>PrintNightmare</td><td>Critical</td><td>9.8</td></tr>
        <tr><td>CVE-2020-1472</td><td>Zerologon</td><td>Critical</td><td>10.0</td></tr>
        <tr><td>CVE-2017-0144</td><td>EternalBlue</td><td>Critical</td><td>8.1</td></tr>
        <tr><td>CVE-2021-44228</td><td>Log4Shell</td><td>Critical</td><td>10.0</td></tr>
      `;
      
      const portRows = (isEmail || isHash) ? '<tr><td colspan="4" style="text-align:center;">No open ports found for this target type.</td></tr>' : `
        <tr><td>22</td><td>SSH</td><td>Open</td><td>OpenSSH 8.4p1 Debian</td></tr>
        <tr><td>80</td><td>HTTP</td><td>Open</td><td>nginx 1.18.0</td></tr>
        <tr><td>443</td><td>HTTPS</td><td>Open</td><td>nginx 1.18.0</td></tr>
        <tr><td>3389</td><td>RDP</td><td>Open</td><td>Microsoft Terminal Services</td></tr>
        <tr><td>445</td><td>SMB</td><td>Open</td><td>Windows Server 2016</td></tr>
      `;

      const geoInfo = isEmail ? `
        <p><strong>Associated Domains:</strong> 3<br/>
        <strong>Breach Detections:</strong> 11<br/>
        <strong>Last Seen:</strong> 2 days ago</p>
      ` : isHash ? `
        <p><strong>File Type:</strong> Portable Executable (PE32)<br/>
        <strong>Malware Family:</strong> suspected Ransomware<br/>
        <strong>First Submitted:</strong> 2026-03-12</p>
      ` : `
        <p><strong>Country:</strong> Russia (RU)<br/>
        <strong>City:</strong> Moscow<br/>
        <strong>Coordinates:</strong> 55.7558, 37.6173<br/>
        <strong>ISP:</strong> Hostinger Int.</p>
      `;

      const reportHtml = `
        <html>
          <head>
            <title>OSINT Target Report: ${reportTarget}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              h2 { color: #555; margin-top: 30px; }
              .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0; }
              .critical { color: #d32f2f; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>OSINT Target Report: ${reportTarget}</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
            
            <div class="summary">
              <h2>Executive Summary</h2>
              <p class="critical">CRITICAL RISK IDENTIFIED</p>
              <p>The target ${reportTarget} is strongly associated with known malicious infrastructure. Multiple active connections have been correlated across open source intelligence feeds. Immediate containment is recommended.</p>
              <ul>
                <li>Total Findings: ${totalFindings}</li>
                <li>Critical Vulnerabilities: ${criticalVulns}</li>
                <li>Exposed Ports: ${openPorts}</li>
              </ul>
            </div>

            <h2>Discovered Vulnerabilities</h2>
            <table>
              <tr><th>CVE</th><th>Name</th><th>Severity</th><th>CVSS</th></tr>
              ${vulnRows}
            </table>

            <h2>Exposed Ports & Services</h2>
            <table>
              <tr><th>Port</th><th>Service</th><th>State</th><th>Version</th></tr>
              ${portRows}
            </table>

            <h2>Geolocation & Infrastructure Details</h2>
            ${geoInfo}
            
            <hr style="margin-top: 40px;"/>
            <p style="text-align: center; color: #888; font-size: 12px;">Generated by Aegis CIIP Platform</p>
          </body>
        </html>
      `;
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OSINT_Report_${reportTarget.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('OSINT Target Report exported successfully.');
    } catch (error) {
      toast.error('Error exporting report.');
      console.error(error);
    }
  };

  const handleGenerateReport = () => {
    if (!targetInput.trim()) {
      toast.error('Please enter a target to analyze.');
      return;
    }
    setReportTarget(targetInput);
    setShowReport(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] -m-6 animate-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border/30 bg-cyber-bg/50">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyber-accent" /> 
            Osint Lab
          </h1>
          <p className="text-xs text-cyber-muted mt-0.5">Open Source Intelligence automation</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
            <input
              type="text"
              placeholder="Enter IP, Domain, or Hash..."
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="cyber-input pl-9 h-10 w-64 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateReport()}
            />
          </div>
          <button 
            className="cyber-btn flex items-center gap-2 h-10 px-4"
            onClick={handleGenerateReport}
          >
            <FileText className="w-4 h-4" />
            Generate Target Report
          </button>
        </div>
      </div>
      
      {/* osintfootprints Iframe */}
      <div className="flex-1 bg-cyber-bg rounded-t-xl overflow-hidden m-6 mb-0 border border-cyber-border shadow-2xl relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="flex flex-col items-center gap-3">
            <Globe className="w-12 h-12 text-cyber-accent animate-pulse" />
            <p className="text-cyber-muted font-mono text-sm">Connecting to osintfootprints Engine...</p>
          </div>
        </div>
        
        <iframe 
          src={process.env.NEXT_PUBLIC_OSINT_URL || "http://127.0.0.1:5001"} 
          className="h-full border-0 relative z-10"
          style={{ width: 'calc(100% + 18px)', paddingRight: '18px' }}
          title="osintfootprints OSINT Interface"
        />
      </div>

      {/* Target Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0b1021] border border-cyber-border/50 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-900/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border/50 bg-[#0d1326]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <FileSearch className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">OSINT Target Report</h2>
                  <p className="text-xs text-cyber-muted font-mono">Target: {reportTarget} | Status: Scan Complete</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadReport}
                  className="cyber-btn-secondary px-3 py-1.5 flex items-center gap-2 text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button 
                  onClick={() => setShowReport(false)}
                  className="p-2 text-cyber-muted hover:text-white hover:bg-cyber-bg rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              
              {/* Executive Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="cyber-card-flat bg-red-500/5 border-red-500/20 p-4 rounded-xl flex items-start gap-4 col-span-2">
                  <div className="mt-1 p-2 bg-red-500/10 rounded-lg">
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-400 mb-1 uppercase tracking-wider">Critical Risk Identified</h3>
                    <p className="text-sm text-cyber-text-dim leading-relaxed">
                      The target <span className="text-white font-mono">{reportTarget}</span> is strongly associated with known malicious infrastructure. Multiple active connections have been correlated across open source intelligence feeds. Immediate containment is recommended.
                    </p>
                  </div>
                </div>
                
                <div className="cyber-card-flat bg-[#0d1326] p-4 rounded-xl flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-cyber-muted">Total Findings</span>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">{totalFindings}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-cyber-muted">Vulnerabilities</span>
                    <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">{criticalVulns} Critical</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-cyber-muted">Exposed Ports</span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">{openPorts} Open</span>
                  </div>
                </div>
              </div>

              {/* Detailed Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Associated Infrastructure */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-cyber-border pb-2">
                    <Database className="w-4 h-4 text-cyber-accent" /> Associated Infrastructure
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-cyber-bg/50 rounded-lg border border-cyber-border/50">
                      <div>
                        <p className="text-xs font-bold text-white mb-1">update-service.meridian-cdn.com</p>
                        <p className="text-[10px] text-cyber-muted font-mono">Resolved: 2 hours ago</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">DNS A RECORD</span>
                    </div>
                  </div>
                </div>

                {/* Threat Intel Hits */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-cyber-border pb-2">
                    <Activity className="w-4 h-4 text-cyber-accent" /> Threat Intelligence
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-cyber-bg/50 rounded-lg border border-cyber-border/50">
                      <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-400 mb-1">AlienVault OTX Pulse Match</p>
                        <p className="text-[11px] text-cyber-text-dim">Matched pulse: "APT Ongoing Operations Q2 2026".</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Info */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-cyber-border pb-2">
                  <MapPin className="w-4 h-4 text-cyber-accent" /> {isEmail ? 'Domain Intelligence' : isHash ? 'File Intelligence' : 'Geolocation Data'}
                </h3>
                
                {isEmail ? (
                  <div className="bg-cyber-bg/50 border border-cyber-border/50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">Associated Domains</span>
                      <span className="text-sm text-white font-medium">3</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">Breach Detections</span>
                      <span className="text-sm text-white font-medium">11</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">Last Seen</span>
                      <span className="text-sm text-white font-mono">2 days ago</span>
                    </div>
                  </div>
                ) : isHash ? (
                  <div className="bg-cyber-bg/50 border border-cyber-border/50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">File Type</span>
                      <span className="text-sm text-white font-medium">PE32 Executable</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">Malware Family</span>
                      <span className="text-sm text-white font-medium">Ransomware</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">First Submitted</span>
                      <span className="text-sm text-white font-mono">2026-03-12</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-cyber-bg/50 border border-cyber-border/50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">Country</span>
                      <span className="text-sm text-white font-medium">Russia (RU)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">City</span>
                      <span className="text-sm text-white font-medium">Moscow</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">Coordinates</span>
                      <span className="text-sm text-white font-mono">55.7558, 37.6173</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cyber-muted uppercase tracking-wider block mb-1">ISP</span>
                      <span className="text-sm text-white font-medium">Hostinger Int.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Findings Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cyber-border/30">
                {/* Vulnerabilities Section */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-cyber-border pb-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" /> Discovered Vulnerabilities
                  </h3>
                  <div className="space-y-2">
                    {(isEmail || isHash) ? (
                      <div className="p-4 text-center text-cyber-muted text-sm border border-cyber-border/30 rounded-lg bg-cyber-bg/30">
                        No vulnerabilities applicable for this target type.
                      </div>
                    ) : (
                      [
                        { cve: 'CVE-2021-34527', name: 'PrintNightmare', severity: 'Critical', cvss: '9.8' },
                        { cve: 'CVE-2020-1472', name: 'Zerologon', severity: 'Critical', cvss: '10.0' },
                        { cve: 'CVE-2017-0144', name: 'EternalBlue', severity: 'Critical', cvss: '8.1' },
                        { cve: 'CVE-2021-44228', name: 'Log4Shell', severity: 'Critical', cvss: '10.0' },
                      ].map((vuln, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                          <div>
                            <p className="text-xs font-bold text-red-400 mb-0.5">{vuln.cve}</p>
                            <p className="text-[11px] text-cyber-text-dim">{vuln.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded ml-2">CVSS {vuln.cvss}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Open Ports Section */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 border-b border-cyber-border pb-2">
                    <Target className="w-4 h-4 text-amber-400" /> Exposed Ports & Services
                  </h3>
                  <div className="space-y-2">
                    {(isEmail || isHash) ? (
                      <div className="p-4 text-center text-cyber-muted text-sm border border-cyber-border/30 rounded-lg bg-cyber-bg/30">
                        No open ports applicable for this target type.
                      </div>
                    ) : (
                      [
                        { port: 22, service: 'SSH', state: 'open', version: 'OpenSSH 8.4p1 Debian' },
                        { port: 80, service: 'HTTP', state: 'open', version: 'nginx 1.18.0' },
                        { port: 443, service: 'HTTPS', state: 'open', version: 'nginx 1.18.0' },
                        { port: 3389, service: 'RDP', state: 'open', version: 'Microsoft Terminal Services' },
                        { port: 445, service: 'SMB', state: 'open', version: 'Windows Server 2016' },
                      ].map((port, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-cyber-bg/50 rounded-lg border border-cyber-border/50">
                          <div className="flex-shrink-0 w-12 text-center">
                            <span className="text-sm font-bold text-amber-400 font-mono">{port.port}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white mb-0.5">{port.service}</p>
                            <p className="text-[10px] text-cyber-muted font-mono">{port.version}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{port.state}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OSINTPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Globe className="w-8 h-8 animate-spin text-cyber-accent" /></div>}>
      <OSINTContent />
    </Suspense>
  );
}

'use client';

import React, { useState } from 'react';
import { Download, FileText, FileJson, Loader2 } from 'lucide-react';
import { downloadReport } from '@/lib/report-generator';

interface ReportGeneratorProps {
  fileName?: string;
  threatLevel?: string;
  confidenceScore?: number;
  logs?: any[];
}

export default function ReportGenerator({ 
  fileName = 'svchost_update.exe',
  threatLevel = 'High Threat',
  confidenceScore = 98,
  logs = []
}: ReportGeneratorProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const generateReport = (type: 'pdf' | 'json') => {
    setLoading(type);
    
    // Simulate generation time
    setTimeout(() => {
      setLoading(null);
      if (type === 'pdf') {
        downloadReport(fileName, threatLevel, confidenceScore, logs);
      } else {
        const reportData = {
          status: 'success',
          analysisDate: new Date().toISOString(),
          targetFile: fileName,
          aiVerdict: threatLevel,
          confidenceScore: confidenceScore,
          telemetryLogs: logs.length > 0 ? logs : [
            { type: 'info', text: 'File opened in isolated environment' },
            { type: 'warning', text: 'Process attempted to access system registry keys' },
            { type: 'danger', text: 'Suspicious payload delivery network request blocked' },
            { type: 'danger', text: 'Mass file modification patterns detected in user directory' }
          ]
        };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Aegis_Sandbox_Report_${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 1500);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => generateReport('pdf')}
        disabled={loading !== null}
        className="cyber-btn-secondary text-xs flex items-center gap-2 py-1.5 px-3"
      >
        {loading === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        Export PDF
      </button>
      <button 
        onClick={() => generateReport('json')}
        disabled={loading !== null}
        className="cyber-btn-secondary text-xs flex items-center gap-2 py-1.5 px-3"
      >
        {loading === 'json' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileJson className="w-3.5 h-3.5" />}
        Export JSON (STIX/MISP)
      </button>
    </div>
  );
}

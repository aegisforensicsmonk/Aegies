'use client';

import React, { useState } from 'react';
import { Download, FileText, FileJson, Loader2 } from 'lucide-react';

export default function ReportGenerator() {
  const [loading, setLoading] = useState<string | null>(null);

  const generateReport = (type: 'pdf' | 'json') => {
    setLoading(type);
    
    // Simulate generation time
    setTimeout(() => {
      setLoading(null);
      // In a real app, this would trigger a download from the backend
      const dummyData = type === 'json' ? '{"status": "success", "report": "Aegis Sandbox Full Telemetry"}' : 'Aegis Sandbox PDF Binary Data';
      const blob = new Blob([dummyData], { type: type === 'json' ? 'application/json' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Aegis_Sandbox_Report_invoice_7781.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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

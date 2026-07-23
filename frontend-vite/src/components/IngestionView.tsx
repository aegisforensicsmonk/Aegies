import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface IPDRRecord {
  id: string;
  source_number: string;
  destination_number: string;
  call_type: string;
  start_time: string;
  duration_seconds: number;
  cell_id: string;
}

export function IngestionView() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<IPDRRecord[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState<{current: number, total: number, status: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.');
      return;
    }
    setFile(selectedFile);
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setProgress(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/ipdr/ingest/csv', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.task_id) {
        pollTaskStatus(data.task_id);
      } else {
        setError(data.message || 'Unknown error occurred during ingestion.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the backend server. Is it running?');
      setLoading(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/ipdr/status/${taskId}`);
      const data = await res.json();
      
      setProgress({
        current: data.current || 0,
        total: data.total || 1,
        status: data.status || 'Processing...'
      });

      if (data.state === 'SUCCESS') {
        setSuccessMsg('File processing completed successfully!');
        setLoading(false);
        // Optionally fetch records preview if endpoint exists
      } else if (data.state === 'FAILURE') {
        setError(`Processing failed: ${data.status}`);
        setLoading(false);
      } else {
        setTimeout(() => pollTaskStatus(taskId), 1500);
      }
    } catch (err: any) {
      setError('Error checking task status.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Ingestion</h2>
        <p className="text-muted-foreground mt-1">Upload IPDR/CDR exports for normalization and analysis.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div 
          className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border bg-card hover:border-primary/50 hover:bg-accent/30'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv" 
            className="hidden" 
          />
          
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Click or drag file to this area</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Supported format: CSV exports from telecom providers
          </p>
        </div>

        <div className="border rounded-xl bg-card p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-semibold mb-4 text-lg">Upload Status</h3>
            
            {!file && !loading && !records.length && (
              <div className="flex flex-col items-center justify-center text-muted-foreground h-32 border border-dashed rounded-lg bg-muted/20">
                <FileText className="w-6 h-6 mb-2 opacity-50" />
                <span className="text-sm">No file selected</span>
              </div>
            )}
            
            {file && !loading && !successMsg && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-accent rounded-lg border">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              </div>
            )}
            
            {loading && !progress && (
              <div className="flex flex-col items-center justify-center space-y-3 h-32 bg-muted/10 rounded-lg border">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium animate-pulse text-muted-foreground">Uploading file...</p>
              </div>
            )}

            {loading && progress && (
              <div className="flex flex-col justify-center space-y-3 h-32 bg-muted/10 rounded-lg border px-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{progress.status}</span>
                  <span className="text-muted-foreground">{Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((progress.current / Math.max(progress.total, 1)) * 100))}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">{progress.current} / {progress.total} records</p>
              </div>
            )}
            
            {error && (
              <div className="flex gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 items-start mt-4">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="flex gap-3 p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg border border-green-500/20 items-start">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Success</p>
                  <p className="text-sm opacity-90">{successMsg}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-6 mt-auto">
            <button 
              onClick={(e) => { e.stopPropagation(); uploadFile(); }}
              disabled={!file || loading}
              className={`w-full py-2.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors
                ${!file || loading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'}
              `}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Processing...' : 'Start Ingestion'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      {records.length > 0 && (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h3 className="font-semibold">Normalized Preview</h3>
            <p className="text-sm text-muted-foreground">First few records successfully transformed to canonical format</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b">
                <tr>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Destination</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Time (UTC)</th>
                  <th className="px-6 py-3 font-medium text-right">Duration (s)</th>
                  <th className="px-6 py-3 font-medium">Cell ID</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t-0">
                {records.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 font-medium font-mono text-xs text-primary">{r.source_number}</td>
                    <td className="px-6 py-3 font-medium font-mono text-xs">{r.destination_number}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-accent border rounded text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.call_type}</span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap tabular-nums text-muted-foreground">{new Date(r.start_time).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{r.duration_seconds}</td>
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{r.cell_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length > 5 && (
              <div className="px-6 py-3 text-center border-t text-sm font-medium text-muted-foreground bg-muted/10">
                + {records.length - 5} more records not shown
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

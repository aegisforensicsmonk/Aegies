'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SecureUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error('File exceeds 100MB limit');
      return;
    }
    setFile(selectedFile);
    setStatus('idle');
    setUploadProgress(0);
  };

  const uploadFile = async () => {
    if (!file) return;
    setStatus('uploading');
    
    // Simulate upload progress since backend is not running
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // In a real scenario we use axios with onUploadProgress
      // const formData = new FormData();
      // formData.append('file', file);
      // await axios.post('/api/analysis/upload', formData, ...);

      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      setStatus('success');
      toast.success('Sample securely uploaded for analysis');
      
      // Removed auto-reset to allow user to click "View Analysis"
    } catch (error) {
      clearInterval(interval);
      setStatus('error');
      toast.error('Failed to upload sample');
    }
  };

  return (
    <div className="cyber-card-flat max-w-2xl mx-auto mt-8 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 border-b border-cyber-border pb-4">
        <ShieldCheck className="w-6 h-6 text-cyber-accent" />
        <div>
          <h2 className="text-lg font-bold text-white">Secure Upload Portal</h2>
          <p className="text-xs text-cyber-muted">Submit malware samples for automated analysis</p>
        </div>
      </div>

      <form 
        onDragEnter={handleDrag}
        onSubmit={(e) => e.preventDefault()}
        className="relative"
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          onChange={handleChange}
        />
        
        {!file ? (
          <div 
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
              dragActive ? "border-cyber-accent bg-cyber-accent/5" : "border-cyber-border hover:border-cyber-accent/50 hover:bg-cyber-surface"
            )}
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-cyber-muted mx-auto mb-4" />
            <p className="text-cyber-text font-medium mb-1">Drag and drop file here</p>
            <p className="text-xs text-cyber-muted">Max file size: 100MB</p>
          </div>
        ) : (
          <div className="border border-cyber-border rounded-xl p-6 bg-cyber-surface">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyber-bg rounded-lg flex items-center justify-center border border-cyber-border">
                  <File className="w-6 h-6 text-cyber-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[300px]">{file.name}</p>
                  <p className="text-xs text-cyber-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              
              {status === 'idle' && (
                <button 
                  onClick={() => setFile(null)}
                  className="p-2 text-cyber-muted hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {status === 'success' && <CheckCircle className="w-6 h-6 text-green-400" />}
              {status === 'error' && <AlertCircle className="w-6 h-6 text-red-400" />}
            </div>

            {status !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-cyber-muted">
                  <span>{status === 'uploading' ? 'Uploading...' : status === 'success' ? 'Upload Complete' : 'Upload Failed'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-cyber-bg rounded-full h-2 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      status === 'error' ? "bg-red-500" : status === 'success' ? "bg-green-500" : "bg-cyber-accent"
                    )}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {status === 'idle' && (
              <button 
                onClick={uploadFile}
                className="w-full cyber-btn-primary py-3 flex justify-center mt-4"
              >
                Start Secure Upload
              </button>
            )}

            {status === 'success' && (
              <Link 
                href="/ransomware"
                className="w-full cyber-btn-primary bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30 py-3 flex justify-center mt-4 items-center gap-2"
              >
                View Analysis Report <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

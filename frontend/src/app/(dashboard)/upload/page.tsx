import React from 'react';
import SecureUpload from '@/components/upload/SecureUpload';

export default function UploadPage() {
  return (
    <div className="space-y-6 animate-in pb-12">
      <div className="border-b border-cyber-border/50 pb-4">
        <h1 className="text-2xl font-bold text-white">Upload Center</h1>
        <p className="text-sm text-cyber-muted mt-1">Submit malware samples for AI-powered hybrid analysis.</p>
      </div>

      <SecureUpload />
      
      <div className="mt-8 text-center text-xs text-cyber-muted">
        <p>All uploads are securely transferred to isolated MinIO storage and immediately queued for analysis.</p>
        <p>Allowed extensions: .exe, .dll, .apk, .elf, .pdf, .docx, .js, .vbs, .ps1, .zip</p>
      </div>
    </div>
  );
}

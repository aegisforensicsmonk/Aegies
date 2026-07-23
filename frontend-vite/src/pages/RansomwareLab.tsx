import React, { useState, useEffect } from 'react';

const RansomwareLab = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('IDLE');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ransomware/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setTaskId(data.task_id);
      setStatus(data.status);
    } catch (error) {
      console.error('Upload failed', error);
      setStatus('FAILED');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (taskId && (status === 'PENDING' || status === 'RUNNING')) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(http://localhost:8000/api/v1/ransomware/task/);
          const data = await response.json();
          setStatus(data.status);
          if (data.status === 'COMPLETED' || data.status === 'FAILED') {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Status check failed', error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [taskId, status]);

  return (
    <div className="p-8 max-w-4xl mx-auto text-white font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Ransomware & Malware Lab</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Submit Sample</h2>
        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-500 cursor-pointer"
          />
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || status === 'RUNNING'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-md font-medium transition-colors"
          >
            {status === 'RUNNING' ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Panel */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Pipeline Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
              <span className="text-gray-400">Task ID</span>
              <span className="font-mono text-sm">{taskId || 'None'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
              <span className="text-gray-400">Status</span>
              <span className={px-3 py-1 rounded text-sm font-bold }>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* AI Summary Placeholder */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">AI Analyst Summary</h2>
          {status === 'COMPLETED' ? (
            <div className="prose prose-invert prose-sm">
              <p className="text-gray-300">
                Analysis complete. The sample exhibits behaviors consistent with known ransomware families, including mass file encryption and volume shadow copy deletion.
              </p>
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200">
                <strong>Threat Level:</strong> CRITICAL (Score: 92/100)
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm">
                Download Full Report (PDF)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 italic pb-8">
              {status === 'RUNNING' ? 'Waiting for analysis to complete...' : 'Submit a sample to view findings.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RansomwareLab;

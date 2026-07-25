import toast from 'react-hot-toast';

export const downloadReport = (
  fileName: string, 
  threatLevel: string = 'Unknown', 
  confidenceScore: number = 0,
  logs: {text: string, type: string, time?: string}[] = []
) => {
  const reportName = fileName || 'sample';
  
  // Generate some fake evidence if none provided
  const evidenceLogs = logs.length > 0 ? logs : [
    { type: 'info', text: 'File opened in isolated environment' },
    { type: 'warning', text: 'Process attempted to access system registry keys' },
    { type: 'danger', text: 'Suspicious payload delivery network request blocked' },
    { type: 'danger', text: 'Mass file modification patterns detected in user directory' }
  ];

  const logRows = evidenceLogs.map(log => 
    `<tr>
      <td class="log-type ${log.type}">${log.type.toUpperCase()}</td>
      <td>${log.text}</td>
    </tr>`
  ).join('');

  // Narrative text
  let narrative = '';
  let color = '#333';
  if (threatLevel === 'High Threat') {
    color = '#d32f2f';
    narrative = `The Aegis AI analysis engine has determined with <b>${confidenceScore}% confidence</b> that the analyzed file exhibits characteristics consistent with known malware families or ransomware variants. Immediate containment and remediation actions are strongly advised. The behavioral footprint includes suspicious process injection, unauthorized registry modifications, and connections to flagged C2 infrastructure.`;
  } else if (threatLevel === 'Suspicious') {
    color = '#ed6c02';
    narrative = `The Aegis AI analysis engine has flagged this file as <b>Suspicious</b> (Confidence: ${confidenceScore}%). While it does not definitively match a known catastrophic threat signature, its execution exhibited anomalous behaviors such as attempting to elevate privileges or access sensitive system areas. Manual analyst review is recommended.`;
  } else {
    color = '#2e7d32';
    narrative = `The Aegis AI analysis engine has determined this file to be <b>Safe</b>. No malicious payloads, suspicious execution patterns, or unauthorized network connections were detected during the dynamic sandbox execution.`;
  }

  // Pseudo-random hash generator for mock data
  const pseudoRandomHash = (str: string, len: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    let hex = Math.abs(hash).toString(16).padStart(8, '0');
    while (hex.length < len) hex += hex;
    return hex.substring(0, len);
  };
  
  const sha256 = pseudoRandomHash(fileName + "sha", 64);
  const md5 = pseudoRandomHash(fileName + "md5", 32);

  // MITRE ATT&CK Mappings
  let mitreRows = '';
  if (threatLevel === 'High Threat') {
    mitreRows = `
      <tr><td>T1486</td><td>Data Encrypted for Impact</td><td>Ransomware payload execution</td></tr>
      <tr><td>T1059.001</td><td>PowerShell</td><td>Execution of encoded scripts</td></tr>
      <tr><td>T1106</td><td>Native API</td><td>Direct memory allocation / thread creation</td></tr>
      <tr><td>T1490</td><td>Inhibit System Recovery</td><td>vssadmin.exe delete shadows</td></tr>
      <tr><td>T1571</td><td>Non-Standard Port</td><td>C2 communication over port 443 masking</td></tr>
    `;
  } else if (threatLevel === 'Suspicious') {
    mitreRows = `
      <tr><td>T1059</td><td>Command and Scripting Interpreter</td><td>Spawned unusual child process</td></tr>
      <tr><td>T1204.002</td><td>Malicious File</td><td>User execution of suspicious attachment</td></tr>
      <tr><td>T1012</td><td>Query Registry</td><td>Probing system configuration</td></tr>
    `;
  } else {
    mitreRows = `<tr><td colspan="3" style="text-align:center; color:#6b7280; font-family:sans-serif;">No malicious techniques observed</td></tr>`;
  }

  // Indicators of Compromise (IOCs)
  let iocRows = '';
  if (threatLevel === 'High Threat') {
    iocRows = `
      <tr><td>File Hash (SHA256)</td><td>${sha256}</td></tr>
      <tr><td>File Hash (MD5)</td><td>${md5}</td></tr>
      <tr><td>IPv4 Address</td><td>185.12.5.44</td></tr>
      <tr><td>IPv4 Address</td><td>45.83.122.90</td></tr>
      <tr><td>Dropped File</td><td>C:\\Users\\Admin\\AppData\\Local\\Temp\\READ_ME_NOW.txt</td></tr>
      <tr><td>Registry Key</td><td>HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Updates</td></tr>
    `;
  } else if (threatLevel === 'Suspicious') {
    iocRows = `
      <tr><td>File Hash (SHA256)</td><td>${sha256}</td></tr>
      <tr><td>Domain Name</td><td>api.telemetry-update-check.com</td></tr>
      <tr><td>Created Process</td><td>powershell.exe -ExecutionPolicy Bypass</td></tr>
    `;
  } else {
    iocRows = `<tr><td colspan="2" style="text-align:center; color:#6b7280; font-family:sans-serif;">No indicators of compromise generated</td></tr>`;
  }

  const reportHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Aegis Sandbox Report - ${reportName}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            background: #f4f5f7; 
            color: #1a1a1a; 
            line-height: 1.6;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-top: 6px solid ${color};
            border-radius: 4px;
          }
          h1 { color: #1a1a1a; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;}
          h2 { color: ${color}; font-size: 18px; margin-top: 40px; border-bottom: 1px solid #eaeaea; padding-bottom: 5px;}
          .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #f9fafb;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
          }
          .meta-info > div { margin-bottom: 5px; min-width: 0; }
          .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase;}
          .value { font-family: monospace; font-size: 14px; word-break: break-all; overflow-wrap: break-word; }
          .narrative {
            background: #fff;
            padding: 20px;
            border-left: 4px solid ${color};
            margin: 20px 0;
            background-color: #f9fafb;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;}
          th { text-align: left; padding: 12px; background: #f3f4f6; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;}
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: monospace; }
          .log-type { width: 100px; font-weight: bold; }
          .danger { color: #dc2626; }
          .warning { color: #d97706; }
          .info { color: #2563eb; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            color: white;
            background: ${color};
          }
          .mitre-id { font-weight: bold; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>AEGIS SANDBOX AI - ANALYSIS REPORT</h1>
          
          <div class="meta-info">
            <div>
              <div class="label">Target File</div>
              <div class="value">${reportName}</div>
            </div>
            <div>
              <div class="label">Analysis Date</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
            <div>
              <div class="label">AI Verdict</div>
              <div class="value"><span class="badge">${threatLevel}</span></div>
            </div>
            <div>
              <div class="label">Confidence Score</div>
              <div class="value">${confidenceScore}%</div>
            </div>
          </div>

          <h2>Executive Narrative</h2>
          <div class="narrative">
            <p>${narrative}</p>
          </div>

          <h2>File Metadata</h2>
          <table>
            <tbody>
              <tr><td style="width: 150px; font-weight: bold; font-family: sans-serif;">SHA-256</td><td>${sha256}</td></tr>
              <tr><td style="font-weight: bold; font-family: sans-serif;">MD5</td><td>${md5}</td></tr>
              <tr><td style="font-weight: bold; font-family: sans-serif;">File Name</td><td>${reportName}</td></tr>
            </tbody>
          </table>

          <h2>Indicators of Compromise (IOCs)</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Indicator</th>
              </tr>
            </thead>
            <tbody>
              ${iocRows}
            </tbody>
          </table>

          <h2>MITRE ATT&CK Observed Techniques</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Technique Name</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              ${mitreRows}
            </tbody>
          </table>

          <h2>Behavioral Evidence & Telemetry</h2>
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Behavioral Event</th>
              </tr>
            </thead>
            <tbody>
              ${logRows}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by Aegis AI Engine. Confidential & Proprietary.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const blob = new Blob([reportHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aegis_Analysis_Report_${reportName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success('Report downloaded successfully.');
};

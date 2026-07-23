'use client';

import React, { useState } from 'react';
import {
  Settings, Users, Shield, Activity, Server, Database, Lock, Key,
  Plus, Edit, Trash2, CheckCircle, XCircle, MoreHorizontal, Eye
} from 'lucide-react';
import { cn, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';
import { mockUsers, mockAuditLogs } from '@/data/mock-data';

const adminTabs = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'audit', label: 'Global Audit Log', icon: Activity },
  { id: 'system', label: 'System Config', icon: Server },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [securitySettings, setSecuritySettings] = useState([
    { label: 'Two-Factor Authentication', enabled: true },
    { label: 'IP Whitelisting', enabled: false },
    { label: 'Audit Log Retention (days)', enabled: true, value: '365' },
    { label: 'Automatic Evidence Hashing', enabled: true },
    { label: 'Immutable Evidence Records', enabled: true },
    { label: 'HTTPS Only', enabled: true },
    { label: 'File Type Restrictions', enabled: true },
    { label: 'API Rate Limiting', enabled: true },
  ]);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-cyber-accent" />
          Admin Settings
        </h1>
        <p className="text-sm text-cyber-muted mt-1">Platform administration and user management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cyber-surface/50 rounded-xl p-1.5">
        {adminTabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                activeTab === tab.id ? 'cyber-tab-active' : 'cyber-tab',
                'flex items-center gap-2'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddUser(true)} className="cyber-btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="cyber-card-flat overflow-hidden p-0">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Badge #</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{user.full_name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-sm text-cyber-text font-medium">{user.full_name}</span>
                      </div>
                    </td>
                    <td><span className="text-xs text-cyber-muted">{user.email}</span></td>
                    <td>
                      <span className={cn('cyber-badge text-[10px]',
                        user.role === 'admin' && 'badge-danger',
                        user.role === 'investigator' && 'badge-info',
                        user.role === 'analyst' && 'badge-purple',
                        user.role === 'supervisor' && 'badge-warning',
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td><span className="text-xs text-cyber-text-dim">{user.department}</span></td>
                    <td><span className="text-xs font-mono text-cyber-muted">{user.badge_number}</span></td>
                    <td>
                      {user.is_active ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td><span className="text-xs text-cyber-muted">{formatDateTime(user.last_login)}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="cyber-btn-ghost p-1.5"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="cyber-btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles & Permissions */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { role: 'Admin', desc: 'Full platform access', perms: ['User management', 'System configuration', 'All case access', 'Audit log access', 'Delete evidence', 'Role management'], color: 'border-red-500/30' },
            { role: 'Investigator', desc: 'Lead investigations', perms: ['Create/manage cases', 'Upload evidence', 'Generate reports', 'AI summarization', 'OSINT lookup', 'IPDR analysis'], color: 'border-blue-500/30' },
            { role: 'Analyst', desc: 'Analysis and intelligence', perms: ['View assigned cases', 'Upload evidence', 'OSINT lookup', 'IOC matching', 'Generate reports', 'Timeline management'], color: 'border-purple-500/30' },
            { role: 'Supervisor', desc: 'Oversight and review', perms: ['View all cases', 'Review reports', 'Approve AI reports', 'View audit logs', 'Dashboard access', 'Export reports'], color: 'border-amber-500/30' },
          ].map(r => (
            <div key={r.role} className={cn('cyber-card-flat border', r.color)}>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-cyber-accent" />
                <div>
                  <h3 className="text-sm font-semibold text-white">{r.role}</h3>
                  <p className="text-xs text-cyber-muted">{r.desc}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {r.perms.map(perm => (
                  <div key={perm} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-cyber-text-dim">{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Audit Log */}
      {activeTab === 'audit' && (
        <div className="cyber-card-flat overflow-hidden p-0">
          <div className="p-4 border-b border-cyber-border">
            <h3 className="text-sm font-semibold text-white">System-Wide Audit Log</h3>
            <p className="text-xs text-cyber-muted mt-0.5">Immutable record of all platform actions</p>
          </div>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource Type</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {mockAuditLogs.map(log => (
                <tr key={log.id}>
                  <td><span className="text-xs font-mono text-cyber-muted">{formatDateTime(log.timestamp)}</span></td>
                  <td><span className="text-xs text-cyber-text">{log.user_name}</span></td>
                  <td>
                    <span className={cn('cyber-badge text-[10px]',
                      log.action === 'CREATE' && 'badge-success',
                      log.action === 'UPLOAD' && 'badge-cyan',
                      log.action === 'ACCESS' && 'badge-info',
                      log.action === 'GENERATE' && 'badge-purple',
                      log.action === 'REVIEW' && 'badge-warning',
                      log.action === 'LOGIN' && 'badge-neutral',
                      log.action === 'EXPORT' && 'badge-info',
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td><span className="text-xs text-cyber-muted capitalize">{log.resource_type}</span></td>
                  <td><span className="text-xs text-cyber-text-dim truncate max-w-[300px] block">{log.details}</span></td>
                  <td><span className="text-xs font-mono text-cyber-muted">{log.ip_address}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* System Config */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cyber-card-flat">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyber-accent" /> Platform Configuration
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Platform Version', value: 'CIIP v2.1.0' },
                { label: 'Database', value: 'PostgreSQL 16.2' },
                { label: 'API Version', value: 'v2.1 (FastAPI)' },
                { label: 'AI Engine', value: 'CIIP-AI v2.1 (Local LLM)' },
                { label: 'Evidence Storage', value: '/data/evidence (2.1 TB used)' },
                { label: 'Max Upload Size', value: '50 GB' },
                { label: 'Session Timeout', value: '30 minutes' },
                { label: 'Rate Limit', value: '100 req/min per user' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-cyber-border/50 last:border-0">
                  <span className="text-xs text-cyber-muted">{item.label}</span>
                  <span className="text-xs text-cyber-text font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-card-flat">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyber-accent" /> Security Settings
            </h3>
            <div className="space-y-3">
              {securitySettings.map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-cyber-border/50 last:border-0">
                  <span className="text-xs text-cyber-text-dim">{item.label}</span>
                  <div 
                    onClick={() => {
                      setSecuritySettings(prev => prev.map(s => s.label === item.label ? { ...s, enabled: !s.enabled } : s));
                    }}
                    className={cn(
                      'w-9 h-5 rounded-full relative cursor-pointer transition-colors',
                      item.enabled ? 'bg-cyber-accent' : 'bg-cyber-surface'
                    )}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      item.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddUser(false)}>
          <div className="bg-cyber-card border border-cyber-border rounded-2xl w-full max-w-lg mx-4 p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-1">Add New User</h2>
            <p className="text-sm text-cyber-muted mb-6">Create a new platform user account</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-cyber-muted mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input type="text" className="cyber-input" placeholder="Enter full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cyber-muted mb-1.5 uppercase tracking-wider">Badge Number</label>
                  <input type="text" className="cyber-input" placeholder="e.g., CCD-1001" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-cyber-muted mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" className="cyber-input" placeholder="user@ciip.gov" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-cyber-muted mb-1.5 uppercase tracking-wider">Role</label>
                  <select className="cyber-input">
                    <option>Investigator</option>
                    <option>Analyst</option>
                    <option>Supervisor</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-cyber-muted mb-1.5 uppercase tracking-wider">Department</label>
                  <input type="text" className="cyber-input" placeholder="Department name" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-cyber-border">
              <button onClick={() => setShowAddUser(false)} className="cyber-btn-secondary">Cancel</button>
              <button className="cyber-btn-primary">Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

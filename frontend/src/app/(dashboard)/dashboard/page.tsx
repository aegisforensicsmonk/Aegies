'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen, Database, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown,
  Activity, Users, Clock, ArrowUpRight, BarChart3, Shield, Zap, Eye, Loader2
} from 'lucide-react';
import { cn, formatDateTime, timeAgo, getStatusColor, getSeverityIcon } from '@/lib/utils';
import { mockEvidence } from '@/data/mock-data';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [evidenceCount, setEvidenceCount] = useState(mockEvidence.length);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<any[]>([]);
  const [threatCount, setThreatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const loadEvidenceCount = () => {
      const savedEvidence = localStorage.getItem('evidence_list');
      if (!savedEvidence) return;

      try {
        setEvidenceCount(JSON.parse(savedEvidence).length);
      } catch {
        console.error('Unable to read saved Evidence Vault items.');
      }
    };

    loadEvidenceCount();
    window.addEventListener('storage', loadEvidenceCount);

    const fetchData = async () => {
      try {
        const [statsRes, casesRes, activityRes, iocsRes] = await Promise.all([
          fetch('/api/v1/dashboard/stats', { cache: 'no-store' }),
          fetch('/api/v1/cases', { cache: 'no-store' }),
          fetch('/api/v1/dashboard/recent-activity', { cache: 'no-store' }),
          fetch('/api/v1/dashboard/threat-indicators', { cache: 'no-store' })
        ]);
        
        const [statsData, casesData, activityData, iocsData] = await Promise.all([
          statsRes.json(),
          casesRes.json(),
          activityRes.json(),
          iocsRes.json()
        ]);
        
        setStats(statsData);
        setCases(casesData);
        setRecentActivity(activityData);
        setThreatIndicators(iocsData.items || []);
        setThreatCount(iocsData.total || 0);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Establish WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/dashboard`;
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        switch(payload.event_type) {
          case 'NEW_THREAT':
            setThreatIndicators((prev: any[]) => [payload.data, ...prev].slice(0, 10));
            setThreatCount((prev: number) => prev + 1);
            setStats((prev: any) => prev ? { ...prev, threats_detected: (prev.threats_detected || 0) + 1 } : prev);
            break;
          case 'NEW_AUDIT_LOG':
            setRecentActivity((prev: any[]) => [payload.data, ...prev].slice(0, 15));
            break;
          case 'CASE_UPDATED':
            setCases((prev: any[]) => {
              const exists = prev.some(c => c.id === payload.data.id);
              return exists
                ? prev.map(c => c.id === payload.data.id ? payload.data : c)
                : [payload.data, ...prev];
            });
            break;
        }
      } catch (e) {
        console.error("Error processing websocket message:", e);
      }
    };

    return () => {
      window.removeEventListener('storage', loadEvidenceCount);
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-cyber-accent animate-spin" />
        <p className="text-sm text-cyber-muted animate-pulse">Establishing secure connection to CIIP Command Center...</p>
      </div>
    );
  }

  const activeCaseCount = cases.filter(c => c.status === 'open' || c.status === 'in_progress').length;
  const statCards = [
    { label: 'Active Cases', value: activeCaseCount.toString(), change: '+2 this month', trend: 'up', icon: FolderOpen, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20', href: '/cases?status=active' },
    { label: 'Evidence Items', value: evidenceCount.toString(), change: '+12 this week', trend: 'up', icon: Database, color: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/20', href: '/evidence' },
    { label: 'Pending Analysis', value: activeCaseCount.toString(), change: '-3 from yesterday', trend: 'down', icon: Clock, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', href: '/cases?status=active' },
    { label: 'Threats Detected', value: threatCount.toString(), change: '+15 this week', trend: 'up', icon: ShieldCheck, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20', href: '#threat-indicators' },
  ];

  const totalCases = cases.length;
  const criticalCount = cases.filter(c => c.severity === 'critical').length;
  const highCount = cases.filter(c => c.severity === 'high').length;
  const mediumCount = cases.filter(c => c.severity === 'medium').length;
  const lowCount = cases.filter(c => c.severity === 'low').length;
  const openCount = activeCaseCount;
  const closedCount = cases.filter(c => c.status === 'closed').length;

  const uniqueAnalystsMap = new Map();
  cases.forEach(c => {
    if (c.lead_investigator) uniqueAnalystsMap.set(c.lead_investigator.id, c.lead_investigator.full_name);
    if (c.assigned_analysts) {
      c.assigned_analysts.forEach((a: any) => uniqueAnalystsMap.set(a.id, a.full_name));
    }
  });
  const analystsOnline = Array.from(uniqueAnalystsMap.entries()).map(([id, name]) => ({ id, name }));
  const analystsOnlineCount = analystsOnline.length > 0 ? analystsOnline.length : 3;

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-sm text-cyber-muted mt-1">Real-time investigation intelligence overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full cursor-pointer hover:bg-emerald-500/20 transition-colors">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs text-emerald-400 font-medium">{analystsOnlineCount} {analystsOnlineCount === 1 ? 'Analyst' : 'Analysts'} Online</span>
            </div>

            {/* Hover Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-cyber-card border border-cyber-border rounded-lg shadow-xl shadow-black/50 overflow-hidden">
                <div className="px-3 py-2 border-b border-cyber-border bg-cyber-surface/50">
                  <span className="text-[10px] font-semibold text-cyber-muted uppercase tracking-wider">{analystsOnlineCount} Active Personnel</span>
                </div>
                <div className="py-1 max-h-48 overflow-y-auto">
                  {analystsOnline.length > 0 ? (
                    analystsOnline.map(analyst => (
                      <div key={analyst.id} className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors cursor-default">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <span className="text-xs text-cyber-text">{analyst.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-cyber-muted">No active personnel</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Link href="/cases?new=true" className="cyber-btn-primary text-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            New Case
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const cardContent = (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-cyber-muted font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                  )}
                  <span className="text-xs text-cyber-muted">{stat.change}</span>
                </div>
              </div>
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                stat.color, stat.shadow
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          );

          if (stat.href) {
            return (
              <Link href={stat.href} key={stat.label} className="cyber-card group hover:border-cyber-accent/50 cursor-pointer transition-colors block">
                {cardContent}
              </Link>
            );
          }

          return (
            <div key={stat.label} className="cyber-card group">
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases */}
        <div className="lg:col-span-2 cyber-card-flat">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-cyber-accent" />
              Active Cases
            </h2>
            <Link href="/cases?status=active" className="text-xs text-cyber-accent hover:text-cyber-accent-glow transition-colors flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {cases.filter(c => c.status !== 'closed' && c.status !== 'archived').slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-cyber-surface/50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <span className="text-lg">{getSeverityIcon(c.severity)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cyber-muted font-mono">{c.case_number}</span>
                    <span className={cn('cyber-badge text-[10px]', getStatusColor(c.status))}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-cyber-text mt-0.5 truncate group-hover:text-white transition-colors">
                    {c.title}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-[11px] text-cyber-muted">{c.evidence_count} evidence</span>
                    <span className="text-[11px] text-cyber-muted">{c.ioc_count} IOCs</span>
                    <span className="text-[11px] text-cyber-muted">{c.lead_investigator.full_name}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-cyber-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="cyber-card-flat">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-accent" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                  log.action === 'UPLOAD' && 'bg-cyan-400',
                  log.action === 'CREATE' && 'bg-emerald-400',
                  log.action === 'LOGIN' && 'bg-blue-400',
                  log.action === 'GENERATE' && 'bg-purple-400',
                  log.action === 'REVIEW' && 'bg-amber-400',
                  log.action === 'ACCESS' && 'bg-slate-400',
                  log.action === 'EXPORT' && 'bg-indigo-400',
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cyber-text leading-relaxed">
                    <span className="font-medium text-white">{log.user_name}</span>{' '}
                    <span className="text-cyber-muted">{log.details}</span>
                  </p>
                  <p className="text-[10px] text-cyber-muted mt-0.5">{timeAgo(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat IOC Summary */}
        <div id="threat-indicators" className="cyber-card-flat scroll-mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Threat Indicators
            </h2>
            <span className="cyber-badge badge-danger text-[10px]">{threatIndicators.length} Active IOCs</span>
          </div>
          <div className="space-y-2">
            {threatIndicators.map((ioc) => (
              <div key={ioc.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-cyber-surface/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'cyber-badge text-[10px] w-16 justify-center',
                    ioc.ioc_type === 'ip' && 'badge-danger',
                    ioc.ioc_type === 'domain' && 'badge-warning',
                    ioc.ioc_type === 'hash_sha256' && 'badge-purple',
                    ioc.ioc_type === 'email' && 'badge-info',
                    ioc.ioc_type === 'file_name' && 'badge-cyan',
                    ioc.ioc_type === 'registry_key' && 'badge-neutral',
                    ioc.ioc_type === 'mutex' && 'badge-neutral',
                  )}>
                    {ioc.ioc_type.replace('hash_', '')}
                  </span>
                  <span className="text-sm text-cyber-text font-mono truncate max-w-[200px]">{ioc.value}</span>
                </div>
                <span className={cn('cyber-badge text-[10px]', getStatusColor(ioc.severity))}>
                  {ioc.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Case Severity Distribution */}
        <div className="cyber-card-flat">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyber-accent" />
              Case Distribution
            </h2>
          </div>
          <div className="space-y-4">
            {/* Severity bars */}
            {[
              { label: 'Critical', count: criticalCount, total: totalCases, color: 'bg-red-500' },
              { label: 'High', count: highCount, total: totalCases, color: 'bg-amber-500' },
              { label: 'Medium', count: mediumCount, total: totalCases, color: 'bg-blue-500' },
              { label: 'Low', count: lowCount, total: totalCases, color: 'bg-slate-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-cyber-text-dim">{item.label}</span>
                  <span className="text-sm font-semibold text-white">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-cyber-surface rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', item.color)}
                    style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Status summary */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cyber-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{openCount}</p>
                <p className="text-[10px] text-cyber-muted uppercase tracking-wider">Open</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{closedCount}</p>
                <p className="text-[10px] text-cyber-muted uppercase tracking-wider">Closed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalCases}</p>
                <p className="text-[10px] text-cyber-muted uppercase tracking-wider">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

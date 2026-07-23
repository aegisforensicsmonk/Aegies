'use client';

import React, { useState } from 'react';
import { Clock, Filter, Search, ArrowUpRight } from 'lucide-react';
import { cn, formatDateTime, getStatusColor, getSeverityIcon } from '@/lib/utils';
import { mockTimeline, mockCases } from '@/data/mock-data';

const eventTypeColors: Record<string, string> = {
  evidence_added: 'bg-cyan-400',
  entity_discovered: 'bg-purple-400',
  analysis_complete: 'bg-emerald-400',
  ioc_matched: 'bg-red-400',
  note_added: 'bg-blue-400',
  status_change: 'bg-amber-400',
  report_generated: 'bg-indigo-400',
  custom: 'bg-slate-400',
};

export default function TimelinePage() {
  const [caseFilter, setCaseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const allEvents = [...mockTimeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filtered = allEvents.filter(e => {
    if (caseFilter !== 'All' && e.case_id !== caseFilter) return false;
    if (typeFilter !== 'All' && e.event_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Clock className="w-7 h-7 text-cyber-accent" />
          Investigation Timeline
        </h1>
        <p className="text-sm text-cyber-muted mt-1">Chronological view of all investigation events</p>
      </div>

      {/* Filters */}
      <div className="cyber-card-flat flex flex-col lg:flex-row gap-4">
        <div>
          <label className="block text-[10px] text-cyber-muted uppercase tracking-wider mb-1.5">Case</label>
          <select
            className="cyber-input text-sm"
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
          >
            <option value="All">All Cases</option>
            {mockCases.map(c => (
              <option key={c.id} value={c.id}>{c.case_number} — {c.title.substring(0, 40)}...</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-cyber-muted uppercase tracking-wider mb-1.5">Event Type</label>
          <select
            className="cyber-input text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="evidence_added">Evidence Added</option>
            <option value="entity_discovered">Entity Discovered</option>
            <option value="analysis_complete">Analysis Complete</option>
            <option value="ioc_matched">IOC Matched</option>
            <option value="status_change">Status Change</option>
            <option value="note_added">Note Added</option>
            <option value="report_generated">Report Generated</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-10">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-accent/50 via-cyber-border to-cyber-border" />

        <div className="space-y-6">
          {filtered.map((event) => {
            const caseData = mockCases.find(c => c.id === event.case_id);
            return (
              <div key={event.id} className="relative animate-fade-in">
                <div className={cn(
                  'absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-cyber-bg',
                  eventTypeColors[event.event_type] || 'bg-cyber-muted'
                )} />
                <div className="cyber-card hover:border-cyber-border-light group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-cyber-accent">
                          {caseData?.case_number || event.case_id}
                        </span>
                        <span className="cyber-badge badge-neutral text-[10px]">
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                        {event.severity && (
                          <span className={cn('cyber-badge text-[10px]', getStatusColor(event.severity))}>
                            {getSeverityIcon(event.severity)} {event.severity}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-white group-hover:text-cyber-accent transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-cyber-muted mt-1 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-2 border-t border-cyber-border/50">
                    <span className="text-[10px] text-cyber-muted">{formatDateTime(event.timestamp)}</span>
                    <span className="text-[10px] text-cyber-accent">by {event.actor}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-cyber-muted/30 mx-auto mb-3" />
            <p className="text-sm text-cyber-muted">No events match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

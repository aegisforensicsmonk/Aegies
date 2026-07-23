'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Wifi, WifiOff, ChevronDown, X, ExternalLink } from 'lucide-react';
import { cn, timeAgo } from '@/lib/utils';
import { currentUser, mockCases, mockEvidence, mockIOCs, mockEntities } from '@/data/mock-data';

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Compute search results dynamically
  const results = React.useMemo(() => {
    if (!searchQuery) return [];
    const lowerQ = searchQuery.toLowerCase();
    const matched: any[] = [];

    // Search Cases
    mockCases.filter(c => c.title?.toLowerCase().includes(lowerQ) || c.case_number?.toLowerCase().includes(lowerQ))
      .slice(0, 2).forEach(c => matched.push({ type: 'CASE', title: c.title, id: c.id, link: `/cases/${c.id}` }));
    
    // Search Evidence
    mockEvidence.filter(e => e.file_name?.toLowerCase().includes(lowerQ) || e.evidence_number?.toLowerCase().includes(lowerQ))
      .slice(0, 2).forEach(e => matched.push({ type: 'EVIDENCE', title: e.file_name, id: e.id, link: `/evidence?id=${e.id}` }));
      
    // Search IOCs
    mockIOCs.filter(i => i.value?.toLowerCase().includes(lowerQ))
      .slice(0, 2).forEach(i => matched.push({ type: 'IOC', title: i.value, id: i.id, link: `/cases/${i.case_id}?tab=iocs` }));
      
    // Search Entities
    mockEntities.filter(e => e.value?.toLowerCase().includes(lowerQ) || e.entity_type?.toLowerCase().includes(lowerQ))
      .slice(0, 2).forEach(e => matched.push({ type: 'ENTITY', title: e.value, id: e.id, link: `/cases/${e.case_id}?tab=entities` }));

    return matched.slice(0, 5);
  }, [searchQuery]);

  const handleSelect = (link: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    router.push(link);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-cyber-surface/80 backdrop-blur-xl border-b border-cyber-border flex items-center justify-between px-6">
      {/* Left: Breadcrumb area */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="status-dot status-dot-active animate-pulse-slow" />
          <span className="text-xs text-cyber-muted font-medium">SYSTEM ONLINE</span>
        </div>
        <div className="h-4 w-px bg-cyber-border" />
        <span className="text-xs text-cyber-muted">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          {' · '}
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input
            type="text"
            placeholder="Search cases, evidence, IPs, hashes, IOCs..."
            className="w-full bg-cyber-bg border border-cyber-border rounded-lg pl-10 pr-4 py-2 text-sm text-cyber-text placeholder-cyber-muted focus:outline-none focus:ring-2 focus:ring-cyber-accent/30 focus:border-cyber-accent/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyber-muted bg-cyber-card px-1.5 py-0.5 rounded border border-cyber-border">
            ⌘K
          </kbd>

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-cyber-card border border-cyber-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-slide-up">
              <div className="p-3 border-b border-cyber-border">
                <p className="text-xs text-cyber-muted">Quick Results for &quot;{searchQuery}&quot;</p>
              </div>
              <div className="p-2 space-y-1">
                {results.length > 0 ? results.map((res, i) => (
                  <div 
                    key={`${res.type}-${res.id}-${i}`} 
                    onMouseDown={() => handleSelect(res.link)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cyber-surface cursor-pointer"
                  >
                    <span className={cn(
                      "cyber-badge text-[10px]", 
                      res.type === 'CASE' ? 'badge-info' : 
                      res.type === 'EVIDENCE' ? 'badge-cyan' : 
                      res.type === 'IOC' ? 'badge-purple' : 'badge-warning'
                    )}>{res.type}</span>
                    <span className="text-sm text-cyber-text truncate">{res.title}</span>
                  </div>
                )) : (
                  <div className="px-3 py-4 text-center text-sm text-cyber-muted">
                    No results found
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-cyber-border">
                <button className="w-full text-center text-xs text-cyber-accent hover:text-cyber-accent-glow py-1">
                  View all results →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Divider */}
        <div className="h-6 w-px bg-cyber-border" />

        {/* User badge */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-cyber-card cursor-pointer transition-colors">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {currentUser.full_name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-cyber-text">{currentUser.full_name}</p>
            <p className="text-[10px] text-cyber-muted">{currentUser.badge_number}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

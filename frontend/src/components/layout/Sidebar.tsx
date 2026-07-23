'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, Search, Globe, BarChart3, ShieldAlert,
  Database, Clock, FileText, Settings, ChevronLeft, ChevronRight,
  Shield, Fingerprint, LogOut, User, FileDigit, X, Mail, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { currentUser } from '@/data/mock-data';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cases', href: '/cases', icon: FolderOpen },
  { name: 'OSINT Lab', href: '/osint', icon: Globe },
  { name: 'IPDR Analyzer', href: '/ipdr', icon: BarChart3 },
  { name: 'Ransomware Lab', href: '/ransomware', icon: ShieldAlert },
  { name: 'Ransomware Lab History', href: '/analysis-history', icon: FileDigit },
  { name: 'Evidence Vault', href: '/evidence', icon: Database },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Admin', href: '/admin', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside
      className={cn(
        'h-screen bg-cyber-surface border-r border-cyber-border z-40',
        'flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 relative',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-cyber-border">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden border border-cyber-border/50">
          <Image src="/logo.jpg" alt="Aegis Logo" width={36} height={36} className="object-cover w-full h-full" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-white tracking-wide">AEGIS</h1>
            <p className="text-[10px] text-cyber-muted tracking-widest uppercase">Digital Forensics Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'transition-all duration-200 group relative',
                isActive
                  ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20'
                  : 'text-cyber-text-dim hover:text-cyber-text hover:bg-cyber-card'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? 'text-cyber-accent' : 'text-cyber-muted group-hover:text-cyber-text'
              )} />
              {!collapsed && (
                <span className="animate-fade-in">{item.name}</span>
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyber-accent rounded-r-full" />
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-cyber-card border border-cyber-border rounded-md text-xs text-cyber-text whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-cyber-border p-3">
        <div 
          onClick={() => setShowProfileModal(true)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'hover:bg-cyber-card transition-colors cursor-pointer'
          )}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in flex-1 min-w-0">
              <p className="text-sm font-medium text-cyber-text truncate">{currentUser.full_name}</p>
              <p className="text-xs text-cyber-muted capitalize">{currentUser.role}</p>
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Clear any stored authentication state here if we had any
                window.location.href = '/';
              }}
              className="p-1.5 rounded-md hover:bg-cyber-danger/10 transition-colors group/logout"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 text-cyber-muted group-hover/logout:text-cyber-danger transition-colors flex-shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-cyber-card border border-cyber-border rounded-full flex items-center justify-center hover:bg-cyber-surface transition-colors z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-cyber-muted" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-cyber-muted" />
        )}
      </button>

      {/* Profile Modal */}
      {showProfileModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in" style={{ position: 'fixed' }}>
          <div className="bg-cyber-surface border border-cyber-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-cyber-accent" />
                  User Profile
                </h2>
                <button onClick={(e) => { e.stopPropagation(); setShowProfileModal(false); }} className="text-cyber-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentUser.full_name}</h3>
                  <p className="text-sm text-cyber-muted capitalize">{currentUser.role} · {currentUser.department}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">
                    Active Session
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-cyber-card p-3 rounded-lg border border-cyber-border">
                  <div className="flex items-center gap-3 text-sm text-cyber-muted mb-1">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-white font-medium pl-7">{currentUser.email}</p>
                </div>
                <div className="bg-cyber-card p-3 rounded-lg border border-cyber-border">
                  <div className="flex items-center gap-3 text-sm text-cyber-muted mb-1">
                    <Hash className="w-4 h-4" />
                    <span>Badge Number</span>
                  </div>
                  <p className="text-white font-medium pl-7">{currentUser.badge_number}</p>
                </div>
                <div className="bg-cyber-card p-3 rounded-lg border border-cyber-border">
                  <div className="flex items-center gap-3 text-sm text-cyber-muted mb-1">
                    <Clock className="w-4 h-4" />
                    <span>Last Login</span>
                  </div>
                  <p className="text-white font-medium pl-7">{new Date(currentUser.last_login).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-cyber-border bg-cyber-card flex justify-end">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowProfileModal(false); }}
                className="px-4 py-2 bg-cyber-surface hover:bg-cyber-border text-white text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}

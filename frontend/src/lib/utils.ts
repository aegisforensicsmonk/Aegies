import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function truncateHash(hash: string, length: number = 12): string {
  if (hash.length <= length) return hash;
  return `${hash.substring(0, length)}...`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    open: 'badge-info',
    in_progress: 'badge-warning',
    closed: 'badge-success',
    archived: 'badge-neutral',
    uploaded: 'badge-info',
    processing: 'badge-warning',
    verified: 'badge-success',
    flagged: 'badge-danger',
    critical: 'badge-danger',
    high: 'badge-warning',
    medium: 'badge-info',
    low: 'badge-neutral',
    draft: 'badge-neutral',
    reviewed: 'badge-info',
    approved: 'badge-success',
  };
  return map[status] || 'badge-neutral';
}

export function getSeverityIcon(severity: string): string {
  const map: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };
  return map[severity] || '⚪';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

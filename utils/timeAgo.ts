/**
 * Utility functions for human-readable time formatting
 */

export interface TimeAgoOptions {
  includeSeconds?: boolean;
  maxDays?: number;
  showDate?: boolean;
}

/**
 * Converts a timestamp to a human-readable "time ago" string
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Configuration options
 * @returns Human-readable time string
 */
export function timeAgo(timestamp: number, options: TimeAgoOptions = {}): string {
  const {
    includeSeconds = true,
    maxDays = 30,
    showDate = true
  } = options;

  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  
  // If timestamp is in the future, return "just now"
  if (diff < 0) {
    return 'just now';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Just now
  if (seconds < 10) {
    return 'just now';
  }

  // Seconds
  if (seconds < 60) {
    return includeSeconds ? `${seconds}s ago` : 'just now';
  }

  // Minutes
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  // Hours
  if (hours < 24) {
    return `${hours}h ago`;
  }

  // Days
  if (days < 7) {
    return `${days}d ago`;
  }

  // Weeks
  if (days < 30) {
    return `${weeks}w ago`;
  }

  // Months
  if (days < 365) {
    return `${months}mo ago`;
  }

  // Years
  if (years >= 1) {
    return `${years}y ago`;
  }

  // Fallback to date if maxDays exceeded
  if (days > maxDays && showDate) {
    return formatDate(timestamp);
  }

  return `${days}d ago`;
}

/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  timestamp: number, 
  options: {
    includeTime?: boolean;
    format?: 'short' | 'medium' | 'long';
  } = {}
): string {
  const {
    includeTime = true,
    format = 'medium'
  } = options;

  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();

  // Today
  if (isToday) {
    return includeTime ? `Today at ${formatTime(date)}` : 'Today';
  }

  // Yesterday
  if (isYesterday) {
    return includeTime ? `Yesterday at ${formatTime(date)}` : 'Yesterday';
  }

  // This year
  if (date.getFullYear() === now.getFullYear()) {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return includeTime ? `${month} ${day} at ${formatTime(date)}` : `${month} ${day}`;
  }

  // Different year
  const year = date.getFullYear();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  
  if (format === 'short') {
    return includeTime ? `${month} ${day}, ${year}` : `${month} ${day}, ${year}`;
  } else if (format === 'long') {
    return includeTime 
      ? `${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${formatTime(date)}`
      : date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  } else {
    return includeTime ? `${month} ${day}, ${year} at ${formatTime(date)}` : `${month} ${day}, ${year}`;
  }
}

/**
 * Formats time portion of a date
 * @param date - Date object
 * @returns Formatted time string
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Gets relative time with more context
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Contextual time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return timeAgo(timestamp, { includeSeconds: true });
  } else if (days === 1) {
    return 'yesterday';
  } else if (days < 7) {
    return timeAgo(timestamp);
  } else if (days < 30) {
    return `${Math.floor(days / 7)}w ago`;
  } else {
    return formatDate(timestamp, { includeTime: false });
  }
}

/**
 * Checks if a timestamp is recent (within last hour)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if timestamp is recent
 */
export function isRecent(timestamp: number): boolean {
  const now = Date.now();
  const diff = now - timestamp;
  return diff < 60 * 60 * 1000; // 1 hour
}

/**
 * Gets time until a future timestamp
 * @param timestamp - Future Unix timestamp in milliseconds
 * @returns Time until string
 */
export function timeUntil(timestamp: number): string {
  const now = Date.now();
  const diff = Math.max(0, timestamp - now);
  
  if (diff === 0) {
    return 'now';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `in ${seconds}s`;
  } else if (minutes < 60) {
    return `in ${minutes}m`;
  } else if (hours < 24) {
    return `in ${hours}h`;
  } else {
    return `in ${days}d`;
  }
}

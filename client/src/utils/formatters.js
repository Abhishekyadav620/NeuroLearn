/**
 * Utility formatters for NeuroLearn client
 */

/**
 * Format ISO date string into readable local timestamp
 */
export const formatTimestamp = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
           ' (' + date.toLocaleDateString() + ')';
  } catch {
    return isoString;
  }
};

/**
 * Format uptime seconds into human-readable duration
 */
export const formatUptime = (seconds) => {
  if (seconds === undefined || seconds === null) return '0s';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
};

/**
 * Classnames helper joining utility
 */
export const cn = (...classes) => classes.filter(Boolean).join(' ');

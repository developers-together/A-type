export function formatDate(input: string): string {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelative(input: string | null): string {
  if (!input) return 'just now';

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'just now';

  const diffSeconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatTotalTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 1) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

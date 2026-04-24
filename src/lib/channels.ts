/* HAS Design — channel registry (ILI-738).
   Each route is a channel. The chrome (header `CH XX`, right
   rail `CH XX · SIGNAL …`, left rail tag) reads from this map
   so navigation feels like retuning a dial. Add a route here
   and the chrome picks it up automatically. */

export type Flourish = 'ops' | 'spec' | 'operator' | 'archive' | 'dispatch' | null;

export interface Channel {
  id: string;
  label: string;
  flourish: Flourish;
  signal: string;
  tag: string;
}

const UTILITY: Channel = {
  id: '00',
  label: '—',
  flourish: null,
  signal: 'SIGNAL OPEN',
  tag: '// UTILITY · BOOT',
};

const CHANNELS: Record<string, Channel> = {
  '/': {
    id: '01',
    label: 'OPS',
    flourish: 'ops',
    signal: 'SIGNAL STRONG',
    tag: '// FEED · LIVE',
  },
  '/design-system': {
    id: '02',
    label: 'SPEC',
    flourish: 'spec',
    signal: 'SIGNAL LOCKED',
    tag: '// SPEC · GEOMETRY',
  },
  '/about': {
    id: '03',
    label: 'OPERATOR',
    flourish: 'operator',
    signal: 'SIGNAL CARRIER',
    tag: '// OPERATOR · BIO',
  },
  '/glossary': {
    id: '04',
    label: 'ARCHIVE',
    flourish: 'archive',
    signal: 'SIGNAL ARCHIVE',
    tag: '// ARCHIVE · INDEX',
  },
  '/contact': {
    id: '06',
    label: 'RELAY',
    flourish: null,
    signal: 'SIGNAL RELAY',
    tag: '// RELAY · OUTBOUND',
  },
};

export function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const stripped = pathname.replace(/\/+$/, '');
  return stripped === '' ? '/' : stripped;
}

export function getChannelForPath(pathname: string): Channel {
  const path = normalizePath(pathname);

  if (CHANNELS[path]) return CHANNELS[path];

  if (path.startsWith('/blog')) {
    return {
      id: '05',
      label: 'DISPATCH',
      flourish: 'dispatch',
      signal: 'SIGNAL CARRIER',
      tag: '// DISPATCH · TRANSMISSION',
    };
  }

  return UTILITY;
}

export function getAllChannels(): Channel[] {
  return Object.values(CHANNELS);
}

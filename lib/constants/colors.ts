export type NoteColorId =
  | 'coral'
  | 'storm'
  | 'clay'
  | 'chalk'
  | 'peach'
  | 'sand'
  | 'mint'
  | 'sage'
  | 'fog'
  | 'dusk'
  | 'blossom'
  | 'earth';

export interface NoteColorDefinition {
  id: NoteColorId;
  name: string;
  semanticRole: string;
  isPrimaryState: boolean;
  order: number;
  light: {
    bg: string;
    border: string;
  };
  dark: {
    bg: string;
    border: string;
  };
}

// 12 Authentic Google Keep Dual-Theme Colors ordered with Priority States first:
// Red (coral), Blue (storm), Black/Slate (clay) occupying positions 1, 2, 3
export const NOTE_COLORS: readonly NoteColorDefinition[] = [
  {
    id: 'coral',
    name: 'Coral (Red)',
    semanticRole: 'Primary 1 — Serious / Urgent / Blocker',
    isPrimaryState: true,
    order: 1,
    light: {
      bg: '#F28B82',
      border: '#EC695E',
    },
    dark: {
      bg: '#5C2B29',
      border: '#7C3A37',
    },
  },
  {
    id: 'storm',
    name: 'Storm (Blue)',
    semanticRole: 'Primary 2 — Active / Deep Work / Context',
    isPrimaryState: true,
    order: 2,
    light: {
      bg: '#AECBFA',
      border: '#8AB4F8',
    },
    dark: {
      bg: '#2A425A',
      border: '#3B5B7C',
    },
  },
  {
    id: 'clay',
    name: 'Clay (Black/Slate)',
    semanticRole: 'Primary 3 — Serious Neutral / Vault / Log',
    isPrimaryState: true,
    order: 3,
    light: {
      bg: '#E8EAED',
      border: '#DADCE0',
    },
    dark: {
      bg: '#3C4043',
      border: '#5F6368',
    },
  },
  {
    id: 'chalk',
    name: 'Chalk (Default)',
    semanticRole: 'Default Surface — Calm Baseline',
    isPrimaryState: false,
    order: 4,
    light: {
      bg: '#FFFFFF',
      border: '#E0E0E0',
    },
    dark: {
      bg: '#202124',
      border: '#5F6368',
    },
  },
  {
    id: 'peach',
    name: 'Peach',
    semanticRole: 'Secondary — Warm Idea / Draft',
    isPrimaryState: false,
    order: 5,
    light: {
      bg: '#FBBC04',
      border: '#F29900',
    },
    dark: {
      bg: '#613916',
      border: '#7D4A1D',
    },
  },
  {
    id: 'sand',
    name: 'Sand',
    semanticRole: 'Secondary — Highlight / Scratchpad',
    isPrimaryState: false,
    order: 6,
    light: {
      bg: '#FFF475',
      border: '#FBC02D',
    },
    dark: {
      bg: '#594212',
      border: '#755718',
    },
  },
  {
    id: 'mint',
    name: 'Mint',
    semanticRole: 'Secondary — Completed / Fresh / Growth',
    isPrimaryState: false,
    order: 7,
    light: {
      bg: '#CCFF90',
      border: '#A8E665',
    },
    dark: {
      bg: '#34481D',
      border: '#466127',
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    semanticRole: 'Secondary — Calm Reference / Docs',
    isPrimaryState: false,
    order: 8,
    light: {
      bg: '#A7FFEB',
      border: '#73E8CE',
    },
    dark: {
      bg: '#164E43',
      border: '#1E6B5C',
    },
  },
  {
    id: 'fog',
    name: 'Fog',
    semanticRole: 'Secondary — Backlog / Reading List',
    isPrimaryState: false,
    order: 9,
    light: {
      bg: '#CBF0F8',
      border: '#9ADCF0',
    },
    dark: {
      bg: '#204F5E',
      border: '#2C6B80',
    },
  },
  {
    id: 'dusk',
    name: 'Dusk',
    semanticRole: 'Secondary — Architecture / Creative',
    isPrimaryState: false,
    order: 10,
    light: {
      bg: '#D7AEFB',
      border: '#C084FC',
    },
    dark: {
      bg: '#472A5B',
      border: '#5E3878',
    },
  },
  {
    id: 'blossom',
    name: 'Blossom',
    semanticRole: 'Secondary — Personal / UI & Design',
    isPrimaryState: false,
    order: 11,
    light: {
      bg: '#FDCFE8',
      border: '#F8A5D2',
    },
    dark: {
      bg: '#5B2E48',
      border: '#7A3E61',
    },
  },
  {
    id: 'earth',
    name: 'Earth (Warm)',
    semanticRole: 'Secondary — Archive-Ready / Timeless',
    isPrimaryState: false,
    order: 12,
    light: {
      bg: '#E6C9A8',
      border: '#D4AF87',
    },
    dark: {
      bg: '#4B3621',
      border: '#63472B',
    },
  },
] as const;

export const DEFAULT_NOTE_COLOR: NoteColorId = 'chalk';

export function getNoteColor(id?: string | null): NoteColorDefinition {
  const match = NOTE_COLORS.find((c) => c.id === id);
  return match ?? NOTE_COLORS[3]; // Default to 'chalk'
}

export function getNoteColorClasses(id?: string | null, isDark = false): { bg: string; border: string } {
  const color = getNoteColor(id);
  return isDark ? color.dark : color.light;
}


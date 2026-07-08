/**
 * Design tokens taken from the Figma "Ruzza Milano/Watch" design.
 * These screens are dark-only (dark marble background, white text), so the
 * values here are explicit rather than light/dark-aware.
 */

export const Palette = {
  bgTop: '#1a1a1a',
  bgBottom: '#000000',
  white: '#ffffff',
  /** 50% white — the "Ruzza Watch" eyebrow labels and secondary text. */
  whiteMuted: 'rgba(255,255,255,0.5)',
  blue: '#4b88ff',
  orange: '#e95935',
  badgeBg: '#000000',
  cardWhite: '#ffffff',
  tabPill: 'rgba(255,255,255,0.16)',
  tabActive: 'rgba(0,0,0,0.24)',
  profileChip: 'rgba(255,255,255,0.08)',
} as const;

export const Font = {
  sans: 'GeneralSans-Regular',
  sansMedium: 'GeneralSans-Medium',
  sansSemibold: 'GeneralSans-Semibold',
  /** Medium weight — big white headings / product names. */
  serif: 'LibreBaskerville_500Medium',
  /** Regular "Libre Baskerville" — the orange price and other upright serif. */
  serifRegular: 'LibreBaskerville_400Regular',
  /** Regular italic — the blue/orange accent words. */
  serifItalic: 'LibreBaskerville_400Regular_Italic',
} as const;

/**
 * Per-watch accent color used for the carousel card gradient. The Storefront
 * product titles are like "RUZZA WATCH CORAL"; we match on the color word.
 * Falls back to a neutral dark when unknown.
 */
const ACCENTS: { match: RegExp; color: string }[] = [
  { match: /coral/i, color: '#e95935' },
  { match: /gold|bianco\s*gold/i, color: '#ca9f27' },
  { match: /turchese|turquoise/i, color: '#5bb7c3' },
  { match: /lapis|blu|blue/i, color: '#294184' },
  { match: /malachite|green|verde/i, color: '#2e7d5b' },
  { match: /calacatta|bianco|white/i, color: '#9a9a9a' },
  { match: /beige|cream|nero\s*beige/i, color: '#684834' },
  { match: /tigre|tiger|amber|ambra/i, color: '#b5791f' },
  { match: /electric/i, color: '#3a3f45' },
];

export function accentColor(name: string): string {
  for (const { match, color } of ACCENTS) {
    if (match.test(name)) return color;
  }
  return '#3a3f45';
}

/**
 * The product eyebrow label is always "Ruzza Watch"; the big name is the color,
 * derived by stripping the "RUZZA WATCH" prefix from the Storefront title.
 */
export function watchColorName(title: string): string {
  const stripped = title.replace(/^\s*ruzza\s*watch\s*/i, '').trim();
  const name = stripped.length > 0 ? stripped : title;
  // Title-case: "NERO TURCHESE" -> "Nero Turchese"
  return name
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

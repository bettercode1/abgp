/**
 * Site-wide search index: paths and their nav title keys.
 * Search matches against the translated title and path segments.
 */
export interface SearchEntry {
  path: string;
  titleKey: string;
}

export const searchIndex: SearchEntry[] = [
  { path: '/', titleKey: 'nav.home' },
  { path: '/about', titleKey: 'nav.about' },
  { path: '/history', titleKey: 'nav.history' },
  { path: '/court-decisions', titleKey: 'nav.courtDecisions' },
  { path: '/terms', titleKey: 'nav.terms' },
  { path: '/activities', titleKey: 'nav.activities' },
  { path: '/gyandeep', titleKey: 'nav.gyandeep' },
  { path: '/spandana', titleKey: 'nav.spandana' },
  { path: '/membership', titleKey: 'nav.membership' },
  { path: '/prant-contacts', titleKey: 'nav.prantContacts' },
  { path: '/media', titleKey: 'nav.media' },
  { path: '/blogs', titleKey: 'nav.blogs' },
  { path: '/news', titleKey: 'nav.news' },
  { path: '/events', titleKey: 'nav.events' },
  { path: '/videos', titleKey: 'nav.videos' },
  { path: '/gallery', titleKey: 'nav.gallery' },
  { path: '/kshetra-mantri', titleKey: 'nav.kshetraMantri' },
  { path: '/quickmemos', titleKey: 'nav.quickMemos' },
  { path: '/faq', titleKey: 'nav.faq' },
  { path: '/petition', titleKey: 'nav.petition' },
  { path: '/contact', titleKey: 'nav.contact' },
  { path: '/national-executive', titleKey: 'executive.title' },
];

export function matchSearchEntry(
  entry: SearchEntry,
  query: string,
  getTitle: (key: string) => string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const title = getTitle(entry.titleKey).toLowerCase();
  const pathSegments = entry.path.replace(/^\//, '').toLowerCase().split(/[/-]/);
  if (title.includes(q)) return true;
  if (pathSegments.some((seg) => seg.includes(q) || q.includes(seg))) return true;
  return false;
}

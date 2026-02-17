/**
 * Director content: section-based (history, blog, videos, gallery, home).
 * Stored in localStorage; pages use useDirectorContent(section) to display it.
 */

export const DIRECTOR_CONTENT_KEY = 'abgp-director-content';

export type DirectorSectionKey = 'history' | 'blog' | 'news' | 'videos' | 'gallery' | 'home';

export interface DirectorImage {
  id: string;
  url: string;
  caption?: string;
}

export interface DirectorText {
  id: string;
  title: string;
  body: string;
}

export interface DirectorVideo {
  id: string;
  url: string;
  title?: string;
  caption?: string;
}

export interface DirectorSectionContent {
  images: DirectorImage[];
  texts: DirectorText[];
  videos: DirectorVideo[];
}

export type DirectorContentBySection = Record<DirectorSectionKey, DirectorSectionContent>;

const DEFAULT_SECTION: DirectorSectionContent = {
  images: [],
  texts: [],
  videos: [],
};

const SECTION_KEYS: DirectorSectionKey[] = ['history', 'blog', 'news', 'videos', 'gallery', 'home'];

function getDefaultContent(): DirectorContentBySection {
  return SECTION_KEYS.reduce<DirectorContentBySection>(
    (acc, key) => {
      acc[key] = { ...DEFAULT_SECTION };
      return acc;
    },
    {} as DirectorContentBySection
  );
}

export function loadDirectorContentBySection(): DirectorContentBySection {
  try {
    const raw = localStorage.getItem(DIRECTOR_CONTENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DirectorContentBySection;
      const result = getDefaultContent();
      SECTION_KEYS.forEach((key) => {
        if (parsed[key] && typeof parsed[key] === 'object') {
          result[key] = {
            images: Array.isArray(parsed[key].images) ? parsed[key].images : [],
            texts: Array.isArray(parsed[key].texts) ? parsed[key].texts : [],
            videos: Array.isArray(parsed[key].videos) ? parsed[key].videos : [],
          };
        }
      });
      return result;
    }
  } catch {
    // ignore
  }
  return getDefaultContent();
}

export function saveDirectorContentBySection(data: DirectorContentBySection): void {
  localStorage.setItem(DIRECTOR_CONTENT_KEY, JSON.stringify(data));
}

export function getDirectorContentForSection(
  data: DirectorContentBySection,
  section: DirectorSectionKey
): DirectorSectionContent {
  return data[section] ?? { ...DEFAULT_SECTION };
}

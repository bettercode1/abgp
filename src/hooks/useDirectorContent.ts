import { useState, useEffect } from 'react';
import {
  loadDirectorContentBySection,
  getDirectorContentForSection,
  type DirectorSectionKey,
  type DirectorSectionContent,
} from '../lib/directorContent';
import { fetchContentViaApi, isApiConfigured } from '../lib/api';

/**
 * Returns Director-added content for a given section (history, blog, videos, gallery, home).
 * Reads from localStorage on mount and when storage event fires (e.g. Director added content in another tab).
 */
export function useDirectorContent(section: DirectorSectionKey): DirectorSectionContent {
  const [content, setContent] = useState<DirectorSectionContent>(() => {
    const all = loadDirectorContentBySection();
    return getDirectorContentForSection(all, section);
  });

  useEffect(() => {
    // Initial load from localStorage
    const all = loadDirectorContentBySection();
    setContent(getDirectorContentForSection(all, section));

    // Try fetching from API if configured
    if (isApiConfigured()) {
      // Pass null as token since this is a public request (backend now allows public GET for content)
      fetchContentViaApi('', section, 'director')
        .then((data) => {
          if (data && data.content) {
            const c = data.content as Record<string, unknown>;
            setContent({
              images: Array.isArray(c.images) ? c.images : [],
              texts: Array.isArray(c.texts) ? c.texts : [],
              videos: Array.isArray(c.videos) ? c.videos : [],
              pdfArticles: Array.isArray(c.pdfArticles) ? c.pdfArticles : [],
            });
          }
        })
        .catch((err) => {
          console.warn(`Failed to fetch director content for ${section}:`, err);
        });
    }
  }, [section]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'abgp-director-content' && e.newValue) {
        try {
          const all = JSON.parse(e.newValue) as ReturnType<typeof loadDirectorContentBySection>;
          setContent(getDirectorContentForSection(all, section));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [section]);

  return content;
}

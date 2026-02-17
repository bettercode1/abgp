import { useState, useEffect } from 'react';
import {
  loadDirectorContentBySection,
  getDirectorContentForSection,
  type DirectorSectionKey,
  type DirectorSectionContent,
} from '../lib/directorContent';

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
    const all = loadDirectorContentBySection();
    setContent(getDirectorContentForSection(all, section));
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

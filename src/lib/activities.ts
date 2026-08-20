export type ActivityCategory = 'jagaran' | 'andolan' | 'sanghatan' | 'margadarshan';

export type ActivityStatus = 'pending' | 'approved' | 'rejected';

export interface ActivityMedia {
  id: string;
  url: string;
  caption?: string;
  title?: string;
}

export interface ApiActivity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  ownerType: 'director' | 'prant';
  prantKey?: string;
  submittedByEmail?: string;
  images: ActivityMedia[];
  videos: ActivityMedia[];
  eventDate?: string;
  location?: string;
  status: ActivityStatus;
  approvedAt?: string;
  approvedByEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'jagaran',
  'andolan',
  'sanghatan',
  'margadarshan',
];

export function activityCategoryTitleKey(category: ActivityCategory): string {
  return `activities.cat.${category}.title`;
}

export function activityCategoryDescKey(category: ActivityCategory): string {
  return `activities.cat.${category}.desc`;
}

export function isYoutubeOrVimeoUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

export function youtubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  const short = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const embed = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
  if (embed) return `https://www.youtube.com/embed/${embed[1]}`;
  return null;
}

export function vimeoEmbedUrl(url: string): string | null {
  const match = url.trim().match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export function videoEmbedUrl(url: string): string | null {
  return youtubeEmbedUrl(url) || vimeoEmbedUrl(url);
}

/** Mirrors backend/lib/complaintAttachments.js allowed types */
export const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
]);

export const COMPLAINT_CATEGORIES = [
  'realEstate',
  'food',
  'hospital',
  'transport',
  'ecommerce',
  'society',
  'utility',
  'education',
  'other',
] as const;

export type ComplaintCategoryKey = (typeof COMPLAINT_CATEGORIES)[number];

export function isComplaintCategory(value: string): value is ComplaintCategoryKey {
  return (COMPLAINT_CATEGORIES as readonly string[]).includes(value);
}

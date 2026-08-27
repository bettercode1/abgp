const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads', 'complaints');
const MAX_FILES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
]);

function uploadsDirForComplaint(complaintId) {
  return path.join(UPLOAD_ROOT, String(complaintId));
}

function safeFileName(name) {
  const base = String(name || 'file')
    .replace(/[^\w.\-()+ ]/g, '_')
    .slice(0, 120);
  return base || 'file';
}

function extForMime(mimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'video/mp4':
      return '.mp4';
    case 'video/webm':
      return '.webm';
    default:
      return '';
  }
}

/**
 * @param {string} complaintId
 * @param {Array<{ name?: string, mimeType?: string, dataBase64?: string }>} items
 * @returns {Promise<Array<{ id: string, name: string, mimeType: string, url: string, size: number }>>}
 */
async function saveComplaintAttachments(complaintId, items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  if (items.length > MAX_FILES) {
    throw new Error(`Maximum ${MAX_FILES} attachments allowed`);
  }

  const dir = uploadsDirForComplaint(complaintId);
  fs.mkdirSync(dir, { recursive: true });

  const saved = [];
  for (const item of items) {
    const mimeType = String(item?.mimeType || '').trim().toLowerCase();
    if (!ALLOWED_MIME.has(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType || 'unknown'}`);
    }

    let raw = String(item?.dataBase64 || '');
    const dataUrlMatch = raw.match(/^data:[^;]+;base64,(.+)$/);
    if (dataUrlMatch) raw = dataUrlMatch[1];
    if (!raw) continue;

    const buffer = Buffer.from(raw, 'base64');
    const maxBytes = mimeType.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (buffer.length > maxBytes) {
      throw new Error(`File too large (max ${Math.round(maxBytes / (1024 * 1024))} MB)`);
    }

    const id = crypto.randomUUID();
    const ext = extForMime(mimeType) || path.extname(safeFileName(item?.name)) || '';
    const storedName = `${id}${ext}`;
    const diskPath = path.join(dir, storedName);
    fs.writeFileSync(diskPath, buffer);

    saved.push({
      id,
      name: safeFileName(item?.name) || storedName,
      mimeType,
      url: `/api/complaints/files/${complaintId}/${storedName}`,
      size: buffer.length,
    });
  }

  return saved;
}

function resolveAttachmentPath(complaintId, fileName) {
  const safe = path.basename(String(fileName || ''));
  if (!safe || safe.includes('..')) return null;
  const full = path.join(uploadsDirForComplaint(complaintId), safe);
  if (!full.startsWith(uploadsDirForComplaint(complaintId))) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

module.exports = {
  saveComplaintAttachments,
  resolveAttachmentPath,
  ALLOWED_MIME,
  MAX_FILES,
};

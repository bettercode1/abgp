import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useTranslation } from 'react-i18next';
import type { ComplaintAttachmentUpload } from '../../../lib/api';
import { ALLOWED_MIME } from '../../../lib/complaintUploadConstants';

interface ComplaintAttachmentInputProps {
  files: ComplaintAttachmentUpload[];
  onChange: (files: ComplaintAttachmentUpload[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const ComplaintAttachmentInput: React.FC<ComplaintAttachmentInputProps> = ({
  files,
  onChange,
  maxFiles = 5,
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handlePick = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const picked = event.target.files;
      if (!picked?.length) return;
      const next = [...files];
      for (const file of Array.from(picked)) {
        if (next.length >= maxFiles) break;
        if (!ALLOWED_MIME.has(file.type)) {
          continue;
        }
        const dataBase64 = await readFileAsDataUrl(file);
        next.push({ name: file.name, mimeType: file.type, dataBase64 });
      }
      onChange(next);
      event.target.value = '';
    },
    [files, maxFiles, onChange]
  );

  const removeAt = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {t('complaint.attachmentsLabel')}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
        {files.map((f, i) => (
          <Chip
            key={`${f.name}-${i}`}
            label={f.name}
            onDelete={disabled ? undefined : () => removeAt(i)}
            size="small"
            variant="outlined"
          />
        ))}
      </Stack>
      <Button
        component="label"
        variant="outlined"
        size="small"
        startIcon={<AttachFileIcon />}
        disabled={disabled || files.length >= maxFiles}
        sx={{ textTransform: 'none' }}
      >
        {t('complaint.addAttachment')}
        <input
          type="file"
          hidden
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={(e) => void handlePick(e)}
        />
      </Button>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        {t('complaint.attachmentsHint')}
      </Typography>
    </Box>
  );
};

export function ComplaintStatusChip({ status }: { status?: string }) {
  const { t } = useTranslation();
  const key = `complaint.status.${status || 'submitted'}`;
  const label = t(key);
  const color =
    status === 'resolved' || status === 'closed'
      ? 'success'
      : status === 'in_review'
        ? 'warning'
        : 'default';
  return <Chip size="small" label={label === key ? status : label} color={color} />;
}

interface ComplaintAttachmentPreviewProps {
  token: string | null;
  attachments?: Array<{ id: string; name: string; mimeType: string; url: string }>;
}

export const ComplaintAttachmentPreview: React.FC<ComplaintAttachmentPreviewProps> = ({
  token,
  attachments = [],
}) => {
  const { t } = useTranslation();
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token || !attachments.length) return;
      const { fetchComplaintAttachmentBlob } = await import('../../../lib/api');
      const entries: Record<string, string> = {};
      for (const att of attachments) {
        try {
          const blob = await fetchComplaintAttachmentBlob(token, att.url);
          entries[att.id] = URL.createObjectURL(blob);
        } catch {
          // skip failed preview
        }
      }
      if (!cancelled) setBlobUrls(entries);
    };
    void load();
    return () => {
      cancelled = true;
      Object.values(blobUrls).forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, attachments]);

  if (!attachments.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('complaint.noAttachments')}
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {attachments.map((att) => {
        const src = blobUrls[att.id];
        const isImage = att.mimeType.startsWith('image/');
        const isVideo = att.mimeType.startsWith('video/');
        return (
          <Box key={att.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              {att.name}
            </Typography>
            {src && isImage ? (
              <Box component="img" src={src} alt={att.name} sx={{ mt: 1, maxWidth: '100%', maxHeight: 240, borderRadius: 1 }} />
            ) : null}
            {src && isVideo ? (
              <Box component="video" src={src} controls sx={{ mt: 1, maxWidth: '100%', maxHeight: 240 }} />
            ) : null}
            {!src ? (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {att.mimeType}
              </Typography>
            ) : null}
          </Box>
        );
      })}
    </Stack>
  );
};

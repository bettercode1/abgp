import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, MenuItem, Button, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Support } from '@mui/icons-material';
import { ComplaintCategoryFields, type ComplaintCategory } from './ComplaintCategoryFields';

const CATEGORIES: ComplaintCategory[] = [
  'realEstate',
  'food',
  'hospital',
  'transport',
  'ecommerce',
  'society',
  'utility',
  'education',
  'other',
];

export type { ComplaintCategory };

export const ComplaintFormSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [formData, setFormData] = useState<Record<string, string | string[] | boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheck = (key: string, option: string) => {
    setFormData((prev) => {
      const arr = (prev[key] as string[]) || [];
      const next = arr.includes(option) ? arr.filter((x) => x !== option) : [...arr, option];
      return { ...prev, [key]: next };
    });
  };

  const handleCategoryChange = (value: ComplaintCategory) => {
    setCategory(value);
    setFormData({});
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { category, formData, at: new Date().toISOString() };
    try {
      const stored = JSON.parse(localStorage.getItem('abgp-complaints') || '[]');
      stored.push(payload);
      localStorage.setItem('abgp-complaints', JSON.stringify(stored));
      setSubmitted(true);
      setFormData({});
    } catch {
      // ignore
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme.shadows[10],
        borderLeft: `4px solid ${theme.palette.primary.main}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Support color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          {t('complaint.title')}
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label={t('complaint.categoryLabel')}
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as ComplaintCategory)}
            variant="outlined"
            required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="">{t('login.select')}</MenuItem>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {t(`complaint.category.${cat}`)}
              </MenuItem>
            ))}
          </TextField>
          {category && (
            <>
              <ComplaintCategoryFields
                category={category}
                formData={formData}
                onUpdate={update}
                onToggleCheck={toggleCheck}
              />
              {submitted && (
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  {t('complaint.submitted')}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.5,
                  boxShadow: theme.shadows[4],
                }}
              >
                {t('panel.submit')}
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

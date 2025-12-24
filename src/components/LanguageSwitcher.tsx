import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Language as LanguageIcon, ExpandMore } from '@mui/icons-material';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('abgp-language', lng);
    document.documentElement.lang = lng;
    handleClose();
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleClick}
        endIcon={<ExpandMore />}
        startIcon={<LanguageIcon />}
        aria-label="Select language"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          borderRadius: 25,
          px: 2,
          py: 0.5,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {t(`lang.${currentLanguage.code}`)}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
            sx={{
              py: 1.5,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: 'secondary.light',
                '&:hover': {
                  backgroundColor: 'secondary.main',
                },
              },
            }}
          >
            <ListItemText>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="body2" fontWeight={i18n.language === language.code ? 700 : 400}>
                  {language.nativeName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {language.name}
                </Typography>
              </Box>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};




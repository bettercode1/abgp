import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', nativeName: 'English' },
  { code: 'hi', nativeName: 'हिंदी' },
  { code: 'mr', nativeName: 'मराठी' },
  { code: 'gu', nativeName: 'ગુજરાતી' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ' },
  { code: 'te', nativeName: 'తెలుగు' },
  { code: 'ta', nativeName: 'தமிழ்' },
  { code: 'bn', nativeName: 'বাংলা' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentCode = i18n.language?.split('-')[0] || 'en';

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('abgp-language', lng);
    document.documentElement.lang = lng;
  };

  return (
    <Box
      component="nav"
      aria-label="Select language"
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 0,
      }}
    >
      {languages.map((language, index) => {
        const isActive = currentCode === language.code;
        return (
          <React.Fragment key={language.code}>
            {index > 0 && (
              <Typography
                component="span"
                sx={{
                  color: 'text.secondary',
                  px: 0.75,
                  fontSize: '0.875rem',
                  userSelect: 'none',
                }}
              >
                |
              </Typography>
            )}
            <Typography
              component="button"
              type="button"
              onClick={() => handleLanguageChange(language.code)}
              sx={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                font: 'inherit',
                fontSize: '0.875rem',
                color: isActive ? 'text.primary' : 'text.secondary',
                textDecoration: isActive ? 'underline' : 'none',
                textUnderlineOffset: 3,
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {language.nativeName}
            </Typography>
          </React.Fragment>
        );
      })}
    </Box>
  );
};

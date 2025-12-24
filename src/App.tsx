import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { TermsPage } from './pages/TermsPage';
import { HistoryTimelinePage } from './pages/HistoryTimelinePage';
import { getTheme, ThemeName } from './theme/themes';
import './i18n';

type FontSize = 'small' | 'medium' | 'large';
type ContrastMode = 'light' | 'dark' | 'high';

interface AccessibilitySettings {
  colorMode: 'normal' | 'highContrast' | 'darkContrast';
  highlightLinks: boolean;
  textSize: number;
  lineHeight: number;
  textSpacing: number;
  bigCursor: boolean;
  hideImages: boolean;
  screenReader: boolean;
}

function App() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('tricolor');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [contrastMode, setContrastMode] = useState<ContrastMode>('light');
  const [loading, setLoading] = useState(true);
  
  // Accessibility settings
  const [accessibilitySettings] = useState<AccessibilitySettings>({
    colorMode: 'normal',
    highlightLinks: false,
    textSize: 100,
    lineHeight: 1.5,
    textSpacing: 0,
    bigCursor: false,
    hideImages: false,
    screenReader: false,
  });

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('abgp-theme') as ThemeName;
    const savedFontSize = localStorage.getItem('abgp-fontSize') as FontSize;
    const savedContrast = localStorage.getItem('abgp-contrast') as ContrastMode;

    if (savedTheme && ['tricolor', 'minimal', 'highContrast', 'maroonGold', 'dark'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
    if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
      setFontSize(savedFontSize);
    }
    if (savedContrast && ['light', 'dark', 'high'].includes(savedContrast)) {
      setContrastMode(savedContrast);
    }

    // Simulate initial load
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Theme is derived from currentTheme
  const theme = getTheme(currentTheme);

  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    localStorage.setItem('abgp-theme', theme);
    // Sync contrast mode with theme if applicable
    if (theme === 'highContrast') {
      setContrastMode('high');
      localStorage.setItem('abgp-contrast', 'high');
    } else if (theme === 'dark') {
      setContrastMode('dark');
      localStorage.setItem('abgp-contrast', 'dark');
    } else if (contrastMode !== 'light') {
      setContrastMode('light');
      localStorage.setItem('abgp-contrast', 'light');
    }
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('abgp-fontSize', size);
  };

  const handleContrastModeChange = (mode: ContrastMode) => {
    setContrastMode(mode);
    localStorage.setItem('abgp-contrast', mode);
  };

  // Apply all accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // 1. Text Size
    root.style.fontSize = `${(accessibilitySettings.textSize / 100) * 16}px`;

    // 2. Line Height
    body.style.lineHeight = accessibilitySettings.lineHeight.toString();

    // 3. Text Spacing
    body.style.letterSpacing = `${accessibilitySettings.textSpacing}px`;

    // 4. Big Cursor
    if (accessibilitySettings.bigCursor) {
      body.classList.add('big-cursor');
    } else {
      body.classList.remove('big-cursor');
    }

    // 5. Hide Images
    if (accessibilitySettings.hideImages) {
      body.classList.add('hide-images');
    } else {
      body.classList.remove('hide-images');
    }

    // 6. Highlight Links
    if (accessibilitySettings.highlightLinks) {
      body.classList.add('highlight-links');
    } else {
      body.classList.remove('highlight-links');
    }

    // 7. Contrast Mode (Sync with theme)
    if (accessibilitySettings.colorMode === 'highContrast') {
      setCurrentTheme('highContrast');
    } else if (accessibilitySettings.colorMode === 'darkContrast') {
      setCurrentTheme('dark');
    } else if (accessibilitySettings.colorMode === 'normal') {
      // Logic from handleThemeChange might be better here to revert to light
      if (currentTheme === 'highContrast' || currentTheme === 'dark') {
         setCurrentTheme('tricolor');
      }
    }
  }, [accessibilitySettings, currentTheme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>
        {`
          .big-cursor * {
            cursor: url('https://cdn.custom-cursor.com/db/9672/32/neon-blue-pointer-cursor.png'), auto !important;
          }
          .hide-images img {
            visibility: hidden !important;
          }
          .highlight-links a {
            background-color: yellow !important;
            color: black !important;
            text-decoration: underline !important;
            font-weight: bold !important;
          }
          @media (max-width: 600px) {
            html {
              font-size: 14px;
            }
          }
        `}
      </style>
      <BrowserRouter>
        <MainLayout
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          contrastMode={contrastMode}
          onContrastModeChange={handleContrastModeChange}
          loading={loading}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/history" element={<HistoryTimelinePage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;


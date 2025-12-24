import { ThemeOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Classic Tricolor Theme (Government-style with Indian tricolor inspiration)
export const tricolorTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#1e3a8a', // Deep navy blue
      light: '#3b82f6',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b', // Saffron
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#000000',
    },
    success: {
      main: '#10b981', // Green
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f3f4f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans Devanagari", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          maxWidth: '1400px !important',
        },
      },
    },
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 12px 24px rgba(0,0,0,0.15)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 2px 4px rgba(0,0,0,0.1)',
  ] as ThemeOptions['shadows'],
};

// Modern Minimal Theme
export const minimalTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#0d9488', // Dark teal
      light: '#14b8a6',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          maxWidth: '1400px !important',
        },
      },
    },
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 4px 6px rgba(0,0,0,0.08)',
    '0px 8px 12px rgba(0,0,0,0.1)',
    '0px 12px 18px rgba(0,0,0,0.12)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
    '0px 1px 3px rgba(0,0,0,0.08)',
  ] as ThemeOptions['shadows'],
};

// High-Contrast Accessibility Theme
export const highContrastTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffeb3b', // Bright yellow
      light: '#fff176',
      dark: '#fbc02d',
      contrastText: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
    divider: '#000000',
  },
  typography: {
    fontFamily: '"Arial", "Helvetica", sans-serif',
    fontSize: 16,
    h1: {
      fontWeight: 700,
      fontSize: '2.75rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          maxWidth: '1400px !important',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderWidth: 3,
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderWidth: 3,
            },
          },
        },
      },
    },
  },
};

// Traditional Maroon-Gold Theme
export const maroonGoldTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#800020', // Maroon
      light: '#a00030',
      dark: '#600015',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4af37', // Gold
      light: '#e5c158',
      dark: '#b8941f',
      contrastText: '#000000',
    },
    background: {
      default: '#fef9e7', // Cream
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
    },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          maxWidth: '1400px !important',
        },
      },
    },
  },
};

// Dark Mode Theme
export const darkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5ff', // Cyan
      light: '#62efff',
      dark: '#00b2cc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff9800', // Orange
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          maxWidth: '1400px !important',
        },
      },
    },
  },
};

export type ThemeName = 'tricolor' | 'minimal' | 'highContrast' | 'maroonGold' | 'dark';

export const themeMap: Record<ThemeName, ThemeOptions> = {
  tricolor: tricolorTheme,
  minimal: minimalTheme,
  highContrast: highContrastTheme,
  maroonGold: maroonGoldTheme,
  dark: darkTheme,
};

export const getTheme = (themeName: ThemeName) => {
  return createTheme(themeMap[themeName]);
};








import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Link,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Facebook,
  Twitter,
  YouTube,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { GlobalLoader } from '../components/GlobalLoader';
import { ScrollProgressIndicator } from '../components/ScrollProgressIndicator';
import { ThemeName } from '../theme/themes';
import logoImage from '../assest/Logo 1.jpg';

interface MainLayoutProps {
  children: React.ReactNode;
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  fontSize: 'small' | 'medium' | 'large';
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
  contrastMode: 'light' | 'dark' | 'high';
  onContrastModeChange: (mode: 'light' | 'dark' | 'high') => void;
  loading?: boolean;
}

const navigationItems = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.activities', path: '/activities' },
  { key: 'nav.membership', path: '/membership' },
  { key: 'nav.media', path: '/media' },
  { key: 'nav.blogs', path: '/blogs' },
  { key: 'nav.contact', path: '/contact' },
];

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentTheme,
  onThemeChange,
  fontSize,
  onFontSizeChange: _onFontSizeChange,
  contrastMode: _contrastMode,
  onContrastModeChange: _onContrastModeChange,
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for search functionality
    console.log('Search:', searchQuery);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 280 }}>
      <Box
        component="img"
        src={logoImage}
        alt="Akhil Bhartiya Grahak Panchayat Logo"
        sx={{
          height: 60,
          width: 'auto',
          maxWidth: '200px',
          objectFit: 'contain',
          my: 2,
          mx: 'auto',
        }}
      />
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemText primary={t(item.key)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <GlobalLoader loading={loading} fullScreen />
      <ScrollProgressIndicator />
      
      {/* Skip to content link */}
      <Link
        href="#main-content"
        sx={{
          position: 'absolute',
          top: -40,
          left: 0,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          padding: 1,
          textDecoration: 'none',
          zIndex: 10000,
          '&:focus': {
            top: 0,
          },
        }}
      >
        {t('skip.content')}
      </Link>

      {/* Top Utility Bar */}
      <Box
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : theme.palette.grey[100],
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" fontWeight={600}>
                {t('header.fullName')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('header.shortDescription')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <LanguageSwitcher />
              <ThemeSwitcher
                currentTheme={currentTheme}
                onThemeChange={onThemeChange}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Primary Header */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            {/* Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                textDecoration: 'none',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              <Box
                component="img"
                src={logoImage}
                alt="Akhil Bhartiya Grahak Panchayat Logo"
                sx={{
                  height: { xs: 60, sm: 70, md: 80 },
                  width: 'auto',
                  objectFit: 'contain',
                  maxWidth: { xs: '200px', sm: '250px', md: '300px' },
                }}
              />
            </Box>

            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => {
                  window.open('https://pages.razorpay.com/ABGPmembership', '_blank');
                }}
              >
                {t('header.donate')}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => {
                  const element = document.getElementById('membership');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {t('header.membership')}
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Navigation Bar */}
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              justifyContent: 'space-between',
              px: { xs: 1, md: 2 },
            }}
          >
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.key}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    sx={{
                      fontWeight: location.pathname === item.path ? 700 : 400,
                      textDecoration: location.pathname === item.path ? 'underline' : 'none',
                    }}
                  >
                    {t(item.key)}
                  </Button>
                ))}
              </Box>
            )}

            {/* Search Box */}
            <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: { xs: 1, md: 0 } }}>
              <TextField
                size="small"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                }}
              />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        id="main-content"
        component="main"
        sx={{
          flexGrow: 1,
          fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.125rem' : '1rem',
        }}
        role="main"
      >
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : theme.palette.grey[900],
          color: 'white',
          pt: 8,
          pb: 4,
          mt: 'auto',
          borderTop: `4px solid ${theme.palette.secondary.main}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Brand Section */}
            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1 }}>
                  {t('header.fullName')}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
                  {t('header.shortDescription')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6, pt: 2 }}>
                  {t('footer.copyright')}
                </Typography>
              </Stack>
            </Grid>

            {/* Navigation Links Section */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {t('nav.quickLinks') || 'Quick Links'}
              </Typography>
              <Stack spacing={1.5}>
                {navigationItems.map((item) => (
                  <Link
                    key={item.key}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      opacity: 0.8,
                      transition: 'all 0.2s',
                      '&:hover': {
                        opacity: 1,
                        color: theme.palette.secondary.main,
                        transform: 'translateX(5px)',
                      },
                    }}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Social Connect Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Connect with Us
              </Typography>
              <Stack spacing={1}>
                <Button
                  component="a"
                  href="#"
                  color="inherit"
                  startIcon={<Facebook />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: '#1877F2' },
                  }}
                >
                  Facebook
                </Button>
                <Button
                  component="a"
                  href="#"
                  color="inherit"
                  startIcon={<Twitter />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: '#1DA1F2' },
                  }}
                >
                  Twitter
                </Button>
                <Button
                  component="a"
                  href="#"
                  color="inherit"
                  startIcon={<YouTube />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: '#FF0000' },
                  }}
                >
                  YouTube
                </Button>
              </Stack>
            </Grid>

            {/* Legal Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Legal & Support
              </Typography>
              <Stack spacing={1.5}>
                <Link
                  component={RouterLink}
                  to="/terms"
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: theme.palette.secondary.main },
                  }}
                >
                  {t('footer.terms')}
                </Link>
                <Link
                  href="#"
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: theme.palette.secondary.main },
                  }}
                >
                  {t('footer.privacy')}
                </Link>
                <Link
                  href="#"
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: theme.palette.secondary.main },
                  }}
                >
                  Help Center
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};


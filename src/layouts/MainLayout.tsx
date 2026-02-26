import React, { useState, useEffect } from 'react';
import { LoginDialog } from '../components/LoginDialog';
import { useAuth } from '../contexts/AuthContext';
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
  contrastMode: 'light';
  onContrastModeChange: (mode: 'light') => void;
  loading?: boolean;
}

const navigationItems = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.activities', path: '/activities' },
  { key: 'nav.gyandeep', path: '/gyandeep' },
  { key: 'nav.spandana', path: '/spandana' },
  { key: 'nav.membership', path: '/membership' },
  { key: 'nav.media', path: '/media' },
  { key: 'nav.gallery', path: '/gallery' },
  { key: 'nav.blogs', path: '/blogs' },
  { key: 'nav.faq', path: '/faq' },
  { key: 'nav.petition', path: '/petition' },
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
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);

  const quickLinks = [
    ...navigationItems,
    { key: 'nav.constitution', path: '/constitution' },
    { key: 'nav.courtDecisions', path: '/court-decisions' },
  ];

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
        alt={t('header.fullName')}
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
                alt={t('header.fullName')}
                sx={{
                  height: { xs: 60, sm: 70, md: 80 },
                  width: 'auto',
                  objectFit: 'contain',
                  maxWidth: { xs: '200px', sm: '250px', md: '300px' },
                }}
              />
            </Box>

            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                disabled
                onClick={() => {
                  // TODO: Replace with new Razorpay integration
                  console.log('Donate button clicked - waiting for new Razorpay integration');
                }}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  // Disabled: readable contrast (dark text on light bg)
                  '&.Mui-disabled': {
                    backgroundColor: (theme) => theme.palette.grey[300],
                    color: (theme) => theme.palette.grey[700],
                  },
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
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                {t('header.membership')}
              </Button>
              {!isAuthenticated && (
                <Button
                  component={RouterLink}
                  to="/login?mode=director"
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  {t('header.director')}
                </Button>
              )}
              <Button
                component={RouterLink}
                to={isAuthenticated ? '/panel' : '/login'}
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow: (theme) => theme.shadows[2],
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: (theme) => theme.shadows[4],
                  },
                }}
              >
                {isAuthenticated ? t('panel.title') : t('header.login')}
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => logout()}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  {t('panel.logout')}
                </Button>
              )}
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
          pt: 3,
          pb: 2,
          mt: 'auto',
          borderTop: `2px solid ${theme.palette.secondary.main}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
            {/* Brand Section */}
            <Grid item xs={12} sm={6} md={4} sx={{ order: { xs: 1, md: 1 } }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                  {t('header.fullName')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.6, fontSize: '0.75rem' }}>
                  {t('header.shortDescription')}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6, pt: 1, fontSize: '0.7rem' }}>
                  {t('footer.copyright')}
                </Typography>
              </Stack>
            </Grid>

            {/* Navigation Links Section - two columns */}
            <Grid item xs={12} sm={6} md={3} sx={{ order: { xs: 3, md: 2 } }}>
              <Typography variant="caption" fontWeight={600} gutterBottom sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                {t('nav.quickLinks')}
              </Typography>
              <Grid container spacing={0} sx={{ flexWrap: 'wrap' }}>
                <Grid item xs={6}>
                  <Stack spacing={0.8}>
                    {quickLinks.slice(0, 7).map((item) => (
                      <Link
                        key={item.key}
                        component={RouterLink}
                        to={item.path}
                        color="inherit"
                        sx={{
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          opacity: 0.8,
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: 1,
                            color: theme.palette.secondary.main,
                            transform: 'translateX(3px)',
                          },
                        }}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={0.8}>
                    {quickLinks.slice(7, 14).map((item) => (
                      <Link
                        key={item.key}
                        component={RouterLink}
                        to={item.path}
                        color="inherit"
                        sx={{
                          textDecoration: 'none',
                          fontSize: '0.8rem',
                          opacity: 0.8,
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: 1,
                            color: theme.palette.secondary.main,
                            transform: 'translateX(3px)',
                          },
                        }}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>

            {/* Social Connect Section */}
            <Grid item xs={12} sm={6} md={3} sx={{ order: { xs: 4, md: 3 } }}>
              <Typography variant="caption" fontWeight={600} gutterBottom sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                {t('footer.connect')}
              </Typography>
              <Stack spacing={0.5}>
                <Button
                  component="a"
                  href="#"
                  color="inherit"
                  startIcon={<Facebook sx={{ fontSize: '1rem' }} />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    minHeight: '32px',
                    padding: '4px 8px',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: '#1877F2' },
                  }}
                >
                  {t('footer.social.facebook')}
                </Button>
                <Button
                  component="a"
                  href="#"
                  color="inherit"
                  startIcon={<Twitter sx={{ fontSize: '1rem' }} />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    minHeight: '32px',
                    padding: '4px 8px',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: '#1DA1F2' },
                  }}
                >
                  {t('footer.social.twitter')}
                </Button>
                <Button
                  component="a"
                  href="#"
                  color="inherit"
                  startIcon={<YouTube sx={{ fontSize: '1rem' }} />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    minHeight: '32px',
                    padding: '4px 8px',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: '#FF0000' },
                  }}
                >
                  {t('footer.social.youtube')}
                </Button>
              </Stack>
            </Grid>

            {/* Legal Section - right after Brand on mobile to remove gap */}
            <Grid item xs={12} sm={6} md={3} sx={{ order: { xs: 2, md: 4 } }}>
              <Typography variant="caption" fontWeight={600} gutterBottom sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                {t('footer.legal')}
              </Typography>
              <Stack spacing={0.35}>
                <Link
                  component={RouterLink}
                  to="/terms"
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.8rem',
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
                    fontSize: '0.8rem',
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
                    fontSize: '0.8rem',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, color: theme.palette.secondary.main },
                  }}
                >
                  {t('footer.help')}
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
};


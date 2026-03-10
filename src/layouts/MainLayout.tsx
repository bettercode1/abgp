import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  MenuItem,
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
  KeyboardArrowDown,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
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

type NavChild = { key: string; path: string };
type NavItem = { key: string; path: string; children?: NavChild[] };

const navigationItems: NavItem[] = [
  { key: 'nav.home', path: '/' },
  {
    key: 'nav.about',
    path: '/about',
    children: [
      { key: 'nav.about', path: '/about' },
      { key: 'nav.history', path: '/history' },
      { key: 'nav.constitution', path: '/constitution' },
      { key: 'nav.courtDecisions', path: '/court-decisions' },
      { key: 'nav.terms', path: '/terms' },
    ],
  },
  { key: 'nav.activities', path: '/activities' },
  {
    key: 'nav.gyandeep',
    path: '/gyandeep',
    children: [
      { key: 'nav.gyandeep', path: '/gyandeep' },
      { key: 'nav.spandana', path: '/spandana' },
    ],
  },
  { key: 'nav.membership', path: '/membership' },
  { key: 'nav.prantContacts', path: '/prant-contacts' },
  {
    key: 'nav.media',
    path: '/media',
    children: [
      { key: 'nav.blogs', path: '/blogs' },
      { key: 'nav.news', path: '/news' },
      { key: 'nav.events', path: '/events' },
      { key: 'nav.videos', path: '/videos' },
    ],
  },
  { key: 'nav.gallery', path: '/gallery' },
  { key: 'nav.kshetraMantri', path: '/kshetra-mantri' },
  { key: 'nav.quickMemos', path: '/quickmemos' },
  { key: 'nav.faq', path: '/faq' },
  { key: 'nav.petition', path: '/petition' },
  { key: 'nav.contact', path: '/contact' },
];

const flattenNavItems = (items: NavItem[]): { key: string; path: string }[] =>
  items.flatMap((item) =>
    item.children ? item.children : [{ key: item.key, path: item.path }]
  );

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
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const drawerPaperRef = useRef<HTMLDivElement>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownAnchor, setDropdownAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);

  const quickLinks = flattenNavItems(navigationItems);

  const isAboutActive = location.pathname === '/about' || location.pathname === '/history' || location.pathname === '/constitution' || location.pathname === '/court-decisions' || location.pathname === '/terms';
  const isGyandeepActive = location.pathname === '/gyandeep' || location.pathname === '/spandana';
  const isMediaActive = location.pathname === '/media' || location.pathname === '/blogs' || location.pathname === '/news' || location.pathname === '/events' || location.pathname === '/videos';

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleDrawerToggle = () => {
    const opening = !mobileOpen;
    if (opening && document.activeElement instanceof HTMLElement && document.getElementById('root')?.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const paper = drawerPaperRef.current;
    if (paper) {
      const focusable = paper.querySelector<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
      else paper.focus();
    }
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/search');
    }
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box
        component={RouterLink}
        to="/"
        onClick={handleDrawerToggle}
        sx={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
      >
        <Box
          component="img"
          src={logoImage}
          alt={t('header.fullName')}
          sx={{
            height: 56,
            width: 'auto',
            maxWidth: '200px',
            objectFit: 'contain',
            mx: 'auto',
          }}
        />
      </Box>
      <Divider sx={{ my: 2 }} />
      <List onClick={handleDrawerToggle}>
        {navigationItems.map((item) =>
          item.children ? (
            <React.Fragment key={item.key}>
              <ListItem disablePadding sx={{ pt: 1.5, pb: 0 }}>
                <ListItemText
                  primary={t(item.key)}
                  primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600, color: 'text.secondary' }}
                />
              </ListItem>
              {item.children.map((child) => (
                <ListItem key={child.key} disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to={child.path}
                    selected={location.pathname === child.path}
                    sx={{ pl: 3 }}
                  >
                    <ListItemText primary={t(child.key)} />
                  </ListItemButton>
                </ListItem>
              ))}
            </React.Fragment>
          ) : (
            <ListItem key={item.key} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemText primary={t(item.key)} />
              </ListItemButton>
            </ListItem>
          )
        )}
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

      {/* Top Utility Bar - orange/saffron on home, clean elsewhere */}
      <Box
        sx={{
          background: location.pathname === '/'
            ? theme.palette.secondary.main
            : theme.palette.mode === 'dark'
              ? theme.palette.background.default
              : theme.palette.grey[100],
          color: location.pathname === '/' ? theme.palette.secondary.contrastText : theme.palette.text.primary,
          py: { xs: 1, sm: 1.5 },
          borderBottom: location.pathname === '/' ? `3px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
          transition: 'background 0.3s ease, color 0.3s ease',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.9, fontSize: { xs: '0.6875rem', sm: '0.75rem' }, display: { xs: 'none', sm: 'block' } }}>
                {t('header.shortDescription')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <LanguageSwitcher />
              <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Primary Header - logo + org name + CTAs */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Toolbar sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: 2, py: { xs: 2, md: 1.5 }, minHeight: { xs: 'auto', md: 72 } }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                gap: 2,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'opacity 0.2s ease',
                '&:hover': { opacity: 0.9 },
              }}
            >
              <Box
                component="img"
                src={logoImage}
                alt={t('header.fullName')}
                sx={{
                  height: { xs: 56, sm: 64, md: 68 },
                  width: 'auto',
                  objectFit: 'contain',
                  maxWidth: { xs: '160px', sm: '200px', md: '220px' },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              {!isAuthenticated && (
                <Button
                  component={RouterLink}
                  to="/login?mode=director"
                  variant="outlined"
                  color="primary"
                  size="medium"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: 2,
                    px: 2.5,
                    '&:hover': { borderWidth: 2 },
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
                size="medium"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                {isAuthenticated ? t('panel.title') : t('header.login')}
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="medium"
                  onClick={() => logout()}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: 2,
                    px: 2.5,
                    '&:hover': { borderWidth: 2 },
                  }}
                >
                  {t('panel.logout')}
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Navigation Bar - dark blue, uppercase labels, search */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: 0, minHeight: { xs: 48, md: 52 } }}>
            {isMobile ? (
              <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                {navigationItems.map((item) =>
                  item.children ? (
                    <React.Fragment key={item.key}>
                      <Button
                        color="inherit"
                        onClick={(e) => setDropdownAnchor({ el: e.currentTarget, id: item.key })}
                        endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                        sx={{
                          fontWeight: (item.key === 'nav.about' ? isAboutActive : item.key === 'nav.gyandeep' ? isGyandeepActive : item.key === 'nav.media' ? isMediaActive : false) ? 700 : 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontSize: '0.8rem',
                          borderRadius: 0,
                          px: 1.5,
                          py: 1.25,
                          minHeight: 52,
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        {t(item.key)}
                      </Button>
                      <Menu
                        anchorEl={dropdownAnchor?.id === item.key ? dropdownAnchor.el : null}
                        open={dropdownAnchor?.id === item.key}
                        onClose={() => setDropdownAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        slotProps={{
                          paper: {
                            sx: {
                              mt: 0,
                              minWidth: 220,
                              borderRadius: 0,
                              boxShadow: theme.shadows[4],
                              borderTop: `3px solid ${theme.palette.secondary.main}`,
                            },
                          },
                        }}
                      >
                        {item.children.map((child) => (
                          <MenuItem
                            key={child.key}
                            component={RouterLink}
                            to={child.path}
                            onClick={() => setDropdownAnchor(null)}
                            selected={location.pathname === child.path}
                            sx={{ py: 1.25, fontSize: '0.9rem' }}
                          >
                            {t(child.key)}
                          </MenuItem>
                        ))}
                      </Menu>
                    </React.Fragment>
                  ) : (
                    <Button
                      key={item.key}
                      component={RouterLink}
                      to={item.path}
                      color="inherit"
                      sx={{
                        fontWeight: location.pathname === item.path ? 700 : 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontSize: '0.8rem',
                        borderRadius: 0,
                        px: 1.5,
                        py: 1.25,
                        minHeight: 52,
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                      }}
                    >
                      {t(item.key)}
                    </Button>
                  )
                )}
              </Box>
            )}

            <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: { xs: 1, md: 0 }, minWidth: { md: 220 } }}>
              <TextField
                size="small"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' },
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
          keepMounted: true,
          disableEnforceFocus: true,
          disableAutoFocus: true,
        }}
        PaperProps={{
          ref: drawerPaperRef,
          tabIndex: -1,
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

      {/* Footer - simple black */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
        }}
      >
        <Container maxWidth="lg" sx={{ pt: 4, pb: 3, px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
            {/* Left: Logo, description, contact, social */}
            <Grid item xs={12} md={5}>
              <Box component={RouterLink} to="/" sx={{ display: 'inline-block', textDecoration: 'none', color: 'inherit', mb: 2 }}>
                <Box
                  component="img"
                  src={logoImage}
                  alt={t('header.fullName')}
                  sx={{ height: 48, width: 'auto', maxWidth: 160, objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: '0.8125rem', mb: 2 }}>
                {t('header.shortDescription')}
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Link
                  href={`mailto:${t('contact.key.email')}`}
                  color="inherit"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '0.8125rem',
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    '&:hover': { color: '#fff' },
                  }}
                >
                  <Email sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }} />
                  {t('contact.key.email')}
                </Link>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.85)' }}>
                  <LocationOn sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', flexShrink: 0, mt: 0.25 }} />
                  {t('contact.delhi.address')}
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton component="a" href="#" aria-label="Facebook" sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#fff' } }}>
                  <Facebook fontSize="small" />
                </IconButton>
                <IconButton component="a" href="#" aria-label="Twitter" sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#fff' } }}>
                  <Twitter fontSize="small" />
                </IconButton>
                <IconButton component="a" href="#" aria-label="YouTube" sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#fff' } }}>
                  <YouTube fontSize="small" />
                </IconButton>
              </Box>
            </Grid>

            {/* Middle: Quick links */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', fontSize: '0.875rem', mb: 2 }}>
                {t('nav.quickLinks')}
              </Typography>
              <Stack spacing={1}>
                {quickLinks.slice(0, 8).map((item) => (
                  <Link
                    key={item.key}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.8125rem',
                      textDecoration: 'none',
                      '&:hover': { color: '#fff' },
                    }}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* Right: Legal */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', fontSize: '0.875rem', mb: 2 }}>
                {t('footer.legal')}
              </Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/terms" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8125rem', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  {t('footer.terms')}
                </Link>
                <Link href="#" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8125rem', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  {t('footer.privacy')}
                </Link>
                <Link component={RouterLink} to="/contact" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8125rem', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                  {t('footer.help')}
                </Link>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 3 }} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
            {t('footer.copyright')}
          </Typography>
        </Container>
      </Box>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
};


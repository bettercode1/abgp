import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart,
  Folder,
  Lock,
  ChevronRight,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { DirectorSectionKey } from '../lib/directorContent';

const DRAWER_WIDTH = 260;

export type PanelView = 'profile' | 'analytics' | 'content' | 'prant-logins';

export interface DashboardSidebarProps {
  activeView: PanelView;
  contentSection: DirectorSectionKey;
  onNavigate: (view: PanelView, contentSection?: DirectorSectionKey) => void;
  isDirector: boolean;
  isPrant: boolean;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const CONTENT_SECTIONS: DirectorSectionKey[] = ['blog', 'news', 'events', 'videos', 'gallery', 'ads'];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeView,
  contentSection,
  onNavigate,
  isDirector,
  sidebarOpen,
  onSidebarToggle,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [contentExpanded, setContentExpanded] = useState(activeView === 'content');
  const drawerPaperRef = useRef<HTMLDivElement>(null);

  // Move focus into the drawer when it opens so #root is not aria-hidden while a descendant has focus
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;
    const paper = drawerPaperRef.current;
    if (paper) {
      const focusable = paper.querySelector<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
      else paper.focus();
    }
  }, [isMobile, sidebarOpen]);

  const handleContentToggle = () => {
    setContentExpanded((prev) => !prev);
    if (!contentExpanded) onNavigate('content', contentSection);
  };

  const sidebarContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header: hamburger + title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 56,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <IconButton
          onClick={onSidebarToggle}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          sx={{ color: 'text.primary' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} color="primary" noWrap sx={{ flex: 1 }}>
          {t('panel.sidebarTitle')}
        </Typography>
      </Box>

      <List component="nav" sx={{ flex: 1, py: 1, px: 1.5 }}>
        {/* Dashboard / Profile */}
        <ListItemButton
          selected={activeView === 'profile'}
          onClick={() => onNavigate('profile')}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            '&.Mui-selected': {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': { bgcolor: theme.palette.primary.dark },
              '& .MuiListItemIcon-root': { color: 'inherit' },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('panel.sidebarDashboard')} primaryTypographyProps={{ fontSize: '0.9rem' }} />
        </ListItemButton>

        {/* ANALYTICS (Director only) */}
        {isDirector && (
          <>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 2,
                py: 1,
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {t('panel.sidebarCategoryAnalytics')}
            </Typography>
            <ListItemButton
              selected={activeView === 'analytics'}
              onClick={() => onNavigate('analytics')}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <BarChart fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('panel.analytics')} primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItemButton>
          </>
        )}

        {/* CONTENT */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 2,
            py: 1,
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {t('panel.sidebarCategoryContent')}
        </Typography>
        <ListItemButton
          onClick={handleContentToggle}
          selected={activeView === 'content'}
          sx={{
            borderRadius: 1,
            '&.Mui-selected': { bgcolor: 'action.selected' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Folder fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('panel.sidebarContent')} primaryTypographyProps={{ fontSize: '0.9rem' }} />
          <ChevronRight
            sx={{
              transform: contentExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: theme.transitions.create('transform', { duration: theme.transitions.duration.short }),
            }}
          />
        </ListItemButton>
        <Collapse in={contentExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {CONTENT_SECTIONS.map((section) => {
              const label = t(`panel.section${section.charAt(0).toUpperCase()}${section.slice(1)}`);
              const isSectionActive = activeView === 'content' && contentSection === section;
              return (
                <ListItemButton
                  key={section}
                  selected={isSectionActive}
                  onClick={() => onNavigate('content', section)}
                  sx={{
                    pl: 4,
                    py: 0.5,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      '&:hover': { bgcolor: theme.palette.primary.dark },
                    },
                  }}
                >
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                    sx={{ '& .MuiListItemText-primary': { fontWeight: isSectionActive ? 600 : 400 } }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>

        {/* DIRECTOR (Prant logins - Director only) */}
        {isDirector && (
          <>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                px: 2,
                py: 1,
                mt: 1,
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {t('panel.sidebarCategoryDirector')}
            </Typography>
            <ListItemButton
              selected={activeView === 'prant-logins'}
              onClick={() => onNavigate('prant-logins')}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': { bgcolor: theme.palette.primary.dark },
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Lock fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('panel.prantListTitle')} primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={onSidebarToggle}
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
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: 0,
              left: 0,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: theme.transitions.create('width', { duration: theme.transitions.duration.standard }),
      }}
    >
      {sidebarContent}
    </Box>
  );
};

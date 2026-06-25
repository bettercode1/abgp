import type { SxProps, Theme } from '@mui/material';

/** Outer padding for director/prant panel main content area */
export const PANEL_CONTENT_PY = { xs: 1, md: 1.5 } as const;
export const PANEL_CONTENT_PX = { xs: 1, sm: 1.5 } as const;
export const PANEL_STACK_SPACING = { xs: 1.5, md: 2 } as const;

export const PANEL_TOP_BAR_SX = {
  minHeight: 48,
  px: { xs: 1, sm: 1.5 },
} as const;

export const PANEL_TABLE_COMPACT_CELL = {
  px: { xs: 1, sm: 1.25 },
  py: 0.75,
  fontSize: '0.8125rem',
  lineHeight: 1.3,
} as const;

type PanelPaperOptions = {
  borderAccent?: 'primary' | 'secondary' | 'info';
  overflow?: 'hidden' | 'visible';
};

export function panelPaperSx(theme: Theme, options?: PanelPaperOptions): SxProps<Theme> {
  const accent =
    options?.borderAccent === 'secondary'
      ? theme.palette.secondary?.main || theme.palette.primary.dark
      : options?.borderAccent === 'info'
        ? theme.palette.info?.main || theme.palette.primary.main
        : theme.palette.primary.main;

  return {
    p: { xs: 1.5, sm: 2 },
    borderRadius: 2,
    overflow: options?.overflow ?? 'hidden',
    ...(options?.borderAccent && { borderLeft: `3px solid ${accent}` }),
  };
}

export function panelTableContainerSx(): SxProps<Theme> {
  return {
    width: '100%',
    overflowX: 'auto',
    borderRadius: 1.5,
    WebkitOverflowScrolling: 'touch',
    '& .MuiTableCell-root': PANEL_TABLE_COMPACT_CELL,
    '& .MuiTableCell-head': {
      fontWeight: 600,
      bgcolor: 'action.hover',
      whiteSpace: 'nowrap',
    },
  };
}

/** Consistent outlined card for mobile list rows in the admin panel */
export const panelMobileCardSx: SxProps<Theme> = {
  p: 1.25,
  borderRadius: 1.5,
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
};

export const panelPaginationSx: SxProps<Theme> = {
  borderTop: 1,
  borderColor: 'divider',
  flexWrap: 'wrap',
  '& .MuiTablePagination-toolbar': {
    flexWrap: 'wrap',
    gap: 0.5,
    px: { xs: 0.5, sm: 1 },
    minHeight: { xs: 44, sm: 52 },
  },
  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
    m: 0,
  },
  '& .MuiTablePagination-select': {
    fontSize: { xs: '0.75rem', sm: '0.875rem' },
  },
};

export const panelTopBarTitleSx: SxProps<Theme> = {
  fontWeight: 600,
  flex: 1,
  minWidth: 0,
  fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
};

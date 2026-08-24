import { useCallback, useState } from 'react';
import {
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import StorageIcon from '@mui/icons-material/Storage';
import { useTranslation } from 'react-i18next';
import { downloadPaymentsReport, type PaymentInsightsParams } from '../../lib/api';

export type ReportDownloadScope = 'filtered' | 'full';

interface MembershipReportDownloadMenuProps {
  token: string | null;
  filters: PaymentInsightsParams;
  disabled?: boolean;
  onError?: (message: string) => void;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

export function MembershipReportDownloadMenu({
  token,
  filters,
  disabled = false,
  onError,
  size = 'small',
  fullWidth = false,
}: MembershipReportDownloadMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [downloading, setDownloading] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleDownload = useCallback(
    async (scope: ReportDownloadScope) => {
      setAnchorEl(null);
      if (!token) {
        onError?.(t('panel.insightsAuthRequired'));
        return;
      }
      setDownloading(true);
      try {
        await downloadPaymentsReport(token, { ...filters, scope });
      } catch (err) {
        onError?.(err instanceof Error ? err.message : t('panel.reportDownloadError'));
      } finally {
        setDownloading(false);
      }
    },
    [token, filters, onError, t]
  );

  return (
    <>
      <Button
        variant="contained"
        size={size}
        fullWidth={fullWidth}
        startIcon={downloading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
        endIcon={!downloading ? <ArrowDropDownIcon /> : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={downloading || disabled || !token}
        sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
      >
        {t('panel.downloadReport')}
      </Button>
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => void handleDownload('filtered')} disabled={downloading}>
          <ListItemIcon>
            <FilterListIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('panel.downloadReportFiltered')}
            secondary={t('panel.downloadReportFilteredHint')}
          />
        </MenuItem>
        <MenuItem onClick={() => void handleDownload('full')} disabled={downloading}>
          <ListItemIcon>
            <StorageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('panel.downloadReportFull')}
            secondary={t('panel.downloadReportFullHint')}
          />
        </MenuItem>
      </Menu>
    </>
  );
}

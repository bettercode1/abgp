import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: theme.shadows[24],
        },
      }}
    >
      <Box
        sx={{
          height: 5,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
        }}
      />
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 700,
          color: theme.palette.primary.main,
          pt: 3,
          pb: 1,
        }}
      >
        <PaymentIcon sx={{ fontSize: 32 }} />
        {t('panel.paymentTitle')}
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {t('panel.paymentMessage')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'center' }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: theme.shadows[4],
            '&:hover': {
              boxShadow: theme.shadows[8],
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          {t('panel.proceedToPay')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

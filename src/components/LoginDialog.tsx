import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="h6" fontWeight={700} align="center" gutterBottom>
          {t('header.login')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {t('login.chooseLoginType')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GroupsOutlinedIcon />}
            onClick={() => goTo('/login/member')}
            sx={{ py: 1.5, textTransform: 'none', fontWeight: 600, justifyContent: 'flex-start', px: 2 }}
          >
            {t('login.roleCustomer')}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AccountBalanceOutlinedIcon />}
            onClick={() => goTo('/login/prant')}
            sx={{ py: 1.5, textTransform: 'none', fontWeight: 600, justifyContent: 'flex-start', px: 2 }}
          >
            {t('login.rolePresident')}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
          {t('login.back')}
        </Button>
        <Button onClick={() => goTo('/login')} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {t('login.viewAllOptions')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/Logo 1.jpg';

export const NEW_MEMBER_POPUP_STORAGE_KEY = 'abgp-new-member-popup-dismissed';

interface NewMemberRegistrationPopupProps {
  open: boolean;
  onDismiss: () => void;
}

const highlightItems = [
  {
    icon: GroupsOutlinedIcon,
    titleKey: 'registrationPopup.joinMovement',
    titleDefault: 'Join the consumer movement',
    descKey: 'registrationPopup.joinMovementDesc',
    descDefault: 'Become part of Akhil Bhartiya Grahak Panchayat and support consumer rights.',
  },
  {
    icon: VerifiedUserOutlinedIcon,
    titleKey: 'registrationPopup.simpleProcess',
    titleDefault: 'Quick & secure registration',
    descKey: 'registrationPopup.simpleProcessDesc',
    descDefault: 'Fill your details once and complete membership with a simple online payment.',
  },
  {
    icon: PaymentOutlinedIcon,
    titleKey: 'registrationPopup.membershipFee',
    titleDefault: 'Membership at ₹100',
    descKey: 'registrationPopup.membershipFeeDesc',
    descDefault: 'Start your membership journey with secure Razorpay payment.',
  },
] as const;

export const NewMemberRegistrationPopup: React.FC<NewMemberRegistrationPopupProps> = ({
  open,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRegister = () => {
    onDismiss();
    navigate('/login?tab=register');
  };

  return (
    <Dialog
      open={open}
      onClose={onDismiss}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      scroll="paper"
      sx={{ zIndex: 10001 }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.62)',
          backdropFilter: 'blur(4px)',
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          px: { xs: 2.5, sm: 3 },
          pt: { xs: 3, sm: 3.5 },
          pb: 2.5,
          color: '#fff',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, #4F46E5 100%)`,
        }}
      >
        <IconButton
          aria-label="Close"
          onClick={onDismiss}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: 'rgba(255,255,255,0.92)',
            bgcolor: 'rgba(255,255,255,0.12)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            component="img"
            src={logoImage}
            alt="ABGP"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            }}
          />
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: '0.12em', fontWeight: 700 }}>
              {t('registrationPopup.welcome', 'Welcome to ABGP')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {t('registrationPopup.title', 'Become a New Member')}
            </Typography>
          </Box>
        </Stack>

        <Typography sx={{ opacity: 0.95, lineHeight: 1.65, maxWidth: 520 }}>
          {t(
            'registrationPopup.subtitle',
            'Register today and be part of India’s national-level consumer movement.'
          )}
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2.5, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={1.75} sx={{ mb: 3 }}>
          {highlightItems.map((item) => {
            const Icon = item.icon;
            return (
              <Stack
                key={item.titleKey}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#EEF2FF',
                    color: theme.palette.primary.main,
                    flexShrink: 0,
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.25 }}>
                    {t(item.titleKey, item.titleDefault)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.55 }}>
                    {t(item.descKey, item.descDefault)}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>

        <Stack spacing={1.25}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<PersonAddAlt1OutlinedIcon />}
            onClick={handleRegister}
            sx={{
              py: 1.35,
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              fontSize: '1rem',
              boxShadow: '0 10px 24px rgba(30, 58, 138, 0.28)',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            {t('registrationPopup.cta', 'Register as New Member')}
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={onDismiss}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}
          >
            {t('registrationPopup.later', 'Maybe later')}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

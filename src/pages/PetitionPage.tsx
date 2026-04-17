import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Email, Dashboard } from '@mui/icons-material';

type Petition = {
  id: string;
  title: string;
  description: string;
  targetEmail: string;
  createdAt: string;
};

const PETITIONS_STORAGE_KEY = 'abgp-petitions';

const readPetitions = (): Petition[] => {
  try {
    const raw = localStorage.getItem(PETITIONS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Petition[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const PetitionPage: React.FC = () => {
  const [petitions, setPetitions] = useState<Petition[]>([]);

  const createMailtoLink = (petition: Petition): string => {
    const subject = encodeURIComponent(petition.title);
    const bodyTemplate = `${petition.description}\n\nName:\nMobile:\nMessage:`;
    const body = encodeURIComponent(bodyTemplate);
    return `mailto:${petition.targetEmail}?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    setPetitions(readPetitions());
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 7 },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(180deg, ${theme.palette.grey[100]} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                Public Petitions
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                Browse petitions and send your complaint directly from your email app.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/panel"
              variant="outlined"
              startIcon={<Dashboard />}
              sx={{ textTransform: 'none', fontWeight: 600, alignSelf: { xs: 'flex-start', md: 'auto' } }}
            >
              Director Dashboard
            </Button>
          </Stack>
        </Paper>

        {petitions.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              textAlign: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No petitions available yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A director can create petitions from the dashboard.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {petitions.map((petition) => (
              <Card key={petition.id} elevation={2} sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ pb: 1, flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {petition.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {petition.description}
                  </Typography>
                  <Chip
                    icon={<Email />}
                    label={`Target: ${petition.targetEmail}`}
                    size="small"
                    variant="outlined"
                    sx={{ maxWidth: '100%' }}
                  />
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<Email />}
                    href={createMailtoLink(petition)}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Send Email
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};


import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { type ApiPetition, fetchPetitionsFromApi } from '../../lib/api';

export const RecentPetitionsSection: React.FC = () => {
  const [recentPetitions, setRecentPetitions] = useState<ApiPetition[]>([]);
  const [petitionError, setPetitionError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadRecentPetitions = async () => {
      try {
        const petitions = await fetchPetitionsFromApi();
        const recent = [...petitions]
          .sort((a, b) => {
            const aTime = new Date(a.created_at ?? 0).getTime();
            const bTime = new Date(b.created_at ?? 0).getTime();
            return bTime - aTime;
          })
          .slice(0, 4);

        if (mounted) {
          setRecentPetitions(recent);
          setPetitionError('');
        }
      } catch {
        if (mounted) {
          setPetitionError('Unable to load recent petitions right now.');
        }
      }
    };

    void loadRecentPetitions();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Recent Petitions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Latest public petitions you can review quickly.
          </Typography>

          {petitionError ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {petitionError}
            </Alert>
          ) : recentPetitions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recent petitions available.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {recentPetitions.map((petition, index) => (
                <Box key={petition.petition_id}>
                  <Button
                    component={RouterLink}
                    to={`/petitions/${petition.petition_id}`}
                    variant="text"
                    color="primary"
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      px: 0,
                      py: 0.5,
                      fontWeight: 600,
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      lineHeight: 1.35,
                    }}
                  >
                    {petition.subject}
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {new Date(petition.created_at).toLocaleDateString()}
                  </Typography>
                  {index < recentPetitions.length - 1 ? <Divider sx={{ mt: 1 }} /> : null}
                </Box>
              ))}
              <Button
                component={RouterLink}
                to="/petitions"
                variant="outlined"
                size="small"
                sx={{ alignSelf: 'flex-start', textTransform: 'none', mt: 0.5 }}
              >
                View all petitions
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Description,
  Download,
  Visibility,
} from '@mui/icons-material';

export const ConstitutionPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.constitution')}</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom>
              {t('constitution.title')}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {t('constitution.amended')}
            </Typography>
            <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
              {t('constitution.fullName')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t('constitution.registration')}
            </Typography>
          </Box>

          {/* Memorandum of Association PDF Section */}
          <Card 
            elevation={4}
            sx={{ 
              mb: 6, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3} alignItems="center">
                <Description sx={{ fontSize: 64, opacity: 0.9 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {t('constitution.memorandumTitle')}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.95, mb: 3 }}>
                    {t('constitution.memorandumDescription')}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Visibility />}
                    href="/moa-abgp.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    {t('constitution.viewMoA')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Download />}
                    href="/moa-abgp.pdf"
                    download="MoA-ABGP.pdf"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('constitution.downloadMoA')}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* विचारबिंदू PDF Section */}
          <Card
            elevation={4}
            sx={{
              mb: 6,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'white',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3} alignItems="center">
                <Description sx={{ fontSize: 64, opacity: 0.9 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {t('constitution.vicharBinduTitle')}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.95, mb: 3 }}>
                    {t('constitution.vicharBinduDescription')}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Visibility />}
                    href="/vichar-bindu.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    {t('constitution.viewVicharBindu')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Download />}
                    href="/vichar-bindu.pdf"
                    download="विचारबिंदू.pdf"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {t('constitution.downloadVicharBindu')}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {t('constitution.nameTitle')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('constitution.nameContent')}
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              {t('constitution.addressTitle')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('constitution.addressContent')}
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              {t('constitution.areaTitle')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('constitution.areaContent')}
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              {t('constitution.objectsTitle')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t('constitution.objectsSubtitle')}
            </Typography>

            <Box sx={{ pl: { xs: 0, md: 4 } }}>
              <Typography variant="body1" paragraph>
                <strong>A.</strong> {t('constitution.objectA')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>B.</strong> {t('constitution.objectB')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>C.</strong> {t('constitution.objectC')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>D.</strong> {t('constitution.objectD')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>E.</strong> {t('constitution.objectE')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>F.</strong> {t('constitution.objectF')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>G.</strong> {t('constitution.objectG')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>H.</strong> {t('constitution.objectH')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>I.</strong> {t('constitution.objectI')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('constitution.objectI_2')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>J.</strong> {t('constitution.objectJ')}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>K.</strong> {t('constitution.objectK')}
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              {t('constitution.financialTitle')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('constitution.financialContent')}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
              {t('constitution.rulesTitle')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {t('constitution.rulesSubtitle')}
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              {t('constitution.part1Title')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>{t('constitution.part1NameTitle')}</strong> {t('constitution.part1NameContent')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>{t('constitution.part1OfficeTitle')}</strong> {t('constitution.part1OfficeContent')}
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              {t('constitution.part2Title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('constitution.part2Content')}
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t('constitution.part2FunctionsTitle')}
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ul" sx={{ pl: 3 }}>
                <li>{t('constitution.part2FunctionsList1')}</li>
                <li>{t('constitution.part2FunctionsList2')}</li>
                <li>{t('constitution.part2FunctionsList3')}</li>
                <li>{t('constitution.part2FunctionsList4')}</li>
                <li>{t('constitution.part2FunctionsList5')}</li>
                <li>{t('constitution.part2FunctionsList6')}</li>
                <li>{t('constitution.part2FunctionsList7')}</li>
                <li>{t('constitution.part2FunctionsList8')}</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              {t('constitution.part3Title')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>{t('constitution.part3OrdinaryTitle')}</strong> {t('constitution.part3OrdinaryContent')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>{t('constitution.part3FounderTitle')}</strong> {t('constitution.part3FounderContent')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>{t('constitution.part3ActiveTitle')}</strong> {t('constitution.part3ActiveContent')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>{t('constitution.part3LifeTitle')}</strong> {t('constitution.part3LifeContent')}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>{t('constitution.part3InviteeTitle')}</strong> {t('constitution.part3InviteeContent')}
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              {t('constitution.part4Title')}
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ol" sx={{ pl: 3 }}>
                <li>{t('constitution.part4List1')}</li>
                <li>{t('constitution.part4List2')}</li>
                <li>{t('constitution.part4List3')}</li>
                <li>{t('constitution.part4List4')}</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              {t('constitution.part5Title')}
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ol" sx={{ pl: 3 }}>
                <li>{t('constitution.part5List1')}</li>
                <li>{t('constitution.part5List2')}</li>
                <li>{t('constitution.part5List3')}</li>
                <li>{t('constitution.part5List4')}</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              {t('constitution.part6Title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('constitution.part6Content')}
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
                <li>{t('constitution.part6List1')}</li>
                <li>{t('constitution.part6List2')}</li>
                <li>{t('constitution.part6List3')}</li>
                <li>{t('constitution.part6List4')}</li>
                <li>{t('constitution.part6List5')}</li>
                <li>{t('constitution.part6List6')}</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mt: 6, p: 3, backgroundColor: theme.palette.primary.main, color: 'white', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('constitution.windingTitle')}
            </Typography>
            <Typography variant="body2">
              {t('constitution.windingContent')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};


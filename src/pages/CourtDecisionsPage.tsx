import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  useTheme,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gavel } from '@mui/icons-material';

export const CourtDecisionsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Link component={RouterLink} to="/about" color="inherit" underline="hover">
            About ABGP
          </Link>
          <Typography color="text.primary">Court Decisions</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
            <Gavel color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h3" component="h1" fontWeight={800} color="primary">
              Court Decisions
            </Typography>
          </Box>

          <Divider sx={{ mb: 6 }} />

          <Box sx={{ mb: 8 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom color="secondary">
              Allahabad High Court Ruling on RTI Act
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Bench: Hon'ble Sudhir Agarwal, J. & Hon'ble Shashi Kant, J.
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" paragraph>
              Petition Case No: 7222 of 2018 (Shri Mukul vs. State of UP & Others)
            </Typography>

            <Box sx={{ mt: 4, p: 3, backgroundColor: theme.palette.action.hover, borderRadius: 2, borderLeft: `6px solid ${theme.palette.primary.main}` }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Key Order Highlights:
              </Typography>
              <Typography variant="body1" component="div">
                <ol>
                  <li><strong>Expeditious Decisions:</strong> Under the Statute, Appellate Authorities are supposed to decide the matter expeditiously. Fixing dates of several months is not the intention of the Legislature.</li>
                  <li><strong>Transparency:</strong> The Statute has been framed for public welfare and encouraging transparency. Therefore, authorities under the Right to Information Act, 2005 must decide matters expeditiously.</li>
                  <li><strong>30-Day Deadline:</strong> The court ordered that the appeal in question be finalized by the authority concerned within 30 days from the date of production of a certified copy of the order.</li>
                </ol>
              </Typography>
            </Box>

            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
                अपील: सूचना आयोग को कोर्ट न समझे
              </Typography>
              <Typography variant="body1" paragraph>
                इलाहाबाद हाईकोर्ट ने महत्वपूर्ण निर्णय देते हुए साफ किया कि सूचना का अधिकार अधिनियम 2005 में सिर्फ 30 दिन में सूचना देने का नियम है न कि तारीख पर तारीख देने का!
              </Typography>
              <Typography variant="body1" paragraph>
                सभी कार्यकर्ताओं से अपील है कि सभी लोग आयोग में अपील दाखिल करते समय इस आदेश की प्रति संलग्न जरूर करें और आयोग को निर्देशित करें कि आयोग इस आदेश का पालन करते हुए 30 दिन में सूचना दिलवाए न कि तारिख पर तारिख लगाए। ऐसा न करने पर आयोग के खिलाफ माननीय उच्च न्यायालय के आदेश का पालन न कर रहे हैं कहकर कोर्ट में अवमान याचिका (Contempt Petition) दे सकते हैं।
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>Official Document</AlertTitle>
            View the full court decision PDF: <Link href="/court-decisions.pdf" target="_blank" rel="noopener">Court Decisions – Akhil Bhartiya Grahak Panchayat.pdf</Link>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
};


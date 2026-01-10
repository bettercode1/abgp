import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const ombudsmanContacts = [
    {
      city: t('faq.ombudsman.mumbai.city'),
      address: t('faq.ombudsman.mumbai.address'),
      jurisdiction: t('faq.ombudsman.mumbai.jurisdiction')
    },
    {
      city: t('faq.ombudsman.ahmedabad.city'),
      address: t('faq.ombudsman.ahmedabad.address'),
      jurisdiction: t('faq.ombudsman.ahmedabad.jurisdiction')
    },
    {
      city: t('faq.ombudsman.bhopal.city'),
      address: t('faq.ombudsman.bhopal.address'),
      jurisdiction: t('faq.ombudsman.bhopal.jurisdiction')
    },
    {
      city: t('faq.ombudsman.bhubaneshwar.city'),
      address: t('faq.ombudsman.bhubaneshwar.address'),
      jurisdiction: t('faq.ombudsman.bhubaneshwar.jurisdiction')
    },
    {
      city: t('faq.ombudsman.chandigarh.city'),
      address: t('faq.ombudsman.chandigarh.address'),
      jurisdiction: t('faq.ombudsman.chandigarh.jurisdiction')
    },
    {
      city: t('faq.ombudsman.chennai.city'),
      address: t('faq.ombudsman.chennai.address'),
      jurisdiction: t('faq.ombudsman.chennai.jurisdiction')
    },
    {
      city: t('faq.ombudsman.delhi.city'),
      address: t('faq.ombudsman.delhi.address'),
      jurisdiction: t('faq.ombudsman.delhi.jurisdiction')
    },
    {
      city: t('faq.ombudsman.guwahati.city'),
      address: t('faq.ombudsman.guwahati.address'),
      jurisdiction: t('faq.ombudsman.guwahati.jurisdiction')
    },
    {
      city: t('faq.ombudsman.hyderabad.city'),
      address: t('faq.ombudsman.hyderabad.address'),
      jurisdiction: t('faq.ombudsman.hyderabad.jurisdiction')
    },
    {
      city: t('faq.ombudsman.kochi.city'),
      address: t('faq.ombudsman.kochi.address'),
      jurisdiction: t('faq.ombudsman.kochi.jurisdiction')
    },
    {
      city: t('faq.ombudsman.kolkata.city'),
      address: t('faq.ombudsman.kolkata.address'),
      jurisdiction: t('faq.ombudsman.kolkata.jurisdiction')
    },
    {
      city: t('faq.ombudsman.lucknow.city'),
      address: t('faq.ombudsman.lucknow.address'),
      jurisdiction: t('faq.ombudsman.lucknow.jurisdiction')
    }
  ];

  const realEstateFAQs = [
    { q: t('faq.realestate.q1'), a: t('faq.realestate.a1') },
    { q: t('faq.realestate.q2'), a: t('faq.realestate.a2') },
    { q: t('faq.realestate.q3'), a: t('faq.realestate.a3') },
    { q: t('faq.realestate.q4'), a: t('faq.realestate.a4') },
    { q: t('faq.realestate.q5'), a: t('faq.realestate.a5') },
    { q: t('faq.realestate.q6'), a: t('faq.realestate.a6') },
    { q: t('faq.realestate.q7'), a: t('faq.realestate.a7') },
    { q: t('faq.realestate.q8'), a: t('faq.realestate.a8') },
    { q: t('faq.realestate.q9'), a: t('faq.realestate.a9') },
    { q: t('faq.realestate.q10'), a: t('faq.realestate.a10') },
    { q: t('faq.realestate.q11'), a: t('faq.realestate.a11') },
    { q: t('faq.realestate.q12'), a: t('faq.realestate.a12') },
    { q: t('faq.realestate.q13'), a: t('faq.realestate.a13') },
    { q: t('faq.realestate.q14'), a: t('faq.realestate.a14') },
    { q: t('faq.realestate.q15'), a: t('faq.realestate.a15') },
    { q: t('faq.realestate.q16'), a: t('faq.realestate.a16') },
    { q: t('faq.realestate.q17'), a: t('faq.realestate.a17') },
    { q: t('faq.realestate.q18'), a: t('faq.realestate.a18') },
    { q: t('faq.realestate.q19'), a: t('faq.realestate.a19') },
    { q: t('faq.realestate.q20'), a: t('faq.realestate.a20') },
    { q: t('faq.realestate.q21'), a: t('faq.realestate.a21') },
    { q: t('faq.realestate.q22'), a: t('faq.realestate.a22') },
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.faq')}</Typography>
        </Breadcrumbs>

        <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom sx={{ mb: 6 }}>
          {t('faq.title')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* BANKING */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>{t('faq.banking')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>{t('faq.banking.item1')}</li>
                <li>{t('faq.banking.item2')}</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* EDUCATION */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>{t('faq.education')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>{t('faq.education.item1')}</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* ELECTRICITY */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>{t('faq.electricity')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>{t('faq.electricity.item1')}</li>
                <li>{t('faq.electricity.item2')}</li>
                <li>{t('faq.electricity.item3')}</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* INSURANCE */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>{t('faq.insurance')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('faq.insurance.general')}</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                <li>{t('faq.insurance.item1')}</li>
                <li>{t('faq.insurance.item2')}</li>
                <li>{t('faq.insurance.item3')}</li>
                <li>{t('faq.insurance.item4')}</li>
                <li>{t('faq.insurance.item5')}</li>
              </Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('faq.insurance.specific')}</Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>{t('faq.insurance.s1')}</li>
                <li>{t('faq.insurance.s2')}</li>
                <li>{t('faq.insurance.s3')}</li>
                <li>{t('faq.insurance.s4')}</li>
                <li>{t('faq.insurance.s5')}</li>
                <li>{t('faq.insurance.s6')}</li>
                <li>{t('faq.insurance.s7')}</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* MEDICLAIM */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>{t('faq.mediclaim')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" gutterBottom color="primary">{t('faq.mediclaim.guidelines')}</Typography>
              <Typography variant="body1" paragraph>
                {t('faq.mediclaim.irda')}
              </Typography>
              
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('faq.mediclaim.features')}</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                <li>{t('faq.mediclaim.f1')}</li>
                <li>{t('faq.mediclaim.f2')}</li>
                <li>{t('faq.mediclaim.f3')}</li>
                <li>{t('faq.mediclaim.f4')}</li>
                <li>{t('faq.mediclaim.f5')}</li>
                <li>{t('faq.mediclaim.f6')}</li>
              </Box>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('faq.mediclaim.docs')}</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                <li>{t('faq.mediclaim.d1')}</li>
                <li>{t('faq.mediclaim.d2')}</li>
                <li>{t('faq.mediclaim.d3')}</li>
                <li>{t('faq.mediclaim.d4')}</li>
                <li>{t('faq.mediclaim.d5')}</li>
              </Box>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('faq.mediclaim.dispute')}</Typography>
              <Typography variant="body2" paragraph>
                {t('faq.mediclaim.irdaContact')}
              </Typography>

              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('faq.table.office')}</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('faq.table.contact')}</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>{t('faq.table.jurisdiction')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ombudsmanContacts.map((contact, index) => (
                              <TableRow key={index}>
                                <TableCell sx={{ fontWeight: 700 }}>{contact.city}</TableCell>
                                <TableCell>{contact.address}</TableCell>
                                <TableCell>{contact.jurisdiction}</TableCell>
                              </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* REAL ESTATE */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>{t('faq.realestate')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {realEstateFAQs.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="primary">Q: {item.q}</Typography>
                  <Typography variant="body1">A: {item.a}</Typography>
                </Box>
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                {t('faq.realestate.source')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* OTHERS */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>{t('faq.others')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>{t('faq.others.item1')}</li>
                <li>{t('faq.others.item2')}</li>
                <li>{t('faq.others.item3')}</li>
                <li>{t('faq.others.item4')}</li>
                <li>{t('faq.others.item5')}</li>
              </Box>
            </AccordionDetails>
          </Accordion>

        </Box>
      </Container>
    </Box>
  );
};


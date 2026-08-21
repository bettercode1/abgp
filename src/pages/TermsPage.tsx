import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="primary">
        {t('footer.terms')}
      </Typography>
      
      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
        {t('constitution.fullName')}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('constitution.registration')}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* MEMORANDUM OF ASSOCIATION */}
      <Typography variant="h4" gutterBottom fontWeight={600} color="primary" sx={{ mt: 4 }}>
        {t('constitution.memorandumTitle')}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {t('constitution.nameTitle')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('constitution.nameContent')}
        </Typography>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          {t('constitution.addressTitle')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('constitution.addressContent')}
        </Typography>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          {t('constitution.areaTitle')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('constitution.areaContent')}
        </Typography>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          {t('constitution.objectsTitle')}
        </Typography>
        <Typography variant="body1" paragraph>
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

        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
          {t('constitution.financialTitle')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('constitution.financialContent')}
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* RULES & REGULATIONS */}
      <Typography variant="h4" gutterBottom fontWeight={600} color="primary">
        {t('constitution.rulesTitle')}
      </Typography>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
        {t('constitution.part1Title')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t('constitution.part1NameTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part1NameContent')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t('constitution.part1OfficeTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part1OfficeContent')}
      </Typography>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
        {t('constitution.part2Title')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part2Content')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
        {t('constitution.part2FunctionsTitle')}
      </Typography>
      <Box component="ol" sx={{ pl: 2, '& li': { mb: 1.5 } }}>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList1')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList2')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList3')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList4')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList5')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList6')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList7')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.part2FunctionsList8')}</Typography></li>
      </Box>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
        {t('constitution.part3Title')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
        {t('constitution.part3OrdinaryTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part3OrdinaryContent')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t('constitution.part3FounderTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part3FounderContent')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t('constitution.part3ActiveTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part3ActiveContent')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t('constitution.part3LifeTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part3LifeContent')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t('constitution.part3InviteeTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.part3InviteeContent')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
        {t('constitution.votingPowersTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.votingPowersContent')}
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        {t('constitution.cessationTitle')}
      </Typography>
      <Typography variant="body1" paragraph>
        {t('constitution.cessationContent')}
      </Typography>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
        {t('constitution.feesStructureTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('constitution.feesStructureNote')}
      </Typography>
      <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
        <li><Typography variant="body1">{t('constitution.feesOrdinary')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.feesLife')}</Typography></li>
        <li><Typography variant="body1">{t('constitution.feesAffiliation')}</Typography></li>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, mb: 2 }}>
        {t('constitution.contactOfficeNote')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" fontWeight={600}>
        {t('constitution.fullName')}<br />
        {t('constitution.addressContent')}
      </Typography>
    </Container>
  );
};

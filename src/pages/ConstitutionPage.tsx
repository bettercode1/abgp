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
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
          <Typography color="text.primary">Constitution</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom>
              ABGP Constitution
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Amended - 21st Sept. 2014
            </Typography>
            <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
              AKHIL BHARATIYA GRAHAK PANCHAYAT
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              [Registered under Societies Registration Act, 1860] (Regn. No. S/9194)
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 4, textTransform: 'uppercase' }}>
              Memorandum of Association
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              1. NAME :
            </Typography>
            <Typography variant="body1" paragraph>
              The name of the association is ‘Akhil Bhartiya Grahak Panchayat’ and will be hereinafter referred to as ‘Panchayat’ in the Memorandum of Association and Rules Regulations made there under.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              2. ADDRESS :
            </Typography>
            <Typography variant="body1" paragraph>
              The registered address of the Panchayat, is C-4 /156, Keshav puram, Delhi. -110035. or such other place [s] as the Executive committee will decide from time to time. The registered office of the Panchayat shall situate in Union Territory of Delhi.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              3. AREA OF OPERATION :
            </Typography>
            <Typography variant="body1" paragraph>
              Whole of India will remain the jurisdiction of the Panchayat.
            </Typography>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              4. OBJECTS :
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              The aims and objects for which the Panchayat is established are;
            </Typography>

            <Box sx={{ pl: { xs: 0, md: 4 } }}>
              <Typography variant="body1" paragraph>
                <strong>A.</strong> To unite consumers into a closely knit, disciplined cadre organization and to develop organized strong independent consumer movement and to inculcate in them the sense of trusteeship, service and patriotism.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>B.</strong> To educate the consumer at large and the members in particular through various means such as books, periodicals, leaflets, video cassettes and other mass media and to make them conscious of their rights & responsibilities and to strengthen the consumer Resistance Movement.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>C.</strong> To assist the consumers to protect their interests against any of the unhealthy practices in the market and to do all within its means to establish their rights.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>D.</strong> To disseminate information to the members in particular and the consumer at large in general by arranging lectures, meetings, seminars, exhibitions, documentaries and all possible mass media.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>E.</strong> To establish research centers and to conduct higher education centers for activating ‘Bhartiya Grahak Neeti’ of the consumer movement, to start such centers in schools, colleges and universities and to encourage and assist them.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>F.</strong> To solve consumers grievances by legal remedies such as filling of suits and proceedings in the courts of Law in the name of ‘Panchayat’ where ever necessary.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>G.</strong> To help the nation by making efforts to correct the price structure, distribution and marketing conditions through various consumer activities.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>H.</strong> To take all other steps to achieve the goal of socio-economic welfare of the consumers in general, and it’s members in particular.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>I.</strong> To strive mainly for safeguarding the rights of the consumers throughout the country. To organize the consumers to fight for their rights. In establishing the rights of the consumers, the ‘Panchayat,’ will not work for profit motive and it will only help to safeguard their interest.
              </Typography>
              <Typography variant="body1" paragraph>
                The Panchayat will also help all organizations with similar objects. The benefits of the Panchayat will not be denied on account of caste, creed, sex, religion and gender.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>J.</strong> To do all other acts helping the above referred charitable and social purposes.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>K.</strong> The office Bearers of the Panchayat shall not contest any political elections.
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              5. FINANCIAL UTILIZATION :
            </Typography>
            <Typography variant="body1" paragraph>
              All the incomes, earnings, moveable or immovable properties of the society shall be solely utilized and applied towards the promotion of its aims and object only as set forth in the Memorandum of Association and no profit thereon shall be paid or transferred directly or indirectly by way of dividends, bonus profits or in any manner whatsoever to the present or past members of the society or to any person claiming through anyone or more of the present or the past members. No member of the society shall have any personal claim on any movables or immovable properties of the Society or make any profits, Whatsoever by virtue of this membership.
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
              RULES & REGULATIONS
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              [Registered under Societies Registration Act, 1860] [Regd. No : S/9194 Delhi]
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              PART-I
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>1. Name of the Society :-</strong> The name of the society is AKHIL Bhartiya Grahak Panchayat and will be hereinafter referred to as ‘Panchayat’ in the Memorandum of Association and Rules & Regulations made hereunder.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>2. Registered office of the Panchayat :-</strong> The registered office of the Panchayat will be in the National Capital Territory of Delhi and is presently located at C-4 / 156, Keshav Puram, Delhi -35. The office of the Panchayat may be shifted to some other place(s) as may be decided by National Executive committee from time to time.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              PART-II: GENERAL BODY OF THE PANCHAYAT
            </Typography>
            <Typography variant="body1" paragraph>
              The General Body of the Panchayat shall consist of all the categories of members of the Panchayat as mentioned in part-III hereinafter.
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              FUNCTIONS OF THE GENERAL BODY (SADHARAN SABHA)
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ul" sx={{ pl: 3 }}>
                <li>To hold at least one Annual General Body Meeting.</li>
                <li>To elect five Active members of the panchayat to be included in the National executive Council after every three years.</li>
                <li>To review and take note of the work done by National Executive Committee in the preceding year.</li>
                <li>To discuss the accounts, Income & Expenditure, vis-a-vis, activities carried out by the Panchayat in the preceding financial year and to give suggestions to the National Executive committee in that behalf.</li>
                <li>To impart guidelines to the National Executive committee preparing the budget for the next financial year.</li>
                <li>To approve and give its consent about the various activities carried out by the National Executive Committee in the preceding year and to give suggestions for the forth coming financial year.</li>
                <li>To amend the rules and regulations of the Panchayat by not less than 2/3rd majority of the members of the General Body as and when the amendment is deemed necessary by the Panchayat.</li>
                <li>The General Body of the Panchayat shall follow the procedure, laid down in section 12 of the Societies Registration Act, 1860 to make any change in its name or to alter, abridge or amend its objects and / or rules and regulations.</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              PART-III: CLASSIFICATION OF MEMBERS
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>(A) ORDINARY MEMBERS:</strong> A citizen of India who agrees with the aims and objects of the Panchayat and is ready to abide by its rules and regulations and has attained the age of majority shall be eligible to become a member of the Panchayat. This membership is without voting right.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>(B) FOUNDER MEMBERS:</strong> The persons, by virtue of being initial signatory to the Memorandum of Association and Rules and Regulations of the Panchayat, shall be Founder Members of the Panchayat. They have voting rights.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>(C) ACTIVE MEMBERS:</strong> Those who devote themselves to the activities of the panchayat by voluntarily participating in the activities of the panchayat for a considerable period of at least two years, shall be considered as an Active Member.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>(D) LIFE MEMBERS:</strong> Those who pay one time life subscription of Rs.5000/= shall be treated as life members, on recommendation of the Natl. Ex. Commiittee.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>(E) INVITEE MEMBERS:</strong> Experts, scholars, economists, consumer activists or specialists in different disciplines or persons of distinguished status in the country shall be nominated as ‘Invitee Members’ by the National Executive committee.
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              PART-IV: NATIONAL EXECUTIVE COUNCIL [RASHTRIYA KARYAKARI PARISHAD]
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ol" sx={{ pl: 3 }}>
                <li>All the founder members of the Panchayat.</li>
                <li>The Sanghtak of each affiliated prant Grahak Panchayat.</li>
                <li>Adhyaksha, Upadhyaksha, Sachiv and Koshadhyaksha of each Prant and one lady representative from the prant.</li>
                <li>In addition to above, 5 active members from each affiliated organization shall be the members of NEC.</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              PART-V: FUNCTIONS OF NATIONAL EXECUTIVE COUNCIL
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ol" sx={{ pl: 3 }}>
                <li>To hold at least one Annual Meeting of the parishad to review overall working and to frame policies.</li>
                <li>To elect the National Executive Committee of the Panchayat after every 3 years.</li>
                <li>To elect Rashtriya Adhyaksha, Upadhyaksha, Rashtriya sachiv, Rashtriya Koshadhyaksha after every three years.</li>
                <li>To review issues related to consumers and suggest improvements.</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
              PART-VI: NATIONAL EXECUTIVE COMMITTEE [RASHTRIYA KARYAKARINI]
            </Typography>
            <Typography variant="body1" paragraph>
              The National President, vice presidents, secretary and treasurer may nominate rashtriya sanghatak at National level and prant sanghatak at prant level.
            </Typography>
            <Typography variant="body1" component="div">
              <Box component="ul" sx={{ listStyle: 'none', pl: 0 }}>
                <li>1. National Vice President – Two</li>
                <li>2. Rashtriya Sanghtan Mantri – One</li>
                <li>3. National secretaries – One</li>
                <li>4. National Joint Secretaries – Two</li>
                <li>5. National Treasurer – One</li>
                <li>6. Members of Executive Committee – Max. 6</li>
              </Box>
            </Typography>
          </Box>

          <Box sx={{ mt: 6, p: 3, backgroundColor: theme.palette.primary.main, color: 'white', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Note on Winding Up
            </Typography>
            <Typography variant="body2">
              The Panchayat shall not be dissolved unless two third of the members shall have expressed a wish for such dissolution. Upon dissolution, any remaining property shall be given to some other society with similar objects as determined by the members.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};


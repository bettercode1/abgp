import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';

export const TermsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom fontWeight={700} color="primary">
        Terms & Conditions
      </Typography>
      
      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
        AKHIL BHARATIYA GRAHAK PANCHAYAT CONSTITUTION
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        [Registered under Societies Registration Act, 1860] (Regn. No. S/9194)
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* MEMORANDUM OF ASSOCIATION */}
      <Typography variant="h4" gutterBottom fontWeight={600} color="primary" sx={{ mt: 4 }}>
        MEMORANDUM OF ASSOCIATION
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          1. NAME
        </Typography>
        <Typography variant="body1" paragraph>
          The name of the association is 'Akhil Bhartiya Grahak Panchayat' and will be hereinafter referred to as 'Panchayat' in the Memorandum of Association and Rules Regulations made there under.
        </Typography>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          2. ADDRESS
        </Typography>
        <Typography variant="body1" paragraph>
          The registered address of the Panchayat, is C-4/156, Keshav Puram, Delhi - 110035, or such other place(s) as the Executive committee will decide from time to time. The registered office of the Panchayat shall situate in Union Territory of Delhi.
        </Typography>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          3. AREA OF OPERATION
        </Typography>
        <Typography variant="body1" paragraph>
          Whole of India will remain the jurisdiction of the Panchayat.
        </Typography>

        <Typography variant="h6" gutterBottom fontWeight={600}>
          4. OBJECTS
        </Typography>
        <Typography variant="body1" paragraph>
          The aims and objects for which the Panchayat is established are:
        </Typography>

        <Box component="ol" sx={{ pl: 2, '& li': { mb: 2 } }}>
          <li>
            <Typography variant="body1">
              <strong>A.</strong> To unite consumers into a closely knit, disciplined cadre organization and to develop organized strong independent consumer movement and to inculcate in them the sense of trusteeship, service and patriotism.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>B.</strong> To educate the consumer at large and the members in particular through various means such as books, periodicals, leaflets, video cassettes and other mass media and to make them conscious of their rights & responsibilities and to strengthen the consumer Resistance Movement.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>C.</strong> To assist the consumers to protect their interests against any of the unhealthy practices in the market and to do all within its means to establish their rights.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>D.</strong> To disseminate information to the members in particular and the consumer at large in general by arranging lectures, meetings, seminars, exhibitions, documentaries and all possible mass media.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>E.</strong> To establish research centers and to conduct higher education centers for activating 'Bhartiya Grahak Neeti' of the consumer movement, to start such centers in schools, colleges and universities and to encourage and assist them.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>F.</strong> To solve consumers grievances by legal remedies such as filling of suits and proceedings in the courts of Law in the name of 'Panchayat' where ever necessary.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>G.</strong> To help the nation by making efforts to correct the price structure, distribution and marketing conditions through various consumer activities.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>H.</strong> To take all other steps to achieve the goal of socio-economic welfare of the consumers in general, and its members in particular.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>I.</strong> To strive mainly for safeguarding the rights of the consumers throughout the country. To organize the consumers to fight for their rights. In establishing the rights of the consumers, the 'Panchayat,' will not work for profit motive and it will only help to safeguard their interest. The Panchayat will also help all organizations with similar objects. The benefits of the Panchayat will not be denied on account of caste, creed, sex, religion and gender.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>J.</strong> To do all other acts helping the above referred charitable and social purposes.
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>K.</strong> The office Bearers of the Panchayat shall not contest any political elections.
            </Typography>
          </li>
        </Box>

        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
          5. PROPERTY AND INCOME
        </Typography>
        <Typography variant="body1" paragraph>
          All the incomes, earnings, moveable or immovable properties of the society shall be solely utilized and applied towards the promotion of its aims and object only as set forth in the Memorandum of Association and no profit thereon shall be paid or transferred directly or indirectly by way of dividends, bonus profits or in any manner whatsoever to the present or past members of the society or to any person claiming through anyone or more of the present or the past members. No member of the society shall have any personal claim on any movables or immovable properties of the Society or make any profits, whatsoever by virtue of this membership.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* RULES & REGULATIONS */}
      <Typography variant="h4" gutterBottom fontWeight={600} color="primary">
        RULES & REGULATIONS
      </Typography>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
        PART-I
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        1. Name of the Society
      </Typography>
      <Typography variant="body1" paragraph>
        The name of the society is AKHIL Bhartiya Grahak Panchayat and will be hereinafter referred to as 'Panchayat' in the Memorandum of Association and Rules & Regulations made hereunder.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        2. Registered Office of the Panchayat
      </Typography>
      <Typography variant="body1" paragraph>
        The registered office of the Panchayat will be in the National Capital Territory of Delhi and is presently located at C-4/156, Keshav Puram, Delhi -35. The office of the Panchayat may be shifted to some other place(s) as may be decided by National Executive committee from time to time.
      </Typography>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
        PART-II: GENERAL BODY OF THE PANCHAYAT
      </Typography>
      <Typography variant="body1" paragraph>
        The General Body of the Panchayat shall consist of all the categories of members of the Panchayat as mentioned in part-III hereinafter.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
        FUNCTIONS OF THE GENERAL BODY [SADHARAN SABHA]
      </Typography>
      <Box component="ol" sx={{ pl: 2, '& li': { mb: 1.5 } }}>
        <li><Typography variant="body1">To hold at least one Annual General Body Meeting.</Typography></li>
        <li><Typography variant="body1">To elect five Active members of the panchayat to be included in the National executive Council after every three years.</Typography></li>
        <li><Typography variant="body1">To review and take note of the work done by National Executive Committee in the preceding year.</Typography></li>
        <li><Typography variant="body1">To discuss the accounts, Income & Expenditure, vis-a-vis, activities carried out by the Panchayat in the preceding financial year and to give suggestions to the National Executive committee in that behalf.</Typography></li>
        <li><Typography variant="body1">To impart guidelines to the National Executive committee preparing the budget for the next financial year.</Typography></li>
        <li><Typography variant="body1">To approve and give its consent about the various activities carried out by the National Executive Committee in the preceding year and to give suggestions for the forth coming financial year.</Typography></li>
        <li><Typography variant="body1">To amend the rules and regulations of the Panchayat by not less than 2/3rd majority of the members of the General Body as and when the amendment is deemed necessary by the Panchayat.</Typography></li>
        <li><Typography variant="body1">The General Body of the Panchayat shall follow the procedure, laid down in section 12 of the Societies Registration Act, 1860 to make any change in its name or to alter, abridge or amend its objects and/or rules and regulations.</Typography></li>
      </Box>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
        PART-III: CLASSIFICATION OF MEMBERS
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
        (A) ORDINARY MEMBERS
      </Typography>
      <Typography variant="body1" paragraph>
        A citizen of India who agrees with the aims and objects of the Panchayat and is ready to abide by its rules and regulations and has attained the age of majority shall be eligible to become a member of the Panchayat. This membership is without voting right.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        (B) FOUNDER MEMBERS
      </Typography>
      <Typography variant="body1" paragraph>
        The persons, by virtue of being initial signatory to the Memorandum of Association and Rules and Regulations of the Panchayat, shall be Founder Members of the Panchayat. They have voting rights.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        (C) ACTIVE MEMBERS
      </Typography>
      <Typography variant="body1" paragraph>
        Those who devote themselves to the activities of the panchayat by voluntarily participating in the activities of the panchayat for a considerable period of at least two years, shall be considered as an Active Member. The Prant Executive Committee of the Panchayat will decide about Active Membership of the person after receiving the recommendation of at least two members of the Prant Executive Committee of the panchayat.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        (D) LIFE MEMBERS
      </Typography>
      <Typography variant="body1" paragraph>
        Those who pay one time life subscription of Rs. 5000/= shall be treated as life members, on recommendation of the National Executive Committee.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        (E) INVITEE MEMBERS
      </Typography>
      <Typography variant="body1" paragraph>
        Experts, scholars, economists, consumer activists or specialists in different disciplines or persons of distinguished status in the country shall be nominated as 'Invitee Members' by the National Executive committee. Such members shall not be required to pay any subscription or membership fee and also shall not have a right to vote.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mt: 3 }}>
        VOTING POWERS OF THE MEMBERS
      </Typography>
      <Typography variant="body1" paragraph>
        All the members except Invitee Members who are enrolled in the register of members at the beginning of the year or up to a particular date in a year as decided by the National Executive committee from time to time, are entitled to vote.
      </Typography>

      <Typography variant="h6" gutterBottom fontWeight={600}>
        CESSATION OF MEMBERSHIP
      </Typography>
      <Typography variant="body1" paragraph>
        A member, who indulges in any activity against the aims and objects and/or carries on the activities in competition with the functions of the panchayat or in any way damages its goodwill shall be liable to be terminated as a member of General Body. The decision in this regard shall be taken after providing an opportunity to the member concerned for offering his explanation to the National Executive Committee and the decision taken by it in this regard shall be final and absolutely binding upon such member.
      </Typography>

      <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mt: 4 }}>
        MEMBERSHIP FEES STRUCTURE
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        (As decided in the general body meeting held on 21st Sept, 2014 at Bhubaneshwar. Subject to review and change from time to time.)
      </Typography>
      <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
        <li><Typography variant="body1">Fees for ordinary members/Active members: <strong>Rs. 100/- per year</strong></Typography></li>
        <li><Typography variant="body1">Fees for life members: <strong>Rs. 5000/-, one time</strong></Typography></li>
        <li><Typography variant="body1">Affiliation fees for organizations: <strong>Rs. 5000/- per year or 20% of the membership fees collected in the affiliated organization whichever is higher</strong></Typography></li>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, mb: 2 }}>
        For complete details of all parts and sections, please contact the registered office.
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" fontWeight={600}>
        Akhil Bhartiya Grahak Panchayat<br />
        C-4/156, Keshav Puram, Delhi - 110035
      </Typography>
    </Container>
  );
};

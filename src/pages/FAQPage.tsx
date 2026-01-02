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
      city: 'MUMBAI',
      address: 'Office of the Insurance Ombudsman, 3rd Floor, Jeevan Seva Annexe, S. V. Road, Santacruz (W), Mumbai – 400 054. Tel.:- 022-26106928/360/889 Fax:- 022-26106052 Email:- ombudsmanmumbai@gmail.com or ombudsman@vsnl.net',
      jurisdiction: 'States of Maharashtra and Goa.'
    },
    {
      city: 'AHMEDABAD',
      address: 'Office of the Insurance Ombudsman, 2nd floor, Ambica House, Near C.U. Shah College, 5, Navyug Colony, Ashram Road, Ahmedabad – 380 014 Tel.:- 079-27546150/139 Fax:- 079-27546142 Email:- insombahd@rediffmail.com',
      jurisdiction: 'State of Gujarat and Union Territories of Dadra & Nagar Haveli and Daman and Diu.'
    },
    {
      city: 'BHOPAL',
      address: 'Office of the Insurance Ombudsman, Janak Vihar Complex, 2nd Floor, 6, Malviya Nagar, Opp.Airtel, Bhopal – 462 011. Tel.:- 0755-2769200/201/202 Fax:- 0755-2769203 Email:- bimalokpalbhopal@airtelbroadband.in',
      jurisdiction: 'States of Madhya Pradesh and Chattisgarh.'
    },
    {
      city: 'BHUBANESHWAR',
      address: 'Office of the Insurance Ombudsman, 62, Forest park, Bhubneshwar – 751 009. Tel.:- 0674-2535220/3798/1607 Fax:- 0674-2531607 Email:- ioobbsr@dataone.in',
      jurisdiction: 'State of Orissa.'
    },
    {
      city: 'CHANDIGARH',
      address: 'Office of the Insurance Ombudsman, S.C.O. No. 101, 102 & 103, 2nd Floor, Batra Building, Sector 17 – D, Chandigarh – 160 017. Tel.:- 0172-2706196/5861/6468 Fax:- 0172-2708274 Email:- ombchd@yahoo.co.in',
      jurisdiction: 'States of Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir and Union territory of Chandigarh.'
    },
    {
      city: 'CHENNAI',
      address: 'Office of the Insurance Ombudsman, Fatima Akhtar Court, 4th Floor, 453 (old 312), Anna Salai, Teynampet, CHENNAI – 600 018. Tel.:- 044-24333678/664/668 Fax:- 044-24333664 Email:- insombud@md4.vsnl.net.in',
      jurisdiction: 'State of Tamil Nadu and Union Territories – Pondicherry Town and Karaikal (which are part of Union Territory of Pondicherry).'
    },
    {
      city: 'DELHI',
      address: 'Office of the Insurance Ombudsman, 2/2 A, Universal Insurance Building, Asaf Ali Road, New Delhi – 110 002. Tel.:- 011-23239611/7539/7532 Fax:- 011-23230858 Email:- iobdelraj@rediffmail.com',
      jurisdiction: 'States of Delhi and Rajasthan.'
    },
    {
      city: 'GUWAHATI',
      address: 'Office of the Insurance Ombudsman, ‘Jeevan Nivesh’, 5th Floor, Nr. Panbazar over bridge, S.S. Road, Guwahati – 781001(ASSAM). Tel.:- 0361- 2132204/2131307/2132205 Fax:- 0361-2732937 Email:- ombudsmanghy@rediffmail.com',
      jurisdiction: 'States of Assam, Meghalaya, Manipur, Mizoram, Arunachal Pradesh, Nagaland and Tripura.'
    },
    {
      city: 'HYDERABAD',
      address: 'Office of the Insurance Ombudsman, 6-2-46, 1st floor, “Moin Court” Lane Opp. Saleem Function Palace, A. C. Guards, Lakdi-Ka-Pool, Hyderabad – 500 004. Tel.:- 040-23325325/23312122 Fax:- 040-23376599 Email:- insombudhyd@gmail.com',
      jurisdiction: 'States of Andhra Pradesh, Karnataka and Union Territory of Yanam – a part of the Union Territory of Pondicherry.'
    },
    {
      city: 'KOCHI',
      address: 'Office of the Insurance Ombudsman, 2nd Floor, CC 27 / 2603, Pulinat Bldg., Opp. Cochin Shipyard, M. G. Road, Ernakulam – 682 015. Tel.:- 0484-2358734/759/9338 Fax:- 0484-2359336 Email:- iokochi@asianetindia.com',
      jurisdiction: 'State of Kerala and Union Territory of (a) Lakshadweep (b) Mahe-a part of Union Territory of Pondicherry.'
    },
    {
      city: 'KOLKATA',
      address: 'Office of the Insurance Ombudsman, North British Bldg., 3rd Floor, 29, N. S. Road, Kolkata – 700 001. Tel.:- 033-22134869/67/66 Fax:- 033-22134868 Email:- iombkol@vsnl.net',
      jurisdiction: 'States of West Bengal, Bihar, Sikkim, Jharkhand and Union Territories of Andaman and Nicobar Islands.'
    },
    {
      city: 'LUCKNOW',
      address: 'Office of the Insurance Ombudsman, 6th Floor, Jeevan Bhawan, Phase-II, Nawal Kishore Road, Hazratganj, Lucknow-226 001. Tel.:- 0522-2201188/31330/1 Fax:- 0522-2231310. Email:- ioblko@sancharnet.in',
      jurisdiction: 'States of Uttar Pradesh and Uttaranchal.'
    }
  ];

  const realEstateFAQs = [
    { q: 'Is completion certificate and occupancy certificate to be made available to allottees?', a: 'Yes, when promoter obtains the completion certificate and occupancy certificate then the same will be made available to allottees individually or to Association of Allottees.' },
    { q: 'Is right related to insurance will be transferred to Association of Allottees?', a: 'Promoter shall be liable to pay premium and charges in respect of the insurance and such will be transferred for the benefit of the allottees or Association of Allottees.' },
    { q: 'To whom all the necessary document and plans, after handing of physical possession shall be transferred?', a: 'All the documents and plans after handing of physical possession shall be transferred to Association of Allottees.' },
    { q: 'What if the project is developed on leasehold land?', a: 'Promoter after payment of all dues and charges will make available lease certificate to Association of Allottees.' },
    { q: 'If registration of the project is revoked then what is the right of Association of Allottees?', a: 'In case registration is revoked then Association of Allottees shall have the first right for refusal for carrying out of the remaining development works.' },
    { q: 'What information is to be given to the allottees?', a: 'He will be entitled to obtain information related to sanctioned plans, layout plans and other details of the project.' },
    { q: 'If promoter breaches terms of agreement for sale then what will be the remedies available?', a: '(i) If Allottee wants to withdraw from the project then he will be entitled for refund along with the interest and compensation. (ii) If Allottee does not wish to withdraw then he shall be paid interest for every delayed month.' },
    { q: 'If allottees makes advance or deposit on the basis of false incorrect statement contained in any notice, advertisement or prospectus then what will be the remedies available?', a: 'Allottees can withdraw from the project and will be entitled for refund along with the interest and compensation. Also if such person is not Allottee but affected investor then also he can claim relief.' },
    { q: 'In case of defective title what are the rights of allottees?', a: 'Allottees will be entitled for compensation for any loss caused to him due to defective title of the land, and there is no time limit for claiming of such compensation.' },
    { q: 'What are the provisions for execution of Agreement to Sale?', a: 'Only up to 10% of the cost of the apartment, plot or building can be accepted by the promoter before executing the agreement for sale. After that no promoter can accept any money from allottees without Agreement to Sale being registered.' },
    { q: 'Where can allottees file their complaints and demand for remedy?', a: 'Aggrieved person may file complaint with Adjudicating Authority for interest and compensation under section 12, 14, 18 and 19.' },
    { q: 'What is the time limit for execution of conveyance deed?', a: 'In the absence of any local law, conveyance deed in favour of the Allottee shall be carried out by the promoter within three months from the date of issue of occupancy certificate.' },
    { q: 'What is the time limit to take physical possession by allottees?', a: 'Allottees shall take physical possession of apartment, plot, or building within period of two months from occupancy certificate issued by authority.' },
    { q: 'What steps needed in case of additions and alterations in layout plan?', a: 'Prior written consent of 2/3rd of allottees is required in case there is major addition and alteration in the layout plan, sanctioned plan and specifications of the buildings or the common areas within the project.' },
    { q: 'What are the rights of allottees for transfer of assignment of project to third party?', a: 'Transfer of project to third party cannot take place without prior written consent from two-third allottees and along with prior written permission of authority.' },
    { q: 'What is the period for which the promoter is liable for any structural defects etc. in the project / apartment?', a: 'The promoter shall be liable for 5 years from the date of handing over of possession to the Allottee towards structural defect or any other defect as specified therein. The defect should be rectified within 30 days.' },
    { q: 'In case Allottee fails to pay timely payment?', a: 'Allottees shall be liable to pay interest for a delayed period, at such rate as may be prescribed (rate of interest shall be equal for payment and refund).' },
    { q: 'Is Allottee responsible to participate in formation of Association of Allottees?', a: 'Every Allottee shall participate in formation of Association of Allottees.' },
    { q: 'Is Allottee responsible to participate in registration of conveyance deed?', a: 'Every Allottee shall participate towards registration of conveyance deed of apartment, plot, or building.' },
    { q: 'Is Allottee responsible to take possession within two months of issue of occupancy certificate?', a: 'Every Allottee shall take physical possession of apartment, plot or building within two months of issue of occupancy certificate.' },
    { q: 'If allottees do not comply with the order of authority?', a: 'Allottees shall be liable for penalty for the period of such default which may extend up to 5% of the plot, apartment or building cost.' },
    { q: 'If allottees do not comply with the order of tribunal?', a: 'Allottees shall be punishable with imprisonment for a tenure which may extend up to 1 year or fine for every day during which such default continues, which may extend up to 10% of the plot, apartment or building cost.' },
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
          Frequently Asked Questions (FAQs)
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* BANKING */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>BANKING</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>Banking Ombudsman Scheme</li>
                <li>RBI’s Guidelines on Consumer Education And Protection.</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* EDUCATION */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>EDUCATION</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>Government’s Education Policy 2020</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* ELECTRICITY */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>ELECTRICITY</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>Maharashtra State Electricity Distribution.</li>
                <li>Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company.</li>
                <li>Uttar pradesh Power corporation Ltd FAQ.</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* INSURANCE */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>INSURANCE</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>General Ombudsman Info:</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                <li>Insurance Ombudsman</li>
                <li>Insurance Ombudsman, Rules – 2017.</li>
                <li>Addresses of Ombudsman.</li>
                <li>Awards of Ombudsman.</li>
                <li>FAQs on Ombudsman Rules.</li>
              </Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Specific Insurance FAQs:</Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>Health Insurance FAQ</li>
                <li>Conventional Life Insurance FAQ</li>
                <li>Motor Insurance FAQ</li>
                <li>Property Insurance FAQ</li>
                <li>General Questions FAQ</li>
                <li>Travel Insurance FAQ</li>
                <li>Unit Linked Insurance Policies FAQ</li>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* MEDICLAIM */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>MEDICLAIM / HEALTH INSURANCE</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" gutterBottom color="primary">New guidelines of Health Insurance claims (HIR 2016)</Typography>
              <Typography variant="body1" paragraph>
                IRDA came out with Health Insurance Regulations, 2016 for the entire medical insurance (mediclaim) industry.
              </Typography>
              
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Main features of HIR 2016 (Claims):</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                <li>TPA is not permitted to settle/ reject/ repudiate claims (Sec 33(c))</li>
                <li>Denial letters must mention specific grounds (Sec 33(d)(iv))</li>
                <li>2% interest above bank rates for delays over 30 days (Sec 28(iv))</li>
                <li>Payments made directly from Insurer bank account, not TPA (Sec 32)</li>
                <li>AYUSH treatments may be covered (Sec 18)</li>
                <li>Discounts from hospitals must be passed to policyholders (Sec 20(9))</li>
              </Box>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Policy Document Regulations:</Typography>
              <Box component="ul" sx={{ pl: 3, mb: 3 }}>
                <li>No arbitrary premium increase at renewals (Sec 25(i))</li>
                <li>No change in premiums for 3 years after initial offering (Sec 10(c))</li>
                <li>Policies are ordinarily renewable (Sec 13)</li>
                <li>Free-look period of 15 days (Sec 14)</li>
                <li>Policy portability allowed 45 days prior to maturity</li>
              </Box>

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>Dispute Resolution:</Typography>
              <Typography variant="body2" paragraph>
                Grievances must be acknowledged in 3 working days and resolved in 15 working days. 
                IRDA Call Centre: <strong>155255</strong> (Toll-free).
                Email: <strong>complaints@irda.gov.in</strong>
              </Typography>

              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Office</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Contact Details</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Jurisdiction</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ombudsmanContacts.map((contact) => (
                              <TableRow key={contact.city}>
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
              <Typography variant="h6" fontWeight={700}>REAL ESTATE (RERA)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {realEstateFAQs.map((item, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="primary">Q: {item.q}</Typography>
                  <Typography variant="body1">A: {item.a}</Typography>
                </Box>
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                (Source: Tax Guru)
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* OTHERS */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight={700}>OTHER CATEGORIES</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="ul" sx={{ pl: 3 }}>
                <li>Telecom</li>
                <li>Automobile</li>
                <li>Consumer Electronics</li>
                <li>Domestic Appliances</li>
                <li>Medical Negligence</li>
              </Box>
            </AccordionDetails>
          </Accordion>

        </Box>
      </Container>
    </Box>
  );
};


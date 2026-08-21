/**
 * Add translation keys from t('key', 'fallback') patterns missing in en.json
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const enFile = path.join(__dirname, '../src/i18n/locales/en.json');
const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));

const manual = {
  'activities.observance.rights': 'Consumer Rights Day (March 15th)',
  'activities.observance.national': 'National Consumer Day (December 24th)',
  'activities.observance.samarpan': 'Samarpan Diwas (Bindu Madhav Joshi Punyatithi)',
  'donate.successTitle': 'Thank you for your donation',
  'donate.successSubtitle': 'Your payment was successful.',
  'donate.paymentSuccessful': 'Donation successful',
  'donate.donationComplete': 'Your donation details have been saved.',
  'donate.thankYouDonor': 'Thank you, {{name}}.',
  'donate.amountReceived': 'Amount received: ₹{{amount}}',
  'donate.amountRequired': 'Please enter a valid donation amount.',
  'donate.requiredFields': 'Please fill all required fields.',
  'donate.formTitle': 'Donation Form',
  'donate.shareOn': 'Share this on:',
  'donate.termsTitle': 'Terms & Conditions:',
  'donate.paymentDetails': 'Payment Details',
  'donate.amount': 'Donation Amount',
  'donate.amountPlaceholder': 'Enter Amount',
  'donate.firstName': 'First Name',
  'donate.lastName': 'Last Name',
  'donate.fatherOrSpouse': 'Father or Spouse Name',
  'donate.addressLine2': 'Address line 2',
  'donate.city': 'City',
  'donate.pan': 'PAN',
  'donate.panPlaceholder': 'e.g. ABCDP1234M',
  'donate.panRequired': 'PAN is required.',
  'donate.panSerialInvalid': 'PAN serial part is invalid.',
  'donate.panSurnameInvalid': 'PAN surname part is invalid.',
  'donate.panInvalid': 'Enter a valid PAN (e.g. ABCDP1234M).',
  'login.pincodeRequired': 'Pincode is required',
  'login.pincode': 'Pincode',
  'login.pincodeInvalid': 'Enter a valid pincode between 110001 and 999999 (cannot start with 0)',
  'login.noStateMatches': 'No matching state',
  'login.searchState': 'Search state...',
  'login.noDistrictMatches': 'No matching district',
  'login.searchDistrict': 'Search district...',
  'login.selectStateFirst': 'Select state first',
  'login.selectStateDistrictFirst': 'Select state and district first',
  'about.quotes.jp.text':
    'I have briefed about the activities of Grahak Panchayat. The whole nation is in need of such work. The youth should undertake this constructive work.',
  'about.quotes.chagla.text':
    "Friends, remember, consumer is the kingpin in a rural democracy. Had Gandhiji been alive today he would have given this work to nation as 'One Point Programme'.",
  'about.quotes.president.text':
    'The work of Grahak Panchayat is right effort in the right direction. You should strive to take this activity to every city and village.',
  'about.quotes.shah.text':
    "The work started by Grahak Panchayat has the potential of restructuring the nation's economic order. Such work must spread throughout the country.",
  'common.recent': 'Recent',
  'about.moments.subtitle': "A collection of memorable moments from ABGP's journey",
  'registrationPopup.welcome': 'Welcome to ABGP',
  'registrationPopup.title': 'Become a New Member',
  'registrationPopup.cta': 'Register as New Member',
  'registrationPopup.later': 'Maybe later',
  'gyandeep.sectors.env.p1': 'Choose eco-friendly products',
  'gyandeep.sectors.env.p2': 'Avoid plastic use',
  'gyandeep.sectors.env.p3': 'Be cautious of greenwashing in ads',
  'gyandeep.sectors.env.p4': 'Support sustainable practices',
  'gyandeep.sectors.food.p1': 'Check FSSAI license on products',
  'gyandeep.sectors.food.p2': 'Read expiry date and ingredients',
  'gyandeep.sectors.food.p3': 'Be aware of food adulteration',
  'gyandeep.sectors.food.p4': 'File complaints via Food Safety helpline',
  'gyandeep.sectors.cyber.p1': 'Beware of phishing and scams',
  'gyandeep.sectors.cyber.p2': 'Use secure websites and payments',
  'gyandeep.sectors.cyber.p3': 'Read privacy policies',
  'gyandeep.sectors.cyber.p4': 'Report cyber fraud to cybercrime.gov.in',
  'gyandeep.sectors.estate.p1': 'Register only with RERA-approved builders',
  'gyandeep.sectors.estate.p2': 'Demand proper legal documents',
  'gyandeep.sectors.estate.p3': 'Lodge complaints at RERA portal',
  'gyandeep.sectors.edu.p1': 'Know your rights as student/parent',
  'gyandeep.sectors.edu.p2': 'Ask for fee breakdown/refund policies',
  'gyandeep.sectors.edu.p3': 'Check accreditation of institutions',
  'gyandeep.sectors.edu.p4': 'Report unfair practices',
  'facebookPages.searchPlaceholder': 'Search by prant or region...',
  'facebookPages.noMatch': 'No pages match your search.',
  'petitionDetail.ended': 'This petition has ended',
  'login.prantPortalTitle': 'ABGP Prant Portal',
  'login.prantLoginCardTitle': 'Prant Login',
  'login.prantLoginCardSubtitle': 'Regional dashboard access',
  'login.signInToPrantPanel': 'Sign in to Prant Panel',
  'login.notAuthorizedPrant': 'This account is not authorized for prant access.',
  'login.adminPortalTitle': 'ABGP Admin Access',
  'login.adminLoginCardTitle': 'Admin Login',
  'login.adminLoginCardSubtitle': 'Authorized access only',
  'login.signInAsAdmin': 'Sign in as Admin',
  'login.notAuthorizedAdmin': 'This account is not authorized for admin access.',
  'login.firebaseNotConfigured': 'Firebase auth is not configured. Set VITE_FIREBASE_* in your .env file.',
  'login.memberLoginTab': 'Member Login',
  'login.newRegistrationTab': 'New Registration',
  'login.loginWithPhone': 'Login with phone',
  'login.loginWithEmail': 'Login with Email',
  'login.continueWithPhone': 'Continue with Phone',
  'login.continueWithEmail': 'Continue with Email',
  'panel.petitionMailbox': 'MAILBOX',
  'panel.petitionEditDraft': 'Edit Petition Mail Draft',
  'panel.petitionCreateDraft': 'Create Petition Mail Draft',
  'panel.petitionEditHint': 'Update petition details, then click Update Mail Petition.',
  'panel.petitionCreateHint': 'Compose petition details that users will send via their email app.',
  'panel.petitionRecipientEmails': 'Recipient Email(s)',
  'panel.petitionRecipientPlaceholder': 'example@domain.com, another@domain.com',
  'panel.petitionRecipientHelper': 'Multiple emails separated by comma',
  'panel.petitionCc': 'Cc',
  'panel.petitionCcPlaceholder': 'cc@domain.com',
  'panel.petitionBcc': 'Bcc',
  'panel.petitionUpdateMail': 'Update Mail Petition',
  'panel.petitionSaveMail': 'Save Mail Petition',
  'panel.petitionUpdatedSuccess': 'Petition updated successfully.',
  'panel.petitionCreatedSuccess': 'Petition created successfully and saved to database!',
  'panel.petitionSaveFailed': 'Failed to save to database.',
  'panel.petitionUpdatedLocal': 'Petition updated successfully (Local Storage).',
  'panel.petitionCreatedLocal': 'Petition created successfully (Local Storage).',
  'panel.failedLoadPrants': 'Failed to load prants',
  'panel.sessionExpired': 'Your session has expired. Please log in again.',
  'panel.failedChangePassword': 'Failed to change password',
  'activities.memorandumAlt': 'Memorandum Submission',
  'common.invalidUrl': 'Invalid URL',
  'common.image': 'Image',
  'complaint.orderType.online': 'Online',
  'complaint.orderType.takeaway': 'Takeaway',
  'complaint.priority.medium': 'Medium',
};

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'i18n') walk(full, files);
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const re = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g;
const re2 = /t\(\s*['"]([^'"]+)['"]\s*,\s*\{\s*defaultValue:\s*['"]([^'"]+)['"]/g;

let added = 0;
for (const file of walk(srcDir)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const regex of [re, re2]) {
    let m;
    while ((m = regex.exec(content))) {
      const [key, val] = m.slice(1, 3);
      if (!(key in en)) {
        en[key] = val;
        added++;
      }
    }
  }
}

for (const [key, val] of Object.entries(manual)) {
  if (!(key in en)) {
    en[key] = val;
    added++;
  }
}

const sorted = Object.fromEntries(Object.keys(en).sort().map((k) => [k, en[k]]));
fs.writeFileSync(enFile, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
console.log(`Added ${added} keys to en.json (${Object.keys(sorted).length} total)`);

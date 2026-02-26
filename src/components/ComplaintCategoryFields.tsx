import React from 'react';
import { Box, TextField, MenuItem, Stack, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export type ComplaintCategory =
  | 'realEstate'
  | 'food'
  | 'hospital'
  | 'transport'
  | 'ecommerce'
  | 'society'
  | 'utility'
  | 'education'
  | 'other';

interface ComplaintCategoryFieldsProps {
  category: ComplaintCategory;
  formData: Record<string, string | string[] | boolean>;
  onUpdate: (key: string, value: string | string[] | boolean) => void;
  onToggleCheck: (key: string, option: string) => void;
}

export const ComplaintCategoryFields: React.FC<ComplaintCategoryFieldsProps> = ({
  category,
  formData,
  onUpdate,
  onToggleCheck,
}) => {
  const { t } = useTranslation();

  const field = (key: string, labelKey: string, type: 'text' | 'number' | 'date' = 'text', required = false) => (
    <TextField
      key={key}
      fullWidth
      size="small"
      label={t(labelKey)}
      value={(formData[key] as string) || ''}
      onChange={(e) => onUpdate(key, e.target.value)}
      type={type}
      required={required}
      variant="outlined"
      InputLabelProps={type === 'date' ? { shrink: true } : undefined}
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
    />
  );

  const checkboxGroup = (key: string, options: { value: string; labelKey: string }[]) => (
    <Box key={key} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      {options.map((opt) => (
        <FormControlLabel
          key={opt.value}
          control={
            <Checkbox
              checked={((formData[key] as string[]) || []).includes(opt.value)}
              onChange={() => onToggleCheck(key, opt.value)}
              size="small"
            />
          }
          label={t(opt.labelKey)}
        />
      ))}
    </Box>
  );

  switch (category) {
    case 'realEstate':
      return (
        <Stack spacing={2}>
          {field('propertyType', 'complaint.realEstate.propertyType', 'text', true)}
          {field('projectName', 'complaint.realEstate.projectName', 'text', true)}
          {field('builderName', 'complaint.realEstate.builderName', 'text', true)}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.realEstate.issue')}</Typography>
          {checkboxGroup('realEstateIssue', [
            { value: 'delay', labelKey: 'complaint.realEstate.issueDelay' },
            { value: 'quality', labelKey: 'complaint.realEstate.issueQuality' },
            { value: 'leakage', labelKey: 'complaint.realEstate.issueLeakage' },
            { value: 'electricity', labelKey: 'complaint.realEstate.issueElectricity' },
            { value: 'illegal', labelKey: 'complaint.realEstate.issueIllegal' },
            { value: 'other', labelKey: 'complaint.other' },
          ])}
          {field('datePromised', 'complaint.realEstate.datePromised', 'date')}
          {field('dateStarted', 'complaint.realEstate.dateStarted', 'date')}
          <TextField select fullWidth size="small" label={t('complaint.realEstate.contactedBuilder')} value={(formData.contactedBuilder as string) || ''} onChange={(e) => onUpdate('contactedBuilder', e.target.value)} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <MenuItem value="">{t('login.select')}</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </TextField>
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'food':
      return (
        <Stack spacing={2}>
          {field('restaurantName', 'complaint.food.restaurantName', 'text', true)}
          <TextField select fullWidth size="small" label={t('complaint.food.orderType')} value={(formData.orderType as string) || ''} onChange={(e) => onUpdate('orderType', e.target.value)} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <MenuItem value="">{t('login.select')}</MenuItem>
            <MenuItem value="dinein">Dine-in</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="takeaway">Takeaway</MenuItem>
          </TextField>
          {field('billNumber', 'complaint.food.billNumber')}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.food.issue')}</Typography>
          {checkboxGroup('foodIssue', [
            { value: 'quality', labelKey: 'complaint.food.issueQuality' },
            { value: 'hair', labelKey: 'complaint.food.issueHair' },
            { value: 'poisoning', labelKey: 'complaint.food.issuePoisoning' },
            { value: 'expired', labelKey: 'complaint.food.issueExpired' },
            { value: 'overcharge', labelKey: 'complaint.food.issueOvercharge' },
            { value: 'hygiene', labelKey: 'complaint.food.issueHygiene' },
          ])}
          {field('dateVisit', 'complaint.food.dateVisit', 'date')}
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'hospital':
      return (
        <Stack spacing={2}>
          {field('hospitalName', 'complaint.hospital.hospitalName', 'text', true)}
          {field('doctorName', 'complaint.hospital.doctorName')}
          {field('patientName', 'complaint.hospital.patientName', 'text', true)}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.hospital.issue')}</Typography>
          {checkboxGroup('hospitalIssue', [
            { value: 'negligence', labelKey: 'complaint.hospital.issueNegligence' },
            { value: 'overcharge', labelKey: 'complaint.hospital.issueOvercharge' },
            { value: 'diagnosis', labelKey: 'complaint.hospital.issueDiagnosis' },
            { value: 'behavior', labelKey: 'complaint.hospital.issueBehavior' },
          ])}
          {field('dateTreatment', 'complaint.hospital.dateTreatment', 'date')}
          {field('billAmount', 'complaint.hospital.billAmount', 'text')}
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'transport':
      return (
        <Stack spacing={2}>
          {field('vehicleNumber', 'complaint.transport.vehicleNumber', 'text', true)}
          {field('driverName', 'complaint.transport.driverName')}
          {field('travelDateTime', 'complaint.transport.travelDateTime', 'text', true)}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.transport.issue')}</Typography>
          {checkboxGroup('transportIssue', [
            { value: 'overcharge', labelKey: 'complaint.transport.issueOvercharge' },
            { value: 'misbehavior', labelKey: 'complaint.transport.issueMisbehavior' },
            { value: 'unsafe', labelKey: 'complaint.transport.issueUnsafe' },
            { value: 'late', labelKey: 'complaint.transport.issueLate' },
          ])}
          {field('routeDetails', 'complaint.transport.routeDetails')}
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'ecommerce':
      return (
        <Stack spacing={2}>
          {field('platformName', 'complaint.ecommerce.platformName', 'text', true)}
          {field('orderId', 'complaint.ecommerce.orderId', 'text', true)}
          {field('productName', 'complaint.ecommerce.productName', 'text', true)}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.ecommerce.issue')}</Typography>
          {checkboxGroup('ecommerceIssue', [
            { value: 'wrong', labelKey: 'complaint.ecommerce.issueWrong' },
            { value: 'damaged', labelKey: 'complaint.ecommerce.issueDamaged' },
            { value: 'refund', labelKey: 'complaint.ecommerce.issueRefund' },
            { value: 'fake', labelKey: 'complaint.ecommerce.issueFake' },
          ])}
          {field('orderDate', 'complaint.ecommerce.orderDate', 'date')}
          {field('amountPaid', 'complaint.ecommerce.amountPaid', 'text')}
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'society':
      return (
        <Stack spacing={2}>
          {field('flatNumber', 'complaint.society.flatNumber', 'text', true)}
          {field('blockWing', 'complaint.society.blockWing')}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.society.issue')}</Typography>
          {checkboxGroup('societyIssue', [
            { value: 'water', labelKey: 'complaint.society.issueWater' },
            { value: 'parking', labelKey: 'complaint.society.issueParking' },
            { value: 'security', labelKey: 'complaint.society.issueSecurity' },
            { value: 'lift', labelKey: 'complaint.society.issueLift' },
            { value: 'noise', labelKey: 'complaint.society.issueNoise' },
          ])}
          {field('sinceWhen', 'complaint.society.sinceWhen')}
          <TextField select fullWidth size="small" label={t('complaint.society.urgency')} value={(formData.urgency as string) || ''} onChange={(e) => onUpdate('urgency', e.target.value)} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <MenuItem value="">{t('login.select')}</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'utility':
      return (
        <Stack spacing={2}>
          {field('consumerNumber', 'complaint.utility.consumerNumber', 'text', true)}
          {field('boardName', 'complaint.utility.boardName', 'text', true)}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.utility.issue')}</Typography>
          {checkboxGroup('utilityIssue', [
            { value: 'powercut', labelKey: 'complaint.utility.issuePowercut' },
            { value: 'highbill', labelKey: 'complaint.utility.issueHighbill' },
            { value: 'meter', labelKey: 'complaint.utility.issueMeter' },
          ])}
          {field('billAmount', 'complaint.utility.billAmount')}
          {field('lastBillDate', 'complaint.utility.lastBillDate', 'date')}
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'education':
      return (
        <Stack spacing={2}>
          {field('institutionName', 'complaint.education.institutionName', 'text', true)}
          {field('studentName', 'complaint.education.studentName', 'text', true)}
          {field('classRollNo', 'complaint.education.classRollNo')}
          <Typography variant="subtitle2" color="text.secondary">{t('complaint.education.issue')}</Typography>
          {checkboxGroup('educationIssue', [
            { value: 'fee', labelKey: 'complaint.education.issueFee' },
            { value: 'behavior', labelKey: 'complaint.education.issueBehavior' },
            { value: 'infrastructure', labelKey: 'complaint.education.issueInfrastructure' },
            { value: 'exam', labelKey: 'complaint.education.issueExam' },
          ])}
          {field('dateIncident', 'complaint.education.dateIncident', 'date')}
          {field('description', 'complaint.description', 'text', true)}
        </Stack>
      );
    case 'other':
    default:
      return (
        <Stack spacing={2}>
          {field('organizationName', 'complaint.other.organizationName', 'text', true)}
          {field('incidentDate', 'complaint.other.incidentDate', 'date')}
          <TextField fullWidth size="small" label={t('complaint.description')} value={(formData.description as string) || ''} onChange={(e) => onUpdate('description', e.target.value)} multiline rows={4} required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Stack>
      );
  }
};

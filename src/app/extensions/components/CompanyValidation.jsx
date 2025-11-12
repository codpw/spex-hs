import React from 'react';
import {
  Box,
  Text,
  Flex,
  Divider,
  Alert
} from '@hubspot/ui-extensions';

export const CompanyValidation = ({ company, contacts, dealType }) => {
  const hasExactId = !!company.exact_account_id;
  const hasAddress = !!(company.address && company.city && company.zip && company.country);
  const hasCountry = !!company.country;
  const hasVAT = !!company.vat_ein_number;
  const hasContacts = contacts && contacts.length > 0;

  // EU countries for VAT check
  const EU_COUNTRIES = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  const isEU = hasCountry && EU_COUNTRIES.includes(company.country);

  // Determine critical errors
  const errors = [];
  if (!hasAddress) errors.push('Billing address incomplete');
  if (!hasContacts) errors.push('No contacts available');
  if (dealType === 'existingbusiness' && !hasExactId) {
    errors.push('Exact Account ID required for Existing Business');
  }

  // Warnings
  const warnings = [];
  if (dealType === 'newbusiness' && !hasExactId) {
    warnings.push('Exact Account ID missing - will be created on close-won');
  }
  if (isEU && !hasVAT) {
    warnings.push('EU company missing VAT - add if B2B');
  }

  return (
    <Box>
      <Text format={{ fontWeight: 'bold' }}>Company Validation</Text>
      <Divider distance="small" />

      <Flex direction="column" gap="xs">
        <ValidationItem
          label="Exact Account ID"
          status={hasExactId}
          critical={dealType === 'existingbusiness'}
        />
        <ValidationItem
          label="Billing Address"
          status={hasAddress}
          critical={true}
        />
        <ValidationItem
          label="Country Code"
          status={hasCountry}
          critical={true}
        />
        {isEU && (
          <ValidationItem
            label="VAT Number"
            status={hasVAT}
            critical={false}
          />
        )}
        <ValidationItem
          label="Contacts Available"
          status={hasContacts}
          critical={true}
        />
      </Flex>

      {errors.length > 0 && (
        <Box marginTop="md">
          <Alert title="Cannot Create Deal" variant="error">
            {errors.map((err, i) => (
              <Text key={i}>{err}</Text>
            ))}
          </Alert>
        </Box>
      )}

      {warnings.length > 0 && errors.length === 0 && (
        <Box marginTop="md">
          <Alert title="Warnings" variant="warning">
            {warnings.map((warn, i) => (
              <Text key={i}>{warn}</Text>
            ))}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

const ValidationItem = ({ label, status, critical }) => {
  const icon = status ? '✓' : '✗';
  const color = status ? 'success' : (critical ? 'error' : 'warning');

  return (
    <Flex direction="row" gap="xs" align="center">
      <Text format={{ fontWeight: 'bold' }}>{icon}</Text>
      <Text>{label}</Text>
      {!status && critical && (
        <Text format={{ fontWeight: 'demibold' }}>(Required)</Text>
      )}
    </Flex>
  );
};

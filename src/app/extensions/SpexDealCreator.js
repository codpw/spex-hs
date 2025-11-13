import React, { useState, useEffect } from 'react';
import {
  hubspot,
  Box,
  Text,
  Flex,
  Divider,
  LoadingSpinner,
  Alert
} from '@hubspot/ui-extensions';
import { CompanyValidation } from './components/CompanyValidation';
import { DealHistory } from './components/DealHistory';
import { DealForm } from './components/DealForm';

hubspot.extend((props) => (
  <Extension {...props} />
));

const Extension = ({ context, runServerlessFunction, actions }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [templateDeal, setTemplateDeal] = useState(null);
  const [dealCreated, setDealCreated] = useState(false);

  const companyId = context.crm.objectId;

  // Load company data on mount
  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await runServerlessFunction({
        name: 'getCompanyData',
        parameters: { companyId }
      });

      if (response.success) {
        setCompanyData(response.data);
      } else {
        setError(response.error || 'Failed to load company data');
      }
    } catch (err) {
      setError('Error loading company data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDeal = (deal) => {
    setTemplateDeal(deal);
  };

  const handleSubmit = async (dealData) => {
    try {
      const response = await runServerlessFunction({
        name: 'createDeal',
        parameters: dealData
      });

      if (response.success) {
        setDealCreated(true);
        // Refresh the page to show new deal
        actions.refreshObjectProperties();
      } else {
        setError(response.error || 'Failed to create deal');
      }
    } catch (err) {
      setError('Error creating deal: ' + err.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box>
        <Flex direction="column" align="center" gap="md">
          <LoadingSpinner size="md" />
          <Text>Loading company data...</Text>
        </Flex>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box>
        <Alert title="Error" variant="error">
          <Text>{error}</Text>
        </Alert>
      </Box>
    );
  }

  // Success state
  if (dealCreated) {
    return (
      <Box>
        <Alert title="Success!" variant="success">
          <Text>Deal created successfully</Text>
        </Alert>
      </Box>
    );
  }

  // No data
  if (!companyData) {
    return (
      <Box>
        <Alert title="No Data" variant="warning">
          <Text>Unable to load company data</Text>
        </Alert>
      </Box>
    );
  }

  // Validation errors
  const validationErrors = [];
  if (!companyData.company.address || !companyData.company.city ||
      !companyData.company.zip || !companyData.company.country) {
    validationErrors.push('Billing address incomplete');
  }
  if (!companyData.contacts || companyData.contacts.length === 0) {
    validationErrors.push('No contacts available');
  }

  // Main UI
  return (
    <Box>
      <Text format={{ fontWeight: 'bold', fontSize: 'large' }}>
        SPEX Deal Creator
      </Text>
      <Divider distance="md" />

      <Flex direction="column" gap="lg">
        {/* Section 1: Company Validation */}
        <CompanyValidation
          company={companyData.company}
          contacts={companyData.contacts}
          dealType="newbusiness"
        />

        <Divider />

        {/* Section 2: Deal History */}
        <DealHistory
          deals={companyData.previousDeals}
          onSelectDeal={handleSelectDeal}
        />

        <Divider />

        {/* Section 3: Create Deal Form */}
        <DealForm
          company={{ ...companyData.company, id: companyId }}
          contacts={companyData.contacts}
          paymentMethodOptions={companyData.paymentMethodOptions}
          templateDeal={templateDeal}
          onSubmit={handleSubmit}
          validationErrors={validationErrors}
        />
      </Flex>
    </Box>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  Divider,
  Button,
  Select,
  RadioGroup,
  Radio,
  Alert,
  LoadingSpinner
} from '@hubspot/ui-extensions';

const AREAS = {
  NYC: { label: 'NYC', value: 'NYC', pipelineId: '384366810', stageId: '593899995' },
  AMS: { label: 'Amsterdam', value: 'AMS', pipelineId: '262982359', stageId: '433706944' }
};

const EVENT_YEARS = ['2025', '2026', '2027'];
const PAYMENT_TERMS = ['Immediately', '7 Days', '14 Days', '30 Days', '60 Days', '120 Days'];

export const DealForm = ({
  company,
  contacts,
  paymentMethodOptions,
  templateDeal,
  onSubmit,
  validationErrors
}) => {
  const [area, setArea] = useState('NYC');
  const [eventYear, setEventYear] = useState('2025');
  const [dealType, setDealType] = useState('newbusiness');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('14 Days');
  const [ownerId, setOwnerId] = useState('');
  const [contactId, setContactId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate from template deal if provided
  useEffect(() => {
    if (templateDeal) {
      if (templateDeal.hubspot_owner_id) setOwnerId(templateDeal.hubspot_owner_id);
      if (templateDeal.payment_method) setPaymentMethod(templateDeal.payment_method);
      if (templateDeal.payment_term) setPaymentTerm(templateDeal.payment_term);
    } else {
      // Use company owner as default
      if (company.hubspot_owner_id) setOwnerId(company.hubspot_owner_id);
      // Set default payment method if available
      if (paymentMethodOptions.length > 0) {
        const invoiceOption = paymentMethodOptions.find(opt =>
          opt.label.toLowerCase().includes('invoice')
        );
        if (invoiceOption) setPaymentMethod(invoiceOption.value);
      }
    }
  }, [templateDeal, company, paymentMethodOptions]);

  // Generate deal name preview
  const generateDealName = () => {
    const areaLabel = area === 'NYC' ? 'NYC' : 'Amsterdam';
    return `${company.name} - DPW ${areaLabel} ${eventYear}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const areaConfig = AREAS[area];
    const dealData = {
      companyId: company.id,
      contactId,
      dealName: generateDealName(),
      area,
      eventYear,
      dealType,
      paymentMethod,
      paymentTerm,
      ownerId,
      pipelineId: areaConfig.pipelineId,
      stageId: areaConfig.stageId
    };

    await onSubmit(dealData);
    setIsSubmitting(false);
  };

  const canSubmit = contactId && !isSubmitting && validationErrors.length === 0;

  return (
    <Box>
      <Text format={{ fontWeight: 'bold' }}>Create New Deal</Text>
      <Divider distance="small" />

      <Flex direction="column" gap="md">
        {/* Area */}
        <Box>
          <Text format={{ fontWeight: 'demibold' }}>Event Area *</Text>
          <Select
            name="area"
            value={area}
            onChange={(value) => setArea(value)}
            options={[
              { label: 'NYC', value: 'NYC' },
              { label: 'Amsterdam', value: 'AMS' }
            ]}
          />
        </Box>

        {/* Event Year */}
        <Box>
          <Text format={{ fontWeight: 'demibold' }}>Event Year *</Text>
          <Select
            name="eventYear"
            value={eventYear}
            onChange={(value) => setEventYear(value)}
            options={EVENT_YEARS.map(year => ({ label: year, value: year }))}
          />
        </Box>

        {/* Deal Type */}
        <Box>
          <Text format={{ fontWeight: 'demibold' }}>Deal Type *</Text>
          <RadioGroup
            name="dealType"
            value={dealType}
            onChange={(value) => setDealType(value)}
          >
            <Radio value="newbusiness" label="New Business" />
            <Radio value="existingbusiness" label="Existing Business" />
          </RadioGroup>
        </Box>

        {/* Payment Method */}
        <Box>
          <Text format={{ fontWeight: 'demibold' }}>Payment Method</Text>
          <Select
            name="paymentMethod"
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value)}
            options={paymentMethodOptions.map(opt => ({
              label: opt.label,
              value: opt.value
            }))}
          />
        </Box>

        {/* Payment Term */}
        <Box>
          <Text format={{ fontWeight: 'demibold' }}>Payment Term</Text>
          <Select
            name="paymentTerm"
            value={paymentTerm}
            onChange={(value) => setPaymentTerm(value)}
            options={PAYMENT_TERMS.map(term => ({ label: term, value: term }))}
          />
        </Box>

        {/* Billing Contact */}
        <Box>
          <Text format={{ fontWeight: 'demibold' }}>Billing Contact *</Text>
          {contacts.length > 0 ? (
            <RadioGroup
              name="contactId"
              value={contactId}
              onChange={(value) => setContactId(value)}
            >
              {contacts.map(contact => (
                <Radio
                  key={contact.id}
                  value={contact.id}
                  label={`${contact.firstname || ''} ${contact.lastname || ''} ${contact.email ? `(${contact.email})` : ''}`.trim()}
                />
              ))}
            </RadioGroup>
          ) : (
            <Text>No contacts available</Text>
          )}
        </Box>

        {/* Deal Name Preview */}
        <Box>
          <Alert variant="info" title="Deal Name Preview">
            <Text format={{ fontWeight: 'bold' }}>{generateDealName()}</Text>
          </Alert>
        </Box>

        {/* Submit */}
        <Flex direction="row" gap="sm">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            variant="primary"
          >
            {isSubmitting ? <LoadingSpinner size="xs" /> : 'Create Deal'}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

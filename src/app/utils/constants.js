// Area configurations with pipeline/stage mappings
export const AREAS = {
  NYC: {
    label: 'NYC',
    value: 'NYC',
    pipelineId: '384366810',
    firstStageId: '593899995'
  },
  AMS: {
    label: 'Amsterdam',
    value: 'AMS',
    pipelineId: '262982359',
    firstStageId: '433706944'
  }
};

export const EVENT_YEARS = ['2025', '2026', '2027'];

export const DEAL_TYPES = {
  NEW: 'newbusiness',
  EXISTING: 'existingbusiness'
};

export const PAYMENT_TERMS = [
  'Immediately',
  '7 Days',
  '14 Days',
  '30 Days',
  '60 Days',
  '120 Days'
];

// EU countries for VAT validation
export const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

// Company properties to fetch
export const COMPANY_PROPERTIES = [
  'name',
  'address',
  'city',
  'zip',
  'country',
  'vat_ein_number',
  'exact_account_id',
  'hubspot_owner_id'
];

// Contact properties to fetch
export const CONTACT_PROPERTIES = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'jobtitle'
];

// Deal properties to fetch from history
export const DEAL_PROPERTIES = [
  'dealname',
  'amount',
  'closedate',
  'payment_method',
  'payment_term',
  'hubspot_owner_id'
];

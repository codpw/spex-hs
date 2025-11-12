import { EU_COUNTRIES, DEAL_TYPES } from './constants.js';

/**
 * Validates company data for deal creation
 * @param {Object} company - Company object from HubSpot
 * @param {Array} contacts - Array of contact objects
 * @param {string} dealType - Selected deal type (newbusiness/existingbusiness)
 * @returns {Object} { valid: boolean, errors: Array, warnings: Array }
 */
export function validateCompanyForDeal(company, contacts, dealType) {
  const errors = [];
  const warnings = [];

  // Hard blocks
  if (!company.name) {
    errors.push('Company name is missing');
  }

  if (!company.address || !company.city || !company.zip || !company.country) {
    errors.push('Billing address incomplete (address, city, zip, country required)');
  }

  if (!contacts || contacts.length === 0) {
    errors.push('No contacts associated with company');
  }

  if (dealType === DEAL_TYPES.EXISTING && !company.exact_account_id) {
    errors.push('Exact Account ID required for Existing Business deals');
  }

  // Soft warnings
  if (dealType === DEAL_TYPES.NEW && !company.exact_account_id) {
    warnings.push('Exact Account ID missing - will be created on close-won');
  }

  if (company.country && EU_COUNTRIES.includes(company.country) && !company.vat_ein_number) {
    warnings.push('EU company missing VAT number - add if B2B');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks validation status for UI display
 * @param {Object} company - Company object from HubSpot
 * @param {Array} contacts - Array of contact objects
 * @returns {Object} Status object with booleans for each check
 */
export function getValidationStatus(company, contacts) {
  return {
    hasExactId: !!company.exact_account_id,
    hasAddress: !!(company.address && company.city && company.zip && company.country),
    hasCountry: !!company.country,
    hasVAT: !!company.vat_ein_number,
    isEU: company.country && EU_COUNTRIES.includes(company.country),
    hasContacts: contacts && contacts.length > 0
  };
}

/**
 * Generates deal name with auto-numbering
 * @param {string} companyName - Company name
 * @param {string} location - NYC or AMS
 * @param {string} year - Event year
 * @param {Array} existingDeals - Array of existing deals with same base name
 * @returns {string} Deal name with optional numbering
 */
export function generateDealName(companyName, location, year, existingDeals = []) {
  const baseName = `${companyName} - DPW ${location} ${year}`;

  if (existingDeals.length === 0) {
    return baseName;
  }

  // Find highest number used
  let maxNum = 1;
  existingDeals.forEach(deal => {
    const match = deal.dealname?.match(/#(\d+)$/);
    if (match) {
      maxNum = Math.max(maxNum, parseInt(match[1]));
    }
  });

  return `${baseName} #${maxNum + 1}`;
}

const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
  const {
    companyId,
    contactId,
    dealName,
    area,
    eventYear,
    dealType,
    paymentMethod,
    paymentTerm,
    ownerId,
    pipelineId,
    stageId
  } = context.parameters || {};

  // Validate required parameters
  if (!companyId || !contactId || !dealName || !area || !eventYear || !dealType) {
    return {
      success: false,
      error: 'Missing required parameters'
    };
  }

  try {
    const hubspotClient = new hubspot.Client({
      accessToken: process.env.HUBSPOT_PERSONAL_ACCESS_KEY
    });

    // 1. Check for existing deals with similar name (for numbering)
    const existingDealsResponse = await hubspotClient.crm.deals.search({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'dealname',
              operator: 'CONTAINS_TOKEN',
              value: dealName
            }
          ]
        }
      ],
      properties: ['dealname'],
      limit: 100
    });

    // Auto-number if duplicates exist
    let finalDealName = dealName;
    if (existingDealsResponse.results.length > 0) {
      let maxNum = 1;
      existingDealsResponse.results.forEach(deal => {
        const match = deal.properties.dealname?.match(/#(\d+)$/);
        if (match) {
          maxNum = Math.max(maxNum, parseInt(match[1]));
        }
      });
      finalDealName = `${dealName} #${maxNum + 1}`;
    }

    // 2. Create deal with associations
    const dealProperties = {
      dealname: finalDealName,
      dealstage: stageId,
      pipeline: pipelineId,
      event_year: eventYear,
      area: area,
      dealtype: dealType
    };

    // Add optional properties
    if (ownerId) dealProperties.hubspot_owner_id = ownerId;
    if (paymentMethod) dealProperties.payment_method = paymentMethod;
    if (paymentTerm) dealProperties.payment_term = paymentTerm;

    const createResponse = await hubspotClient.crm.deals.create({
      properties: dealProperties,
      associations: [
        {
          to: { id: companyId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 5 // Deal to Company
            }
          ]
        },
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 3 // Deal to Contact
            }
          ]
        }
      ]
    });

    return {
      success: true,
      data: {
        dealId: createResponse.id,
        dealName: createResponse.properties.dealname,
        existingDealsCount: existingDealsResponse.results.length
      }
    };
  } catch (error) {
    console.error('Error creating deal:', error);
    return {
      success: false,
      error: error.message || 'Failed to create deal'
    };
  }
};

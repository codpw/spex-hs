const hubspot = require('@hubspot/api-client');

exports.main = async (context = {}) => {
  const { companyId } = context.parameters || {};

  if (!companyId) {
    return {
      success: false,
      error: 'Company ID required'
    };
  }

  try {
    const hubspotClient = new hubspot.Client({
      accessToken: process.env.HUBSPOT_PERSONAL_ACCESS_KEY
    });

    // 1. Get company data
    const companyResponse = await hubspotClient.crm.companies.basicApi.getById(
      companyId,
      [
        'name',
        'address',
        'city',
        'zip',
        'country',
        'vat_ein_number',
        'exact_account_id',
        'hubspot_owner_id'
      ]
    );

    // 2. Get associated contacts
    const contactsResponse = await hubspotClient.crm.companies.associationsApi.getAll(
      companyId,
      'contacts',
      undefined,
      100
    );

    // Fetch contact details
    const contacts = [];
    if (contactsResponse.results.length > 0) {
      const contactIds = contactsResponse.results.map(c => c.id);
      const contactDetailResponse = await hubspotClient.crm.contacts.batchApi.read({
        properties: ['firstname', 'lastname', 'email', 'phone', 'jobtitle'],
        inputs: contactIds.map(id => ({ id }))
      });
      contacts.push(...contactDetailResponse.results);
    }

    // 3. Search for closed-won SPEX deals (from both pipelines)
    const dealsSearchResponse = await hubspotClient.crm.deals.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'associations.company',
              operator: 'EQ',
              value: companyId
            },
            {
              propertyName: 'dealstage',
              operator: 'EQ',
              value: 'closedwon'
            }
          ]
        }
      ],
      properties: [
        'dealname',
        'amount',
        'closedate',
        'payment_method',
        'payment_term',
        'hubspot_owner_id',
        'pipeline'
      ],
      sorts: [{ propertyName: 'closedate', direction: 'DESCENDING' }],
      limit: 10
    });

    // 4. Get payment method property options
    const paymentMethodProperty = await hubspotClient.crm.properties.coreApi.getByName(
      'deals',
      'payment_method'
    );

    return {
      success: true,
      data: {
        company: companyResponse.properties,
        contacts: contacts.map(c => ({
          id: c.id,
          ...c.properties
        })),
        previousDeals: dealsSearchResponse.results.map(d => ({
          id: d.id,
          ...d.properties
        })),
        paymentMethodOptions: paymentMethodProperty.options || []
      }
    };
  } catch (error) {
    console.error('Error fetching company data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch company data'
    };
  }
};

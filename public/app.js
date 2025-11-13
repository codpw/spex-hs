// Configuration
const CONFIG = {
    accountId: '26503447',
    accessToken: 'CiRldTEtZDNhMS1kZGEyLTQ4MTUtODI0MC04ZGYyNDczOWZkNGIQl9LRDBiN0vINKhkABeaRgmLAlGcZj_ooSyAQAdQH6Xi3egqrSgNldTE',
    apiBase: 'https://api.hubapi.com',
    areas: {
        NYC: { pipelineId: '384366810', stageId: '593899995' },
        AMS: { pipelineId: '262982359', stageId: '433706944' }
    }
};

let companyData = null;

// Get company ID from URL
function getCompanyId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('companyId') || params.get('hs_object_id');
}

// Fetch company data
async function loadCompanyData() {
    const companyId = getCompanyId();
    if (!companyId) {
        showError('No company ID provided. Open this page from a HubSpot Company record.');
        return;
    }

    try {
        const [company, contacts, deals, paymentProp] = await Promise.all([
            fetchCompany(companyId),
            fetchContacts(companyId),
            fetchDeals(companyId),
            fetchPaymentMethods()
        ]);

        companyData = { company, contacts, deals, paymentMethods: paymentProp };
        renderUI();
    } catch (error) {
        showError('Failed to load company data: ' + error.message);
    }
}

// API calls
async function fetchCompany(id) {
    const props = ['name', 'address', 'city', 'zip', 'country', 'vat_ein_number', 'exact_account_id', 'hubspot_owner_id'];
    const response = await fetch(
        `${CONFIG.apiBase}/crm/v3/objects/companies/${id}?properties=${props.join(',')}`,
        { headers: { 'Authorization': `Bearer ${CONFIG.accessToken}` } }
    );
    if (!response.ok) throw new Error('Failed to fetch company');
    const data = await response.json();
    return { id, ...data.properties };
}

async function fetchContacts(companyId) {
    const response = await fetch(
        `${CONFIG.apiBase}/crm/v4/objects/companies/${companyId}/associations/contacts`,
        { headers: { 'Authorization': `Bearer ${CONFIG.accessToken}` } }
    );
    if (!response.ok) return [];
    const data = await response.json();

    if (!data.results || data.results.length === 0) return [];

    const contactIds = data.results.map(c => c.toObjectId);
    const batchResponse = await fetch(
        `${CONFIG.apiBase}/crm/v3/objects/contacts/batch/read`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: ['firstname', 'lastname', 'email'],
                inputs: contactIds.map(id => ({ id }))
            })
        }
    );
    const contacts = await batchResponse.json();
    return contacts.results.map(c => ({ id: c.id, ...c.properties }));
}

async function fetchDeals(companyId) {
    const response = await fetch(
        `${CONFIG.apiBase}/crm/v3/objects/deals/search`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filterGroups: [{
                    filters: [
                        { propertyName: 'associations.company', operator: 'EQ', value: companyId },
                        { propertyName: 'dealstage', operator: 'EQ', value: 'closedwon' }
                    ]
                }],
                properties: ['dealname'],
                limit: 10
            })
        }
    );
    const data = await response.json();
    return data.results || [];
}

async function fetchPaymentMethods() {
    const response = await fetch(
        `${CONFIG.apiBase}/crm/v3/properties/deals/payment_method`,
        { headers: { 'Authorization': `Bearer ${CONFIG.accessToken}` } }
    );
    const data = await response.json();
    return data.options || [];
}

// Render UI
function renderUI() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    renderValidation();
    renderContacts();
    renderPaymentMethods();
    updatePreview();

    // Event listeners
    document.getElementById('dealForm').addEventListener('submit', handleSubmit);
    document.getElementById('area').addEventListener('change', updatePreview);
    document.getElementById('eventYear').addEventListener('change', updatePreview);
}

function renderValidation() {
    const { company, contacts } = companyData;
    const dealType = document.querySelector('input[name="dealType"]:checked').value;

    const checks = [
        {
            label: 'Exact Account ID',
            pass: !!company.exact_account_id,
            critical: dealType === 'existingbusiness'
        },
        {
            label: 'Billing Address',
            pass: !!(company.address && company.city && company.zip && company.country),
            critical: true
        },
        {
            label: 'Contacts Available',
            pass: contacts.length > 0,
            critical: true
        }
    ];

    const html = checks.map(check => {
        const icon = check.pass ? '✓' : '✗';
        const className = check.pass ? 'pass' : (check.critical ? 'fail' : 'warn');
        return `<div class="validation-item ${className}">${icon} ${check.label}</div>`;
    }).join('');

    document.getElementById('validation').innerHTML = html;
}

function renderContacts() {
    const { contacts } = companyData;
    if (contacts.length === 0) {
        document.getElementById('contactsRadio').innerHTML = '<div style="color: #f2545b;">No contacts found</div>';
        return;
    }

    const html = contacts.map((contact, i) => `
        <label class="radio-label" style="display: block; margin-bottom: 8px;">
            <input type="radio" name="contact" value="${contact.id}" ${i === 0 ? 'checked' : ''} required>
            ${contact.firstname || ''} ${contact.lastname || ''} ${contact.email ? `(${contact.email})` : ''}
        </label>
    `).join('');

    document.getElementById('contactsRadio').innerHTML = html;
}

function renderPaymentMethods() {
    const { paymentMethods } = companyData;
    const html = paymentMethods.map(opt =>
        `<option value="${opt.value}">${opt.label}</option>`
    ).join('');
    document.getElementById('paymentMethod').innerHTML = html;
}

function updatePreview() {
    const { company } = companyData;
    const area = document.getElementById('area').value;
    const year = document.getElementById('eventYear').value;
    const areaLabel = area === 'NYC' ? 'NYC' : 'Amsterdam';
    const preview = `${company.name} - DPW ${areaLabel} ${year}`;
    document.getElementById('preview').textContent = preview;
}

// Create deal
async function handleSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> Creating...';

    const area = document.getElementById('area').value;
    const eventYear = document.getElementById('eventYear').value;
    const dealType = document.querySelector('input[name="dealType"]:checked').value;
    const contactId = document.querySelector('input[name="contact"]:checked').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentTerm = document.getElementById('paymentTerm').value;

    const areaConfig = CONFIG.areas[area];
    const areaLabel = area === 'NYC' ? 'NYC' : 'Amsterdam';
    const dealName = `${companyData.company.name} - DPW ${areaLabel} ${eventYear}`;

    try {
        const response = await fetch(
            `${CONFIG.apiBase}/crm/v3/objects/deals`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        dealname: dealName,
                        dealstage: areaConfig.stageId,
                        pipeline: areaConfig.pipelineId,
                        event_year: eventYear,
                        area: area,
                        dealtype: dealType,
                        payment_method: paymentMethod,
                        payment_term: paymentTerm,
                        hubspot_owner_id: companyData.company.hubspot_owner_id
                    },
                    associations: [
                        {
                            to: { id: companyData.company.id },
                            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }]
                        },
                        {
                            to: { id: contactId },
                            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
                        }
                    ]
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create deal');
        }

        const deal = await response.json();
        showSuccess(`Deal created: ${dealName}`);

        // Redirect to deal
        setTimeout(() => {
            window.location.href = `https://app.hubspot.com/contacts/${CONFIG.accountId}/deal/${deal.id}`;
        }, 2000);
    } catch (error) {
        showError('Failed to create deal: ' + error.message);
        btn.disabled = false;
        btn.textContent = 'Create Deal';
    }
}

function showError(msg) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('message').innerHTML = `<div class="alert alert-error">${msg}</div>`;
}

function showSuccess(msg) {
    document.getElementById('message').innerHTML = `<div class="alert alert-success">${msg}</div>`;
}

// Initialize
loadCompanyData();

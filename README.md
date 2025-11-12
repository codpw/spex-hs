# SPEX HS

HubSpot UI Extension for creating SPEX sponsorship deals with validation.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Add your `HUBSPOT_PERSONAL_ACCESS_KEY` to `.env`
   - Verify `HUBSPOT_ACCOUNT_ID=26503447`

3. **Deploy extension:**
   ```bash
   npm run upload
   ```

4. **Configure in HubSpot:**
   - Go to Settings > Integrations > Private Apps
   - Navigate to UI Extensions
   - Find "spex-hs"
   - Add to Company record as custom tab

## Architecture

**Frontend:** React (HubSpot UI Extensions)
**Backend:** Node.js Serverless Functions
**Pipelines:**
- NYC: Pipeline ID `384366810`, Stage ID `593899995`
- AMS: Pipeline ID `262982359`, Stage ID `433706944`

## File Structure

```
src/
├── app/
│   ├── extensions/
│   │   ├── SpexDealCreator.jsx          # Main component
│   │   └── components/
│   │       ├── CompanyValidation.jsx     # Validation display
│   │       ├── DealHistory.jsx           # Previous deals
│   │       └── DealForm.jsx              # Creation form
│   └── app.functions/
│       ├── getCompanyData.js             # Fetch company/contacts/deals
│       └── createDeal.js                 # Create new deal
└── utils/
    ├── constants.js                      # Dropdown values, configs
    └── validation.js                     # Validation logic
```

## Validation Rules

**Hard Blocks:**
- Missing billing address
- No contacts
- Existing Business without Exact Account ID

**Warnings:**
- New Business without Exact Account ID
- EU company without VAT

## Deal Naming

Auto-generated: `{Company} - DPW {Location} {Year}`
Auto-numbered if duplicates exist (`#2`, `#3`, etc.)

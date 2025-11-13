# SPEX Deal Creator

HubSpot UI Extension for creating SPEX sponsorship deals with validation.

## Deployment

Automatically deploys via GitHub Actions on push to main.

**Setup GitHub Secrets:**
- `HUBSPOT_ACCOUNT_ID`: `26503447`
- `HUBSPOT_PERSONAL_ACCESS_KEY`: Your PAT

**Manual Deploy (alternative):**
```bash
npm install
npm run upload
```

## Architecture

**Frontend:** React (@hubspot/ui-extensions)
**Backend:** Node.js Serverless Functions
**Pipelines:**
- NYC: `384366810` → Stage `593899995`
- AMS: `262982359` → Stage `433706944`

## Structure

```
src/app/
├── cards/
│   ├── SpexDealCreator-hsmeta.json      # Card config
│   ├── SpexDealCreator.jsx              # Main component
│   ├── package.json                     # Card dependencies
│   └── components/
│       ├── CompanyValidation.jsx         # Validation UI
│       ├── DealHistory.jsx               # Previous deals
│       └── DealForm.jsx                  # Creation form
├── app.functions/
│   ├── getCompanyData.js                 # Fetch data
│   └── createDeal.js                     # Create deal
└── app.json                              # App config
```

## Validation

**Hard Blocks:**
- Missing billing address
- No contacts
- Existing Business without Exact Account ID

**Warnings:**
- New Business without Exact Account ID
- EU company without VAT

## Deal Naming

Format: `{Company} - DPW {Location} {Year}`
Auto-increments: `#2`, `#3` if duplicates exist

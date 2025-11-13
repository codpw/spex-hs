# SPEX Deal Creator - Workaround Solution

## Problem
HubSpot Platform 2025.x cannot deploy UI Extensions (platform bug)

## Workaround: HubSpot Workflows + API

### Architecture
1. **Serverless functions** → Convert to standalone Node.js API
2. **HubSpot Workflows** → Trigger deal creation
3. **Custom coded actions** → Call our API

### Implementation

#### Step 1: Deploy Functions as External API
Host `getCompanyData.js` and `createDeal.js` on:
- Vercel/Netlify serverless
- AWS Lambda
- Any Node.js host

#### Step 2: Create HubSpot Workflow
1. Go to: Automation → **Workflows**
2. Create: **Company-based workflow**
3. Trigger: Manual or property change
4. Action: **Custom code action**

#### Step 3: Custom Code Action
```javascript
const axios = require('axios');

exports.main = async (event, callback) => {
  const { companyId } = event.object;

  // Call our external API
  const response = await axios.post('https://your-api.vercel.app/createDeal', {
    companyId,
    area: event.inputFields.area,
    eventYear: event.inputFields.eventYear,
    dealType: event.inputFields.dealType,
    contactId: event.inputFields.contactId,
    paymentMethod: event.inputFields.paymentMethod,
    paymentTerm: event.inputFields.paymentTerm
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.API_KEY}`
    }
  });

  callback({
    outputFields: {
      dealId: response.data.dealId,
      dealName: response.data.dealName
    }
  });
};
```

### Alternative: Simple HTML Form
Create standalone HTML page with:
- Form for deal parameters
- Direct HubSpot API calls
- Host on GitHub Pages/Vercel
- Embed in HubSpot via iframe module

Would you like me to implement either approach?

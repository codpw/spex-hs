# HubSpot Properties Used in SPEX Deal Creator

## Company Properties
- `name` - Company name
- `address` - Street address
- `city` - City
- `zip` - Postal code
- `country` - Country code (e.g., "US", "NL", "DE")
- `vat_ein_number` - VAT/EIN number
- `exact_account_id` - Exact Online Account ID
- `hubspot_owner_id` - Company owner

## Contact Properties
- `firstname` - First name
- `lastname` - Last name
- `email` - Email address
- `phone` - Phone number
- `jobtitle` - Job title

## Deal Properties

### Standard Properties
- `dealname` - Deal name (auto-generated)
- `dealstage` - Deal stage ID
- `pipeline` - Pipeline ID
- `amount` - Deal amount
- `closedate` - Close date
- `hubspot_owner_id` - Deal owner

### Custom Properties (Verified ✓)
- `payment_method` - Payment method dropdown
- `payment_term` - Payment term (Immediately, 7 Days, 14 Days, 30 Days, 60 Days, 120 Days)
- `event_year` - Event year (2025, 2026, 2027)
- `area` - Event area (NYC or AMS)
- `dealtype` - Deal type (newbusiness or existingbusiness)

## Pipeline & Stage IDs

### NYC Pipeline
- Pipeline ID: `384366810`
- First Stage ID: `593899995`

### Amsterdam Pipeline
- Pipeline ID: `262982359`
- First Stage ID: `433706944`

## Association Type IDs
- Deal to Company: `5`
- Deal to Contact: `3`

## Deal Stage for Search
- Closed Won: `closedwon`

---

**IMPORTANT**: Verify custom property internal names match exactly. Common mismatches:
- Property label vs internal name (e.g., "Payment Method" vs "payment_method")
- Dropdown values vs internal values
- Pipeline/stage IDs may differ between sandbox/prod

# Smart Zakat Calculator API

Simple Zakat calculator and Nisab API with a clean Islamic UI.

Live site:
`https://zakat-calculator-coral-one.vercel.app`

## Features

- Smart Zakat calculation with assets, liabilities, and Nisab comparison
- Supports `gold` and `silver` Nisab basis
- Returns helpful guidance in addition to the final amount
- Currency-aware Nisab response
- 157 supported currencies
- Beginner-friendly UI and API documentation

## Endpoints

### `GET /api/nisab`

Fetch the current Nisab values in a selected currency.

Example:

```text
GET https://zakat-calculator-coral-one.vercel.app/api/nisab?currency=USD
```

Example response:

```json
{
  "success": true,
  "currency": "USD",
  "nisab": {
    "currency": "USD",
    "gold": {
      "grams": 87.48,
      "value": 6766.58
    },
    "silver": {
      "grams": 612.36,
      "value": 612.98
    },
    "zakat_rate": 0.025
  },
  "recommended_basis": "gold",
  "supported_currencies": ["BDT", "USD", "EUR", "GBP", "CAD"]
}
```

### `POST /api/calculate`

Calculate Zakat using assets, liabilities, currency, and Nisab basis.

Example:

```text
POST https://zakat-calculator-coral-one.vercel.app/api/calculate
Content-Type: application/json
```

```json
{
  "assets": {
    "cash": 500000,
    "gold": 125000,
    "savings": 220000
  },
  "liabilities": {
    "debts": 70000,
    "expenses": 25000
  },
  "currency": "BDT",
  "nisab_basis": "gold"
}
```

Example response:

```json
{
  "success": true,
  "currency": "BDT",
  "nisab_basis": "gold",
  "calculation": {
    "total_assets": 845000,
    "total_liabilities": 95000,
    "net_wealth": 750000,
    "nisab_threshold": 743580,
    "is_zakat_applicable": true,
    "zakat_amount": 18750,
    "zakat_percentage": 2.5
  },
  "insights": [
    {
      "type": "success",
      "title": "Zakat is due",
      "message": "Your payable Zakat is 18,750 BDT at 2.5% of net eligible wealth."
    }
  ]
}
```

## Supported currencies

The API now supports 157 currencies.

`BDT`, `USD`, `EUR`, `GBP`, `CAD`, `AUD`, `INR`, `PKR`, `SAR`, `AED`, `MYR`, `SGD`, `QAR`, `KWD`, `OMR`, `BHD`, `JPY`, `CNY`, `HKD`, `THB`, `IDR`, `TRY`, `ZAR`, `EGP`, `NGN`, `NOK`, `SEK`, `DKK`, `CHF`, `NZD`, `BRL`, `MXN`, `RUB`, `KRW`, `LKR`, `NPR`, `BND`, `JOD`, `MAD`, `TND`, `ILS`, `CZK`, `PLN`, `HUF`, `RON`, `UAH`, `VND`, `PHP`, `KES`, `UZS`

Additional supported currencies include:

`AFN`, `ALL`, `AMD`, `AOA`, `ARS`, `AWG`, `AZN`, `BAM`, `BBD`, `BGN`, `BIF`, `BMD`, `BOB`, `BSD`, `BTN`, `BWP`, `BYN`, `BZD`, `CDF`, `CLP`, `COP`, `CRC`, `CUP`, `CUC`, `CVE`, `DJF`, `DOP`, `DZD`, `ERN`, `ETB`, `FJD`, `FKP`, `GEL`, `GGP`, `GHS`, `GIP`, `GMD`, `GNF`, `GTQ`, `GYD`, `HNL`, `HTG`, `IQD`, `IRR`, `ISK`, `JEP`, `JMD`, `KGS`, `KHR`, `KMF`, `KYD`, `KZT`, `LAK`, `LBP`, `LRD`, `LSL`, `LYD`, `MDL`, `MGA`, `MKD`, `MMK`, `MNT`, `MOP`, `MRO`, `MRU`, `MUR`, `MVR`, `MWK`, `MZN`, `NAD`, `NIO`, `PAB`, `PGK`, `PYG`, `RSD`, `RWF`, `SBD`, `SCR`, `SDG`, `SLE`, `SLL`, `SOS`, `SRD`, `SSP`, `STN`, `SVC`, `SYP`, `SZL`, `TJS`, `TMT`, `TOP`, `TTD`, `TWD`, `TZS`, `UGX`, `UYU`, `VES`, `VUV`, `WST`, `XAF`, `XCD`, `XOF`, `XPF`, `YER`, `ZMW`, `ZWL`, `ANG`

## Project structure

```text
api/
  calculate.js
  nisab.js
data/
  nisab.json
lib/
  zakat.js
public/
  index.html
```

## Author

Made with love by [Eiaser Hosen](https://github.com/eiaserbd)

Building digital tools for the Ummah.

## Dua

`رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ`

`رَبِّ زِدْنِي عِلْمًا`

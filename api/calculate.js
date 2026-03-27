const { calculateZakat, ASSET_FIELDS, LIABILITY_FIELDS, DEFAULT_CURRENCY, CURRENCY_RATES } = require('../lib/zakat');

function setHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
}

function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  return req.body;
}

module.exports = (req, res) => {
  setHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      name: 'Smart Zakat Calculator API',
      version: '2.1.0',
      endpoints: {
        calculate: 'POST /api/calculate',
        nisab: 'GET /api/nisab',
      },
      accepted_fields: {
        assets: ASSET_FIELDS,
        liabilities: LIABILITY_FIELDS,
      },
      defaults: {
        currency: DEFAULT_CURRENCY,
        nisab_basis: 'gold',
      },
      supported_currencies: Object.keys(CURRENCY_RATES),
      example_request: {
        assets: {
          cash: 500000,
          gold: 125000,
          savings: 200000,
        },
        liabilities: {
          debts: 80000,
          expenses: 25000,
        },
        currency: 'BDT',
        nisab_basis: 'gold',
      },
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowed_methods: ['GET', 'POST', 'OPTIONS'],
    });
  }

  try {
    const payload = parseBody(req);
    const result = calculateZakat(payload);

    if (result.invalid_fields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid numeric values detected',
        invalid_fields: result.invalid_fields,
        hint: 'All asset and liability values must be valid non-negative numbers.',
      });
    }

    if (result.totals.total_assets <= 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one asset value is required',
      });
    }

    return res.status(200).json({
      success: true,
      currency: result.currency,
      nisab_basis: result.nisab_basis,
      calculation: {
        ...result.totals,
        ...result.calculation,
      },
      nisab: result.nisab,
      breakdown: {
        assets: result.assets,
        liabilities: result.liabilities,
      },
      insights: result.insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

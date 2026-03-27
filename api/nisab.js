const { CURRENCY_RATES, DEFAULT_CURRENCY, getNisabSnapshot } = require('../lib/zakat');

function setHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
}

module.exports = (req, res) => {
  setHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowed_methods: ['GET', 'OPTIONS'],
    });
  }

  try {
    const requestedCurrency = String(req.query.currency || DEFAULT_CURRENCY).toUpperCase();
    const currency = CURRENCY_RATES[requestedCurrency] ? requestedCurrency : DEFAULT_CURRENCY;
    const nisab = getNisabSnapshot(currency);

    return res.status(200).json({
      success: true,
      currency,
      nisab,
      recommended_basis: 'gold',
      supported_currencies: Object.keys(CURRENCY_RATES),
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

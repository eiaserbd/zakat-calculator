// api/calculate.js
const nisabData = require('../data/nisab.json');

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  // GET request - return calculator info
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Zakat Calculator API',
      endpoints: {
        calculate: 'POST /api/calculate',
        nisab: 'GET /api/nisab',
        help: 'GET /api/help'
      },
      example: {
        method: 'POST',
        body: {
          assets: { cash: 500000, gold: 100000, silver: 50000, savings: 200000 },
          liabilities: { debts: 100000, expenses: 50000 }
        }
      }
    });
  }
  
  // POST request - calculate zakat
  if (req.method === 'POST') {
    try {
      const { assets, liabilities, currency = 'BDT' } = req.body;
      
      if (!assets) {
        return res.status(400).json({
          success: false,
          error: 'Assets data is required'
        });
      }
      
      // Calculate total assets
      const totalAssets = 
        (assets.cash || 0) +
        (assets.gold || 0) +
        (assets.silver || 0) +
        (assets.savings || 0) +
        (assets.investments || 0) +
        (assets.business || 0);
      
      // Calculate total liabilities
      const totalLiabilities = 
        (assets.debts || 0) +
        (assets.expenses || 0);
      
      // Net wealth
      const netWealth = totalAssets - totalLiabilities;
      
      // Nisab threshold (using gold nisab)
      const nisab = nisabData.gold.nisab_value;
      
      // Check if zakat is applicable
      const isZakatApplicable = netWealth >= nisab;
      
      // Zakat amount (2.5% of net wealth)
      const zakatAmount = isZakatApplicable ? netWealth * 0.025 : 0;
      
      // Response
      return res.status(200).json({
        success: true,
        calculation: {
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
          net_wealth: netWealth,
          nisab_threshold: nisab,
          is_zakat_applicable: isZakatApplicable,
          zakat_amount: zakatAmount,
          zakat_percentage: 2.5,
          currency: currency
        },
        breakdown: {
          assets: assets,
          liabilities: { debts: assets.debts || 0, expenses: assets.expenses || 0 }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({
    success: false,
    error: 'Method not allowed. Use GET or POST'
  });
};
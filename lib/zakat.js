const nisabData = require('../data/nisab.json');

const CURRENCY_RATES = {
  BDT: 1,
  USD: 0.0091,
  EUR: 0.0083,
  GBP: 0.0072,
  CAD: 0.0123,
  AUD: 0.014,
  INR: 0.76,
  PKR: 2.53,
  SAR: 0.034,
  AED: 0.033,
  MYR: 0.043,
};

const DEFAULT_CURRENCY = (nisabData.currency || 'BDT').toUpperCase();
const ZAKAT_RATE = Number(nisabData.zakat_rate) || 0.025;

const ASSET_FIELDS = ['cash', 'gold', 'silver', 'savings', 'investments', 'business', 'receivables', 'other'];
const LIABILITY_FIELDS = ['debts', 'expenses', 'payables', 'other'];

function toNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return 0;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : NaN;
}

function normalizeGroup(source = {}, fields = []) {
  const normalized = {};
  const invalid = [];

  fields.forEach((field) => {
    const numeric = toNumber(source[field]);
    if (Number.isNaN(numeric) || numeric < 0) {
      invalid.push(field);
      return;
    }
    normalized[field] = numeric;
  });

  return { normalized, invalid };
}

function sumValues(values) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

function convertFromBdt(amount, currency) {
  const rate = CURRENCY_RATES[currency] || CURRENCY_RATES[DEFAULT_CURRENCY] || 1;
  return amount * rate;
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount) + ' ' + currency;
}

function pickLargestCategory(group) {
  return Object.entries(group)
    .sort((a, b) => b[1] - a[1])
    .find(([, value]) => value > 0);
}

function getNisabSnapshot(currency = DEFAULT_CURRENCY) {
  const upperCurrency = String(currency || DEFAULT_CURRENCY).toUpperCase();
  const goldBdt = Number(nisabData.gold?.nisab_value) || 0;
  const silverBdt = Number(nisabData.silver?.nisab_value) || 0;

  return {
    currency: upperCurrency,
    rate_from_bdt: CURRENCY_RATES[upperCurrency] || CURRENCY_RATES[DEFAULT_CURRENCY] || 1,
    gold: {
      grams: Number(nisabData.gold?.nisab_grams) || 87.48,
      value: Number(convertFromBdt(goldBdt, upperCurrency).toFixed(2)),
      value_in_bdt: goldBdt,
      last_updated: nisabData.gold?.last_updated || null,
    },
    silver: {
      grams: Number(nisabData.silver?.nisab_grams) || 612.36,
      value: Number(convertFromBdt(silverBdt, upperCurrency).toFixed(2)),
      value_in_bdt: silverBdt,
      last_updated: nisabData.silver?.last_updated || null,
    },
    zakat_rate: ZAKAT_RATE,
  };
}

function buildInsights({ assets, liabilities, totalAssets, totalLiabilities, netWealth, nisabAmount, currency, zakatAmount, nisabBasis }) {
  const insights = [];

  if (netWealth <= 0) {
    insights.push({
      type: 'warning',
      title: 'Net wealth is zero or negative',
      message: 'Your liabilities currently absorb all eligible assets, so Zakat is not due on this snapshot.',
    });
    return insights;
  }

  if (netWealth < nisabAmount) {
    insights.push({
      type: 'info',
      title: 'Below Nisab threshold',
      message: `You need ${formatMoney(nisabAmount - netWealth, currency)} more to reach the ${nisabBasis} Nisab threshold.`,
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Zakat is due',
      message: `Your payable Zakat is ${formatMoney(zakatAmount, currency)} at ${(ZAKAT_RATE * 100).toFixed(1)}% of net eligible wealth.`,
    });
  }

  if (totalAssets > 0 && totalLiabilities / totalAssets >= 0.3) {
    insights.push({
      type: 'warning',
      title: 'Liabilities are relatively high',
      message: 'A large portion of your assets is offset by liabilities. Double-check what debts are immediately deductible.',
    });
  }

  const largestAsset = pickLargestCategory(assets);
  if (largestAsset) {
    const [field, value] = largestAsset;
    insights.push({
      type: 'tip',
      title: 'Largest asset category',
      message: `${field} is your largest asset bucket at ${formatMoney(value, currency)}.`,
    });
  }

  const largestLiability = pickLargestCategory(liabilities);
  if (largestLiability) {
    const [field, value] = largestLiability;
    insights.push({
      type: 'tip',
      title: 'Largest liability category',
      message: `${field} is your biggest deduction at ${formatMoney(value, currency)}.`,
    });
  }

  return insights;
}

function calculateZakat(input = {}) {
  const currency = String(input.currency || DEFAULT_CURRENCY).toUpperCase();
  const requestedBasis = String(input.nisab_basis || input.nisabBasis || 'gold').toLowerCase();
  const nisabBasis = requestedBasis === 'silver' ? 'silver' : 'gold';

  const assetsInput = input.assets || {};
  const liabilitiesInput = input.liabilities || {};

  const { normalized: assets, invalid: invalidAssets } = normalizeGroup(assetsInput, ASSET_FIELDS);
  const { normalized: liabilities, invalid: invalidLiabilities } = normalizeGroup(liabilitiesInput, LIABILITY_FIELDS);
  const invalidFields = [...invalidAssets, ...invalidLiabilities];

  const totalAssets = sumValues(assets);
  const totalLiabilities = sumValues(liabilities);
  const netWealth = totalAssets - totalLiabilities;

  const nisab = getNisabSnapshot(currency);
  const nisabAmount = nisab[nisabBasis].value;
  const isZakatApplicable = netWealth >= nisabAmount;
  const zakatAmount = isZakatApplicable ? Number((netWealth * ZAKAT_RATE).toFixed(2)) : 0;

  return {
    currency,
    nisab_basis: nisabBasis,
    invalid_fields: invalidFields,
    assets,
    liabilities,
    totals: {
      total_assets: Number(totalAssets.toFixed(2)),
      total_liabilities: Number(totalLiabilities.toFixed(2)),
      net_wealth: Number(netWealth.toFixed(2)),
    },
    nisab,
    calculation: {
      nisab_threshold: nisabAmount,
      is_zakat_applicable: isZakatApplicable,
      zakat_amount: zakatAmount,
      zakat_percentage: ZAKAT_RATE * 100,
    },
    insights: buildInsights({
      assets,
      liabilities,
      totalAssets,
      totalLiabilities,
      netWealth,
      nisabAmount,
      currency,
      zakatAmount,
      nisabBasis,
    }),
  };
}

module.exports = {
  ASSET_FIELDS,
  LIABILITY_FIELDS,
  CURRENCY_RATES,
  DEFAULT_CURRENCY,
  ZAKAT_RATE,
  calculateZakat,
  formatMoney,
  getNisabSnapshot,
};

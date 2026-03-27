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
  SGD: 0.0122,
  QAR: 0.033,
  KWD: 0.0028,
  OMR: 0.0035,
  BHD: 0.0034,
  JPY: 1.37,
  CNY: 0.066,
  HKD: 0.071,
  THB: 0.33,
  IDR: 149.5,
  TRY: 0.29,
  ZAR: 0.17,
  EGP: 0.45,
  NGN: 14.2,
  NOK: 0.098,
  SEK: 0.096,
  DKK: 0.062,
  CHF: 0.008,
  NZD: 0.015,
  BRL: 0.045,
  MXN: 0.15,
  RUB: 0.84,
  KRW: 13.4,
  LKR: 2.72,
  NPR: 1.22,
  BND: 0.0122,
  JOD: 0.0065,
  MAD: 0.091,
  TND: 0.028,
  ILS: 0.033,
  CZK: 0.21,
  PLN: 0.036,
  HUF: 3.27,
  RON: 0.041,
  UAH: 0.38,
  VND: 232.0,
  PHP: 0.52,
  KES: 1.18,
  UZS: 115.0,
  AFN: 0.63,
  ALL: 0.84,
  AMD: 3.62,
  AOA: 8.31,
  ARS: 9.42,
  AWG: 0.082,
  AZN: 0.015,
  BAM: 0.016,
  BBD: 0.018,
  BGN: 0.016,
  BIF: 26.37,
  BMD: 0.0091,
  BOB: 0.063,
  BSD: 0.0091,
  BTN: 0.76,
  BWP: 0.12,
  BYN: 0.03,
  BZD: 0.018,
  CDF: 26.12,
  CLP: 8.62,
  COP: 38.11,
  CRC: 4.61,
  CUP: 0.22,
  CVE: 0.93,
  DJF: 1.62,
  DOP: 0.54,
  DZD: 1.22,
  ERN: 0.14,
  ETB: 1.19,
  FJD: 0.02,
  FKP: 0.0072,
  GEL: 0.025,
  GGP: 0.0072,
  GHS: 0.14,
  GIP: 0.0072,
  GMD: 0.65,
  GNF: 78.44,
  GTQ: 0.07,
  GYD: 1.9,
  HNL: 0.23,
  HTG: 1.19,
  IQD: 11.89,
  IRR: 383.21,
  ISK: 1.29,
  JEP: 0.0072,
  JMD: 1.42,
  KGS: 0.8,
  KHR: 37.29,
  KMF: 4.1,
  KYD: 0.0076,
  KZT: 4.64,
  LAK: 198.91,
  LBP: 814.0,
  LRD: 1.72,
  LSL: 0.17,
  LYD: 0.044,
  MDL: 0.16,
  MGA: 41.33,
  MKD: 0.51,
  MMK: 19.11,
  MNT: 32.27,
  MOP: 0.073,
  MUR: 0.42,
  MVR: 0.14,
  MWK: 15.78,
  MZN: 0.58,
  NAD: 0.17,
  NIO: 0.33,
  PAB: 0.0091,
  PGK: 0.037,
  PYG: 71.6,
  RSD: 0.98,
  RWF: 12.82,
  SBD: 0.077,
  SCR: 0.13,
  SLE: 0.21,
  SLL: 208.91,
  SOS: 5.2,
  SRD: 0.34,
  SSP: 23.59,
  STN: 0.21,
  SVC: 0.079,
  SZL: 0.17,
  TJS: 0.099,
  TMT: 0.032,
  TOP: 0.022,
  TTD: 0.062,
  TWD: 0.3,
  TZS: 24.2,
  UGX: 33.73,
  UYU: 0.38,
  VES: 0.58,
  VUV: 1.09,
  WST: 0.025,
  XAF: 5.46,
  XCD: 0.025,
  XOF: 5.46,
  XPF: 1.0,
  YER: 2.28,
  ZMW: 0.25,
  ZWL: 2.93,
  SYP: 118.3,
  SDG: 5.47,
  MRU: 0.36,
  MRO: 3.26,
  CUC: 0.0091,
  ANG: 0.016,
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

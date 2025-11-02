// Currency configuration for Level 2: Multi-currency accounts without conversion

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string; // Emoji flag (fallback)
  countryCode: string; // ISO 3166-1 alpha-2 country code for flag icons
}

export const CURRENCIES: Currency[] = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль', flag: '🇷🇺', countryCode: 'RU' },
  { code: 'USD', symbol: '$', name: 'Доллар США', flag: '🇺🇸', countryCode: 'US' },
  { code: 'EUR', symbol: '€', name: 'Евро', flag: '🇪🇺', countryCode: 'EU' },
  { code: 'GBP', symbol: '£', name: 'Фунт стерлингов', flag: '🇬🇧', countryCode: 'GB' },
  { code: 'CNY', symbol: '¥', name: 'Китайский юань', flag: '🇨🇳', countryCode: 'CN' },
  { code: 'JPY', symbol: '¥', name: 'Японская иена', flag: '🇯🇵', countryCode: 'JP' },
  { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', flag: '🇰🇿', countryCode: 'KZ' },
  { code: 'UAH', symbol: '₴', name: 'Украинская гривна', flag: '🇺🇦', countryCode: 'UA' },
  { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль', flag: '🇧🇾', countryCode: 'BY' },
  { code: 'GEL', symbol: '₾', name: 'Грузинский лари', flag: '🇬🇪', countryCode: 'GE' },
  { code: 'TRY', symbol: '₺', name: 'Турецкая лира', flag: '🇹🇷', countryCode: 'TR' },
  { code: 'AED', symbol: 'د.إ', name: 'Дирхам ОАЭ', flag: '🇦🇪', countryCode: 'AE' },
  { code: 'THB', symbol: '฿', name: 'Тайский бат', flag: '🇹🇭', countryCode: 'TH' },
];

// Default currency
export const DEFAULT_CURRENCY = 'RUB';

// Helper function to get currency by code
export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}

// Helper function to format amount with currency
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  const symbol = currency?.symbol || currencyCode;

  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

// Helper function to get currency symbol
export function getCurrencySymbol(code: string): string {
  return getCurrency(code)?.symbol || code;
}

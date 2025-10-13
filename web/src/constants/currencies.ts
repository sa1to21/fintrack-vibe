// Currency configuration for Level 2: Multi-currency accounts without conversion

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string; // Emoji flag
}

export const CURRENCIES: Currency[] = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль', flag: '🇷🇺' },
  { code: 'USD', symbol: '$', name: 'Доллар США', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Евро', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'Фунт стерлингов', flag: '🇬🇧' },
  { code: 'CNY', symbol: '¥', name: 'Китайский юань', flag: '🇨🇳' },
  { code: 'JPY', symbol: '¥', name: 'Японская иена', flag: '🇯🇵' },
  { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', flag: '🇰🇿' },
  { code: 'UAH', symbol: '₴', name: 'Украинская гривна', flag: '🇺🇦' },
  { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль', flag: '🇧🇾' },
  { code: 'GEL', symbol: '₾', name: 'Грузинский лари', flag: '🇬🇪' },
  { code: 'TRY', symbol: '₺', name: 'Турецкая лира', flag: '🇹🇷' },
  { code: 'AED', symbol: 'د.إ', name: 'Дирхам ОАЭ', flag: '🇦🇪' },
  { code: 'THB', symbol: '฿', name: 'Тайский бат', flag: '🇹🇭' },
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

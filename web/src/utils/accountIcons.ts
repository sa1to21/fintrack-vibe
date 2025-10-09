import { Wallet, CreditCard, PiggyBank } from "lucide-react";

export const accountIconsMap = {
  cash: { icon: Wallet, name: "Кошелёк", color: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700" },
  card: { icon: CreditCard, name: "Карта", color: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700" },
  savings: { icon: PiggyBank, name: "Накопления", color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700" },
};

export const getAccountIcon = (accountType: string) => {
  return accountIconsMap[accountType as keyof typeof accountIconsMap] || accountIconsMap.cash;
};

export const getAccountIconComponent = (accountType: string) => {
  return getAccountIcon(accountType).icon;
};

export const getAccountIconColor = (accountType: string) => {
  return getAccountIcon(accountType).color;
};

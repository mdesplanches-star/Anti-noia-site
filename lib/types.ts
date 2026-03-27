export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'Pix' | 'Débito' | 'Crédito' | 'Dinheiro' | 'Conta';

export type Person = {
  id: string;
  name: string;
  income: number;
  accent: string;
};

export type CardItem = {
  id: string;
  name: string;
  limit: number;
  used: number;
  billDay: number;
  dueDay: number;
};

export type Goal = {
  id: number;
  title: string;
  target: number;
  saved: number;
};

export type Settings = {
  familyName: string;
  warningLimitPercent: number;
  notifications: boolean;
  allowInstallHint: boolean;
};

export type Transaction = {
  id: number;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  person: string;
  method: PaymentMethod;
  cardId?: string;
  date: string;
  notes?: string;
};

export type AppState = {
  transactions: Transaction[];
  goals: Goal[];
  settings: Settings;
};

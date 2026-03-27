import type { CardItem, Goal, Person, Settings, Transaction } from '@/lib/types';

export const STORAGE_KEY = 'anti-noia-finance-next';

export const people: Person[] = [
  { id: 'myhaylow', name: 'Myhaylow', income: 4200, accent: 'blue' },
  { id: 'luciana', name: 'Luciana', income: 3900, accent: 'violet' },
];

export const cards: CardItem[] = [
  { id: 'card1', name: 'Cartão Principal', limit: 3100, used: 1860, billDay: 10, dueDay: 17 },
  { id: 'card2', name: 'Cartão Secundário', limit: 1800, used: 940, billDay: 12, dueDay: 20 },
  { id: 'card3', name: 'card3', limit: 1200, used: 720, billDay: 5, dueDay: 15 },
];

export const categories = ['Moradia', 'Casa', 'Pessoal', 'Mobilidade', 'Lazer', 'Saúde', 'Mercado', 'Renda', 'Outros'];
export const methods = ['Pix', 'Débito', 'Crédito', 'Dinheiro', 'Conta'] as const;

export const initialGoals: Goal[] = [
  { id: 1, title: 'Reserva', target: 5000, saved: 1600 },
  { id: 2, title: 'Viagem', target: 3000, saved: 800 },
];

export const initialSettings: Settings = {
  familyName: 'Anti Noia Finance',
  warningLimitPercent: 80,
  notifications: true,
  allowInstallHint: true,
};

export const initialTransactions: Transaction[] = [
  { id: 1, type: 'expense', description: 'Condomínio', amount: 550, category: 'Moradia', person: 'myhaylow', method: 'Pix', date: '2026-03-05', notes: 'Despesa fixa' },
  { id: 2, type: 'expense', description: 'Luz', amount: 250, category: 'Casa', person: 'luciana', method: 'Pix', date: '2026-03-08', notes: 'Conta mensal' },
  { id: 3, type: 'expense', description: 'Internet', amount: 110, category: 'Casa', person: 'myhaylow', method: 'Débito', date: '2026-03-10', notes: 'Plano residencial' },
  { id: 4, type: 'expense', description: 'Unhas Luciana', amount: 280, category: 'Pessoal', person: 'luciana', method: 'Crédito', cardId: 'card2', date: '2026-03-11', notes: 'Cuidado pessoal' },
  { id: 5, type: 'expense', description: 'Barbeiro', amount: 70, category: 'Pessoal', person: 'myhaylow', method: 'Pix', date: '2026-03-12', notes: 'Corte do mês' },
  { id: 6, type: 'expense', description: 'Estacionamento Centro', amount: 730, category: 'Mobilidade', person: 'myhaylow', method: 'Crédito', cardId: 'card1', date: '2026-03-14', notes: 'Fixo' },
  { id: 7, type: 'income', description: 'Salário Myhaylow', amount: 4200, category: 'Renda', person: 'myhaylow', method: 'Conta', date: '2026-03-01', notes: 'Recebimento' },
  { id: 8, type: 'income', description: 'Salário Luciana', amount: 3900, category: 'Renda', person: 'luciana', method: 'Conta', date: '2026-03-01', notes: 'Recebimento' },
  { id: 9, type: 'expense', description: 'Combustível', amount: 320, category: 'Mobilidade', person: 'myhaylow', method: 'Crédito', cardId: 'card3', date: '2026-03-18', notes: 'Abastecimento' },
  { id: 10, type: 'expense', description: 'Celular Luciana', amount: 45, category: 'Casa', person: 'luciana', method: 'Pix', date: '2026-03-19', notes: 'Telefone' },
];

export const months = [
  { value: '2026-03', label: 'Março 2026' },
  { value: '2026-04', label: 'Abril 2026' },
  { value: '2026-05', label: 'Maio 2026' },
];

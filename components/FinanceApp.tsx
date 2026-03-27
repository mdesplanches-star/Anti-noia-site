'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CreditCard,
  Home,
  Pencil,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
  Target,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { cards, categories, initialGoals, initialSettings, initialTransactions, methods, months, people, STORAGE_KEY } from '@/lib/data';
import type { AppState, Goal, Settings as SettingsType, Transaction } from '@/lib/types';
import { getPersonName, loadState, money, pct, saveState } from '@/lib/utils';
import { Card, Pill, ProgressBar, SectionTitle } from '@/components/ui';

type ViewKey = 'dashboard' | 'lancamentos' | 'cartoes' | 'metas' | 'config';

type FormState = {
  id: number | null;
  type: 'income' | 'expense';
  description: string;
  amount: string;
  category: string;
  person: string;
  method: (typeof methods)[number];
  cardId: string;
  date: string;
  notes: string;
};

function buildEmptyForm(month: string): FormState {
  return {
    id: null,
    type: 'expense',
    description: '',
    amount: '',
    category: 'Outros',
    person: 'myhaylow',
    method: 'Pix',
    cardId: '',
    date: `${month}-20`,
    notes: '',
  };
}

export default function FinanceApp() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [settings, setSettings] = useState<SettingsType>(initialSettings);
  const [search, setSearch] = useState('');
  const [filterPerson, setFilterPerson] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showOnlyWarnings, setShowOnlyWarnings] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState<FormState>(buildEmptyForm('2026-03'));

  useEffect(() => {
    const saved = loadState<AppState>(STORAGE_KEY);
    if (!saved) return;
    setTransactions(saved.transactions ?? initialTransactions);
    setGoals(saved.goals ?? initialGoals);
    setSettings(saved.settings ?? initialSettings);
  }, []);

  useEffect(() => {
    saveState(STORAGE_KEY, { transactions, goals, settings });
  }, [transactions, goals, settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);

  const monthlyTransactions = useMemo(
    () => transactions.filter((item) => item.date.startsWith(selectedMonth)),
    [transactions, selectedMonth],
  );

  const filteredTransactions = useMemo(() => {
    return monthlyTransactions
      .filter((item) => (filterPerson === 'all' ? true : item.person === filterPerson))
      .filter((item) => (filterType === 'all' ? true : item.type === filterType))
      .filter((item) => {
        const text = `${item.description} ${item.category} ${item.notes ?? ''}`.toLowerCase();
        return text.includes(search.toLowerCase());
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [monthlyTransactions, filterPerson, filterType, search]);

  const metrics = useMemo(() => {
    const income = monthlyTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthlyTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
      byPerson: people.map((person) => {
        const personIncome = monthlyTransactions.filter((t) => t.person === person.id && t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const personExpense = monthlyTransactions.filter((t) => t.person === person.id && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return {
          ...person,
          personIncome,
          personExpense,
          personBalance: personIncome - personExpense,
        };
      }),
      categories: categories
        .filter((c) => c !== 'Renda')
        .map((category) => ({
          category,
          total: monthlyTransactions
            .filter((t) => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0),
        }))
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total),
    };
  }, [monthlyTransactions]);

  const cardStats = useMemo(() => {
    return cards
      .map((card) => {
        const cardSpent = monthlyTransactions
          .filter((t) => t.type === 'expense' && t.method === 'Crédito' && t.cardId === card.id)
          .reduce((sum, t) => sum + t.amount, 0);
        const used = Math.max(card.used, cardSpent);
        const usage = pct(used, card.limit);
        return { ...card, name: card.name === 'card3' ? 'Cartão Combustível' : card.name, used, usage, warning: usage >= settings.warningLimitPercent };
      })
      .filter((card) => (showOnlyWarnings ? card.warning : true));
  }, [monthlyTransactions, showOnlyWarnings, settings.warningLimitPercent]);

  function openNew() {
    setForm(buildEmptyForm(selectedMonth));
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setForm(buildEmptyForm(selectedMonth));
  }

  function submitForm(event: React.FormEvent) {
    event.preventDefault();
    const amount = Number(form.amount.replace(',', '.'));
    if (!form.description.trim() || !amount) {
      setToast('Preencha descrição e valor.');
      return;
    }

    const payload: Transaction = {
      id: form.id ?? Date.now(),
      type: form.type,
      description: form.description.trim(),
      amount,
      category: form.type === 'income' ? 'Renda' : form.category,
      person: form.person,
      method: form.method,
      cardId: form.method === 'Crédito' ? form.cardId : undefined,
      date: form.date,
      notes: form.notes,
    };

    setTransactions((current) => {
      if (form.id) return current.map((item) => (item.id === form.id ? payload : item));
      return [payload, ...current];
    });
    setToast(form.id ? 'Lançamento atualizado.' : 'Lançamento salvo.');
    closeDrawer();
  }

  function editItem(item: Transaction) {
    setForm({
      id: item.id,
      type: item.type,
      description: item.description,
      amount: String(item.amount),
      category: item.category === 'Renda' ? 'Outros' : item.category,
      person: item.person,
      method: item.method,
      cardId: item.cardId ?? '',
      date: item.date,
      notes: item.notes ?? '',
    });
    setDrawerOpen(true);
  }

  function removeItem(id: number) {
    setTransactions((current) => current.filter((item) => item.id !== id));
    setToast('Lançamento removido.');
  }

  function updateGoal(id: number, delta: number) {
    setGoals((current) => current.map((goal) => (goal.id === id ? { ...goal, saved: Math.max(0, goal.saved + delta) } : goal)));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <NavButton label="Dashboard" icon={<Home size={18} />} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavButton label="Lançamentos" icon={<Receipt size={18} />} active={activeView === 'lancamentos'} onClick={() => setActiveView('lancamentos')} />
          <NavButton label="Cartões" icon={<BellRing size={18} />} active={activeView === 'cartoes'} onClick={() => setActiveView('cartoes')} />
          <NavButton label="Metas" icon={<Target size={18} />} active={activeView === 'metas'} onClick={() => setActiveView('metas')} />
          <NavButton label="Config" icon={<Settings size={18} />} active={activeView === 'config'} onClick={() => setActiveView('config')} />
        </div>
      </aside>

      <main className="main-area">
        <section className="hero">
          <div>
            <Pill>Site/app financeiro familiar</Pill>
            <h1>{settings.familyName}</h1>
            <p>Painel pronto para publicação com visual de app, edição de lançamentos, metas, alertas de cartão e persistência local.</p>
          </div>
          <div className="hero-metrics">
            <MetricCard title="Saldo do mês" value={money(metrics.balance)} highlight={metrics.balance >= 0} icon={<Wallet size={18} />} />
            <MetricCard title="Receitas" value={money(metrics.income)} highlight icon={<PiggyBank size={18} />} />
          </div>
        </section>

        <section className="topbar card">
          <div className="topbar-left">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {months.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <button className="button primary" onClick={openNew}><Plus size={16} /> Novo lançamento</button>
            <button className="button" onClick={() => setToast(`Fechamento simbólico de ${months.find((m) => m.value === selectedMonth)?.label} concluído.`)}>Fechar mês</button>
          </div>
          <div className="install-box">Deploy-ready • PWA base • Next.js</div>
        </section>

        <section className="metric-grid">
          <MetricCard title="Saídas" value={money(metrics.expenses)} icon={<Wallet size={18} />} />
          <MetricCard title="Lançamentos" value={String(monthlyTransactions.length)} icon={<Receipt size={18} />} />
          <MetricCard title="Cartões em alerta" value={String(cardStats.filter((card) => card.warning).length)} icon={<AlertTriangle size={18} />} />
          <MetricCard title="Pessoas" value={String(people.length)} icon={<Home size={18} />} />
        </section>

        {activeView === 'dashboard' && (
          <section className="grid-two">
            <Card>
              <SectionTitle title="Visão por pessoa" subtitle="Receitas e despesas separadas" />
              <div className="stack">
                {metrics.byPerson.map((person) => (
                  <div key={person.id} className="person-box">
                    <div className="row-between">
                      <strong>{person.name}</strong>
                      <Pill tone={person.personBalance >= 0 ? 'good' : 'warn'}>{money(person.personBalance)}</Pill>
                    </div>
                    <div className="mini-grid">
                      <MiniStat label="Receitas" value={money(person.personIncome)} />
                      <MiniStat label="Despesas" value={money(person.personExpense)} />
                      <MiniStat label="Saldo" value={money(person.personBalance)} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle title="Categorias pesadas" subtitle="Onde o mês está sangrando mais" />
              <div className="stack">
                {metrics.categories.map((item) => (
                  <div key={item.category}>
                    <div className="row-between small-gap"><span>{item.category}</span><span>{money(item.total)}</span></div>
                    <ProgressBar value={pct(item.total, metrics.expenses)} />
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {activeView === 'lancamentos' && (
          <Card>
            <SectionTitle title="Histórico" subtitle="Filtro, edição e exclusão" />
            <div className="filters-row">
              <input placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)}>
                <option value="all">Todas as pessoas</option>
                {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">Todos os tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
            </div>
            <div className="stack">
              {filteredTransactions.map((item) => (
                <div key={item.id} className="transaction-row">
                  <div>
                    <div className="row-wrap"><strong>{item.description}</strong><Pill>{getPersonName(item.person, people)}</Pill><Pill>{item.category}</Pill></div>
                    <p>{new Date(item.date).toLocaleDateString('pt-BR')} • {item.method}{item.notes ? ` • ${item.notes}` : ''}</p>
                  </div>
                  <div className="transaction-actions">
                    <span className={item.type === 'income' ? 'amount good' : 'amount bad'}>{item.type === 'income' ? '+' : '-'}{money(item.amount)}</span>
                    <button className="icon-button" onClick={() => editItem(item)} aria-label="Editar"><Pencil size={16} /></button>
                    <button className="icon-button danger" onClick={() => removeItem(item.id)} aria-label="Excluir"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeView === 'cartoes' && (
          <>
            <div className="filter-toggle card">
              <label>
                <input type="checkbox" checked={showOnlyWarnings} onChange={(e) => setShowOnlyWarnings(e.target.checked)} />
                Somente cartões em alerta
              </label>
            </div>
            <section className="metric-grid">
              {cardStats.map((card) => (
                <Card key={card.id}>
                  <SectionTitle title={card.name} subtitle={`Fecha dia ${card.billDay} • Vence dia ${card.dueDay}`} />
                  <div className="stack">
                    <div className="big-number">{money(card.used)} <span>de {money(card.limit)}</span></div>
                    <ProgressBar value={card.usage} />
                    <div className="row-between"><span>Uso do limite</span><span>{card.usage}%</span></div>
                    {card.warning ? <Pill tone="warn">Passou de {settings.warningLimitPercent}%</Pill> : <Pill tone="good">Limite saudável</Pill>}
                  </div>
                </Card>
              ))}
            </section>
          </>
        )}

        {activeView === 'metas' && (
          <section className="grid-two">
            <Card>
              <SectionTitle title="Metas" subtitle="Empurrões rápidos para poupar" />
              <div className="stack">
                {goals.map((goal) => (
                  <div key={goal.id} className="goal-row">
                    <div className="row-between"><strong>{goal.title}</strong><span>{money(goal.saved)} / {money(goal.target)}</span></div>
                    <ProgressBar value={pct(goal.saved, goal.target)} />
                    <div className="button-row">
                      <button className="button" onClick={() => updateGoal(goal.id, 100)}>+100</button>
                      <button className="button" onClick={() => updateGoal(goal.id, 500)}>+500</button>
                      <button className="button danger" onClick={() => updateGoal(goal.id, -100)}>-100</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle title="Leitura do mês" subtitle="Diagnóstico rápido" />
              <div className="stack">
                <div className="insight-box">Saldo atual: <strong>{money(metrics.balance)}</strong></div>
                <div className="insight-box">Melhor caminho: reforçar reserva, reduzir uso do cartão mais pressionado e só depois abrir espaço para gasto flexível.</div>
              </div>
            </Card>
          </section>
        )}

        {activeView === 'config' && (
          <section className="grid-two">
            <Card>
              <SectionTitle title="Configurações" subtitle="Personaliza o painel" />
              <div className="stack">
                <label className="field">
                  <span>Nome do painel</span>
                  <input value={settings.familyName} onChange={(e) => setSettings({ ...settings, familyName: e.target.value })} />
                </label>
                <label className="field">
                  <span>Alerta do cartão (%)</span>
                  <input type="number" value={settings.warningLimitPercent} onChange={(e) => setSettings({ ...settings, warningLimitPercent: Number(e.target.value || 80) })} />
                </label>
              </div>
            </Card>
            <Card>
              <SectionTitle title="Deploy" subtitle="O que já está pronto" />
              <ul className="deploy-list">
                <li>Projeto Next.js com App Router</li>
                <li>Manifesto PWA e service worker básico</li>
                <li>Persistência local no navegador</li>
                <li>Visual responsivo pronto para Vercel</li>
              </ul>
            </Card>
          </section>
        )}
      </main>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <div>
                <h2>{form.id ? 'Editar lançamento' : 'Novo lançamento'}</h2>
                <p>Registro rápido e sem labirinto.</p>
              </div>
              <button className="icon-button" onClick={closeDrawer}><X size={16} /></button>
            </div>
            <form className="stack" onSubmit={submitForm}>
              <div className="field-grid">
                <label className="field"><span>Tipo</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as FormState['type'] })}><option value="expense">Despesa</option><option value="income">Receita</option></select></label>
                <label className="field"><span>Data</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              </div>
              <label className="field"><span>Descrição</span><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              <div className="field-grid">
                <label className="field"><span>Valor</span><input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
                <label className="field"><span>Responsável</span><select value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })}>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
              </div>
              {form.type === 'expense' && (
                <div className="field-grid">
                  <label className="field"><span>Categoria</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.filter((c) => c !== 'Renda').map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                  <label className="field"><span>Forma</span><select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as FormState['method'] })}>{methods.map((method) => <option key={method} value={method}>{method}</option>)}</select></label>
                </div>
              )}
              {form.type === 'expense' && form.method === 'Crédito' && (
                <label className="field"><span>Cartão</span><select value={form.cardId} onChange={(e) => setForm({ ...form, cardId: e.target.value })}><option value="">Escolha</option>{cards.map((card) => <option key={card.id} value={card.id}>{card.name === 'card3' ? 'Cartão Combustível' : card.name}</option>)}</select></label>
              )}
              <label className="field"><span>Observações</span><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} /></label>
              <div className="button-row">
                <button className="button primary" type="submit">Salvar</button>
                <button className="button" type="button" onClick={closeDrawer}>Cancelar</button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {toast && settings.notifications && <div className="toast">{toast}</div>}
    </div>
  );
}

function MetricCard({ title, value, highlight = false, icon }: { title: string; value: string; highlight?: boolean; icon: React.ReactNode }) {
  return (
    <Card>
      <div className="metric-card">
        <div>
          <p>{title}</p>
          <strong className={highlight ? 'good' : ''}>{value}</strong>
        </div>
        <div className="metric-icon">{icon}</div>
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function NavButton({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav-button ${active ? 'active' : ''}`} onClick={onClick} title={label}>
      {icon}
    </button>
  );
}

import { useState } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { BudgetCard } from './BudgetCard';
import { GoalCard } from './GoalCard';
import { FloatingActionButton } from './FloatingActionButton';
import { ActionSheet } from './ActionSheet';
import { IncomeWizard } from './IncomeWizard';
import { TransferSheet } from './TransferSheet';
import { EmptyState } from './EmptyState';
import { useBudget } from '@/hooks/useBudget';
import { User, Target, CalendarClock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SheetType = 'actions' | 'income' | 'transfer' | 'goal' | 'periodic' | null;
type TabType = 'overview' | 'goals' | 'periodic';

export function Dashboard() {
  const budget = useBudget();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleAction = (action: 'income' | 'transfer' | 'goal' | 'periodic') => {
    setActiveSheet(action);
  };

  const handleIncomeSubmit = (data: {
    amount: number;
    includesGas: boolean;
    distribution: { fixed: number; savings: number; variable: number };
  }) => {
    budget.addIncome(
      {
        date: new Date(),
        concept: data.includesGas ? 'Nómina + Gasolina' : 'Nómina',
        amount: data.amount,
        includesGas: data.includesGas,
      },
      data.distribution
    );
    setActiveSheet(null);
  };

  const handleTransfer = (fromId: string, toId: string, amount: number) => {
    budget.transferBetweenCategories(fromId, toId, amount);
  };

  const upcomingExpenses = budget.periodicExpenses
    .filter(e => e.currentAmount < e.targetAmount)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 2);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">Hola, <span className="text-foreground font-medium">Usuario</span></p>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Hero Balance */}
        <div className="text-center animate-fade-in">
          <p className="text-label mb-2">Disponible</p>
          <h1 className="text-display">
            {formatCurrency(budget.totalBalance)}
          </h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 p-1 bg-muted rounded-2xl">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'goals', label: 'Metas' },
            { id: 'periodic', label: 'Periódicos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-background shadow-soft text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Budget Pillars */}
            <section>
              <h2 className="text-label mb-4">Presupuesto</h2>
              <div className="space-y-3">
                {budget.categories.map(category => (
                  <BudgetCard
                    key={category.id}
                    category={category}
                    totalBudget={budget.totalBalance}
                    onClick={() => setActiveSheet('transfer')}
                  />
                ))}
              </div>
            </section>

            {/* Upcoming Periodic Expenses */}
            {upcomingExpenses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-label">Próximos Vencimientos</h2>
                  <button 
                    onClick={() => setActiveTab('periodic')}
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {upcomingExpenses.map(expense => (
                    <GoalCard
                      key={expense.id}
                      item={expense}
                      type="periodic"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-label">Metas de Ahorro</h2>
              <span className="text-xs text-muted-foreground">
                Del 30% (Futuro)
              </span>
            </div>
            
            {budget.goals.length > 0 ? (
              <div className="space-y-3">
                {budget.goals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    item={goal}
                    type="goal"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="Aún no hay metas"
                description="Diseñemos tu futuro. Crea tu primera meta de ahorro."
              />
            )}
          </div>
        )}

        {activeTab === 'periodic' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-label">Gastos Periódicos</h2>
              <span className="text-xs text-muted-foreground">
                Sinking Funds
              </span>
            </div>
            
            {budget.periodicExpenses.length > 0 ? (
              <div className="space-y-3">
                {budget.periodicExpenses.map(expense => (
                  <GoalCard
                    key={expense.id}
                    item={expense}
                    type="periodic"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Sin gastos periódicos"
                description="Anticipa tus gastos grandes. Universidad, mantenimiento, seguros..."
              />
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <FloatingActionButton onClick={() => setActiveSheet('actions')} />

      {/* Sheets */}
      {activeSheet === 'actions' && (
        <ActionSheet
          onClose={() => setActiveSheet(null)}
          onAction={handleAction}
        />
      )}

      {activeSheet === 'income' && (
        <IncomeWizard
          onClose={() => setActiveSheet(null)}
          onSubmit={handleIncomeSubmit}
        />
      )}

      {activeSheet === 'transfer' && (
        <TransferSheet
          categories={budget.categories}
          onClose={() => setActiveSheet(null)}
          onTransfer={handleTransfer}
        />
      )}
    </div>
  );
}

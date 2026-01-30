import { useState } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { BudgetCard } from './BudgetCard';
import { GoalCard } from './GoalCard';
import { ActionSheet } from './ActionSheet';
import { IncomeWizard } from './IncomeWizard';
import { TransferSheet } from './TransferSheet';
import { EmptyState } from './EmptyState';
import { useBudget } from '@/hooks/useBudget';
import { 
  User, Target, CalendarClock, ChevronRight, Plus, 
  LayoutDashboard, Wallet, ArrowRightLeft, History,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type SheetType = 'actions' | 'income' | 'transfer' | 'goal' | 'periodic' | null;
type TabType = 'overview' | 'goals' | 'periodic' | 'history';

const navItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'periodic', label: 'Periódicos', icon: CalendarClock },
  { id: 'history', label: 'Historial', icon: History },
];

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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-shrink-0 hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold tracking-tight">
            Mi<span className="text-savings">Nómina</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button 
            onClick={() => setActiveSheet('income')}
            className="w-full justify-start gap-3"
            variant="outline"
          >
            <Wallet className="w-4 h-4" />
            Registrar Quincena
          </Button>
          <Button 
            onClick={() => setActiveSheet('transfer')}
            className="w-full justify-start gap-3"
            variant="ghost"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transferir
          </Button>
        </div>

        {/* User */}
        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Usuario</p>
              <p className="text-xs text-muted-foreground">Mi cuenta</p>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">
              Mi<span className="text-savings">Nómina</span>
            </h1>
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden px-6 py-4 border-b border-border overflow-x-auto">
          <div className="flex gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
              {/* Hero Balance */}
              <div className="card-soft p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <p className="text-label mb-2">Balance Total Disponible</p>
                    <h2 className="text-4xl lg:text-5xl font-light tracking-tight">
                      {formatCurrency(budget.totalBalance)}
                    </h2>
                    <p className="text-caption mt-2">
                      Última actualización: Hoy, {new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setActiveSheet('income')} size="lg" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Registrar Quincena
                    </Button>
                    <Button onClick={() => setActiveSheet('transfer')} variant="outline" size="lg" className="gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      Transferir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Budget Pillars - Grid for desktop */}
              <section>
                <h2 className="text-label mb-4">Distribución del Presupuesto</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Two Column Layout for Goals and Periodic */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Goals Summary */}
                <section className="card-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-title">Metas de Ahorro</h2>
                    <button 
                      onClick={() => setActiveTab('goals')}
                      className="text-sm font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Ver todas <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {budget.goals.length > 0 ? (
                    <div className="space-y-3">
                      {budget.goals.slice(0, 2).map(goal => (
                        <GoalCard key={goal.id} item={goal} type="goal" />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Target}
                      title="Sin metas aún"
                      description="Crea tu primera meta de ahorro"
                    />
                  )}
                </section>

                {/* Upcoming Periodic Expenses */}
                <section className="card-soft p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-title">Próximos Vencimientos</h2>
                    <button 
                      onClick={() => setActiveTab('periodic')}
                      className="text-sm font-medium text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Ver todos <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {upcomingExpenses.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingExpenses.map(expense => (
                        <GoalCard key={expense.id} item={expense} type="periodic" />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={CalendarClock}
                      title="Sin vencimientos"
                      description="No hay gastos próximos"
                    />
                  )}
                </section>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-headline">Metas de Ahorro</h2>
                  <p className="text-caption">Subdivisión del 30% (Futuro)</p>
                </div>
                <Button onClick={() => setActiveSheet('goal')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Meta
                </Button>
              </div>
              
              {budget.goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budget.goals.map(goal => (
                    <GoalCard key={goal.id} item={goal} type="goal" />
                  ))}
                </div>
              ) : (
                <div className="card-soft">
                  <EmptyState
                    icon={Target}
                    title="Aún no hay metas"
                    description="Diseñemos tu futuro. Crea tu primera meta de ahorro."
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'periodic' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-headline">Gastos Periódicos</h2>
                  <p className="text-caption">Sinking Funds - Anticipa gastos grandes</p>
                </div>
                <Button onClick={() => setActiveSheet('periodic')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Gasto
                </Button>
              </div>
              
              {budget.periodicExpenses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budget.periodicExpenses.map(expense => (
                    <GoalCard key={expense.id} item={expense} type="periodic" />
                  ))}
                </div>
              ) : (
                <div className="card-soft">
                  <EmptyState
                    icon={CalendarClock}
                    title="Sin gastos periódicos"
                    description="Anticipa tus gastos grandes. Universidad, mantenimiento, seguros..."
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-headline">Historial de Ingresos</h2>
                  <p className="text-caption">Registro de todas tus quincenas</p>
                </div>
              </div>
              
              {budget.incomeHistory.length > 0 ? (
                <div className="card-soft divide-y divide-border">
                  {budget.incomeHistory.map(income => (
                    <div key={income.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-savings-light flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-savings" />
                        </div>
                        <div>
                          <p className="font-medium">{income.concept}</p>
                          <p className="text-caption">
                            {income.date.toLocaleDateString('es-DO', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-savings">
                        +{formatCurrency(income.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-soft">
                  <EmptyState
                    icon={History}
                    title="Sin historial"
                    description="Aquí aparecerán tus quincenas registradas"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile FAB */}
        <div className="lg:hidden fixed bottom-6 right-6">
          <button
            onClick={() => setActiveSheet('actions')}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-fab hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </main>

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

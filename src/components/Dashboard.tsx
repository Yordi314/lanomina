import { useState } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';
import { BudgetCard } from './BudgetCard';
import { GoalCard } from './GoalCard';
import { ActionSheet } from './ActionSheet';
import { IncomeWizard } from './IncomeWizard';
import { TransferSheet } from './TransferSheet';
import { EmptyState } from './EmptyState';
import { GoalFormModal } from './GoalFormModal';
import { PeriodicExpenseFormModal } from './PeriodicExpenseFormModal';
import { ExpenseFormModal } from './ExpenseFormModal';
import { LoanFormModal } from './LoanFormModal';
import { SurplusCard } from './SurplusCard';
import { ExternalIncomeModal } from './ExternalIncomeModal';
import { IncomeEditModal } from './IncomeEditModal';
import { FixedBillsSection } from './FixedBillsSection';
import { LoansSection } from './LoansSection';
import { TransactionHistory } from './TransactionHistory';

import { GasCard } from './GasCard';
import { SettingsSheet } from './SettingsSheet';
import { useBudget, Goal, PeriodicExpense, Loan, Expense, Income } from '@/hooks/useBudget';
import {
  User, Target, CalendarClock, ChevronRight, Plus,
  LayoutDashboard, Wallet, ArrowRightLeft, History,
  Settings, Receipt, Home, CreditCard, Menu, Loader2, LogOut,
  Pencil, Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MobileNavSheet } from './MobileNavSheet';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';



type SheetType = 'actions' | 'income' | 'transfer' | 'settings' | 'external-income' | null;
type ModalType = 'goal' | 'periodic' | 'expense' | 'loan' | 'income-edit' | null;
type TabType = 'overview' | 'goals' | 'periodic' | 'fixed-bills' | 'loans' | 'history' | 'transactions';

const navItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'fixed-bills', label: 'Facturas Fijas', icon: Home },
  { id: 'loans', label: 'Préstamos', icon: CreditCard },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'periodic', label: 'Periódicos', icon: CalendarClock },
  { id: 'transactions', label: 'Movimientos', icon: Receipt },
  { id: 'history', label: 'Ingresos', icon: History },
];

export function Dashboard() {
  const { signOut } = useAuth();
  const budget = useBudget();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<PeriodicExpense | null>(null);

  // New States for Editing
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  const [externalIncomeCategory, setExternalIncomeCategory] = useState<string | undefined>(undefined);

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fixedCategory = budget.categories.find(c => c.slug === 'fixed');
  const surplus = budget.getFixedSurplus();

  if (budget.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fixedCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Configurando tu cuenta...</p>
      </div>
    );
  }

  const handleAction = (action: 'income' | 'transfer' | 'goal' | 'periodic' | 'expense' | 'loan' | 'external-income') => {
    if (action === 'goal' || action === 'periodic' || action === 'expense' || action === 'loan') {
      setActiveSheet(null);
      setActiveModal(action);
    } else {
      setActiveSheet(action);
    }
  };

  const handleAddFunds = (categoryId: string) => {
    setExternalIncomeCategory(categoryId);
    setActiveSheet('external-income');
  };

  const handleGasCardClick = () => {
    setSelectedTransaction(null); // Clear edit state
    setActiveModal('expense');
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

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setActiveModal('goal');
  };

  const handleExpenseClick = (expense: PeriodicExpense) => {
    setSelectedExpense(expense);
    setActiveModal('periodic');
  };

  const handleCloseGoalModal = () => {
    setActiveModal(null);
    setSelectedGoal(null);
  };

  const handleCloseExpenseModal = () => {
    setActiveModal(null);
    setSelectedExpense(null);
  };

  const handleCloseLoanModal = () => {
    setActiveModal(null);
    setSelectedLoan(null);
  }

  const handleMoveSurplus = (toCategory: 'savings' | 'variable') => {
    if (surplus > 0) {
      budget.transferBetweenCategories(fixedCategory.id, toCategory === 'savings' ? budget.categories.find(c => c.slug === 'savings')!.id : budget.categories.find(c => c.slug === 'variable')!.id, surplus);
    }
  };

  // Transaction Edit Handlers
  const handleEditTransaction = (expense: Expense) => {
    setSelectedTransaction(expense);
    setActiveModal('expense');
  };

  const handleCloseTransactionModal = () => {
    setActiveModal(null);
    setSelectedTransaction(null);
  };

  // Income Edit Handlers
  const handleEditIncome = (income: Income) => {
    setSelectedIncome(income);
    setActiveModal('income-edit');
  };

  const handleCloseIncomeModal = () => {
    setActiveModal(null);
    setSelectedIncome(null);
  }

  const upcomingExpenses = budget.periodicExpenses
    .filter(e => e.currentAmount < e.targetAmount)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 2);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-semibold tracking-tight">
            Mi<span className="text-savings">Nómina</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto no-scrollbar">
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
            onClick={() => { setSelectedTransaction(null); setActiveModal('expense'); }}
            className="w-full justify-start gap-3"
            variant="default"
          >
            <Receipt className="w-4 h-4" />
            Registrar Gasto
          </Button>
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

        {/* User / Settings */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setActiveSheet('settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Configuración</p>
              <p className="text-xs text-muted-foreground">Gestionar datos</p>
            </div>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors group text-destructive hover:text-destructive"
          >
            <div className="w-9 h-9 rounded-full bg-destructive/10 group-hover:bg-destructive/20 flex items-center justify-center transition-colors">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Cerrar Sesión</p>
              <p className="text-xs text-muted-foreground/80">Salir de la cuenta</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto no-scrollbar">
        {/* Mobile Header */}
        <header className="lg:hidden px-6 pt-6 pb-4 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="p-2 -ml-2 rounded-full hover:bg-muted"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold">
                Mi<span className="text-savings">Nómina</span>
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSheet('settings')}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => signOut()}
                className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 text-destructive" />
              </button>
            </div>
          </div>
        </header>

        <MobileNavSheet
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          items={navItems}
          activeTab={activeTab}
          onTabChange={(tab: string) => setActiveTab(tab as TabType)}
        />


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
                      {budget.incomeHistory.length > 0
                        ? `Última actualización: ${budget.incomeHistory[0].date.toLocaleDateString('es-DO')}`
                        : 'Registra tu primera quincena para comenzar'
                      }
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => { setSelectedTransaction(null); setActiveModal('expense'); }} size="lg" className="gap-2">
                      <Receipt className="w-4 h-4" />
                      Registrar Gasto
                    </Button>
                    <Button onClick={() => setActiveSheet('income')} variant="outline" size="lg" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Quincena
                    </Button>
                    <Button onClick={() => setActiveSheet('transfer')} variant="ghost" size="lg" className="gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      Transferir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Surplus Opportunity Card */}
              {surplus > 0 && (budget.fixedBills.length > 0 || budget.loans.length > 0) && (
                <SurplusCard
                  surplusAmount={surplus}
                  onMoveToSavings={() => handleMoveSurplus('savings')}
                  onMoveToVariable={() => handleMoveSurplus('variable')}
                />
              )}





              {/* Budget Pillars - Grid for desktop */}
              <section>
                <h2 className="text-label mb-4">Distribución del Presupuesto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Gas Card Integrated */}
                  {/* Gas Card Integrated */}
                  <GasCard
                    available={budget.gasAvailable}
                    spent={budget.totalGasExpenses}
                    totalIncome={budget.totalGasIncome}
                    onClick={handleGasCardClick}
                  />

                  {budget.categories.map(category => (
                    <BudgetCard
                      key={category.id}
                      category={category}
                      totalBudget={budget.totalBalance}
                      availableAmount={category.slug === 'fixed' ? budget.getFixedSurplus() : undefined}
                      onClick={() => setActiveSheet('transfer')}
                      onAddFunds={category.slug === 'savings' ? () => handleAddFunds(category.id) : undefined}
                    />
                  ))}
                </div>
              </section>

              {/* Loans Summary Mini-Card (Optional or Integrated) */}
              {budget.loans.length > 0 && (
                <section className="card-soft p-6 bg-blue-50/20 border-blue-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-900">Préstamos Activos</h3>
                        <p className="text-xs text-blue-700/80">Compromiso total: {formatCurrency(budget.getTotalLoansPayment())} / quincena</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('loans')}>Ver detalles</Button>
                  </div>
                </section>
              )}

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
                      {budget.goals.slice(0, 2).map(goal => {
                        // Dynamic Calculation: Goal Amount = Savings * Percentage
                        const savingsCategory = budget.categories.find(c => c.slug === 'savings');
                        const totalSavings = savingsCategory ? savingsCategory.amount : 0;
                        const dynamicAmount = (totalSavings * goal.allocationPercentage) / 100;

                        return (
                          <GoalCard
                            key={goal.id}
                            item={{ ...goal, currentAmount: dynamicAmount }}
                            type="goal"
                            onClick={() => handleGoalClick(goal)}
                          />
                        );
                      })}
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
                        <GoalCard
                          key={expense.id}
                          item={expense}
                          type="periodic"
                          onClick={() => handleExpenseClick(expense)}
                        />
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

          {activeTab === 'fixed-bills' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-headline">Mis Facturas Fijas</h2>
                  <p className="text-caption">Configura tus gastos recurrentes para calcular el excedente</p>
                </div>
              </div>


              <div className="mx-auto w-full max-w-4xl">
                <FixedBillsSection
                  bills={budget.fixedBills}
                  loans={budget.loans}
                  fixedCategory={fixedCategory}
                  onAddBill={budget.addFixedBill}
                  onUpdateBill={budget.updateFixedBill}
                  onDeleteBill={budget.deleteFixedBill}
                />
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-headline">Mis Préstamos</h2>
                  <p className="text-caption">Control de deudas y pagos quincenales</p>
                </div>
              </div>

              <div className="mx-auto w-full max-w-4xl">
                <LoansSection
                  loans={budget.loans}
                  fixedCategory={fixedCategory}
                  onAddLoan={budget.addLoan}
                  onUpdateLoan={budget.updateLoan}
                  onDeleteLoan={budget.deleteLoan}
                />
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
                <Button onClick={() => setActiveModal('goal')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Meta
                </Button>
              </div>

              {budget.goals.length > 0 ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {budget.goals.map(goal => {
                    // Dynamic Calculation
                    const savingsCategory = budget.categories.find(c => c.slug === 'savings');
                    const totalSavings = savingsCategory ? savingsCategory.amount : 0;
                    const dynamicAmount = (totalSavings * goal.allocationPercentage) / 100;

                    return (
                      <GoalCard
                        key={goal.id}
                        item={{ ...goal, currentAmount: dynamicAmount }}
                        type="goal"
                        onClick={() => handleGoalClick(goal)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="card-soft">
                  <EmptyState
                    icon={Target}
                    title="Aún no hay metas"
                    description="Diseñemos tu futuro. Crea tu primera meta de ahorro."
                  />
                  <div className="flex justify-center pb-8">
                    <Button onClick={() => setActiveModal('goal')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Crear mi primera meta
                    </Button>
                  </div>
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
                <Button onClick={() => setActiveModal('periodic')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Gasto
                </Button>
              </div>

              {budget.periodicExpenses.length > 0 ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {budget.periodicExpenses.map(expense => (
                    <GoalCard
                      key={expense.id}
                      item={expense}
                      type="periodic"
                      onClick={() => handleExpenseClick(expense)}
                    />
                  ))}
                </div>
              ) : (
                <div className="card-soft">
                  <EmptyState
                    icon={CalendarClock}
                    title="Sin gastos periódicos"
                    description="Anticipa tus gastos grandes. Universidad, mantenimiento, seguros..."
                  />
                  <div className="flex justify-center pb-8">
                    <Button onClick={() => setActiveModal('periodic')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Crear mi primer gasto
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-headline">Movimientos</h2>
                  <p className="text-caption">Historial de todos tus gastos</p>
                </div>
                <Button onClick={() => { setSelectedTransaction(null); setActiveModal('expense'); }} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nuevo Gasto
                </Button>
              </div>

              <TransactionHistory
                expenses={budget.expenses}
                categories={budget.categories}
                goals={budget.goals}
                periodicExpenses={budget.periodicExpenses}
                onDeleteExpense={budget.deleteExpense}
                onEditExpense={handleEditTransaction}
              />
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
                    <div key={income.id} className="p-4 flex items-center justify-between group">
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

                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-savings">
                          +{formatCurrency(income.amount)}
                        </span>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditIncome(income)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar este ingreso?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esto eliminará el registro del historial. <strong>No ajustará los balances actuales</strong> (Ahorro, Fijo, Variable).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => budget.deleteIncome(income.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
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
                  <div className="flex justify-center pb-8">
                    <Button onClick={() => setActiveSheet('income')} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Registrar primera quincena
                    </Button>
                  </div>
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
      </main >

      {/* Sheets */}
      {
        activeSheet === 'actions' && (
          <ActionSheet
            onClose={() => setActiveSheet(null)}
            onAction={handleAction}
          />
        )
      }

      {
        activeSheet === 'income' && (
          <IncomeWizard
            onClose={() => setActiveSheet(null)}
            onSubmit={handleIncomeSubmit}
          />
        )
      }

      {
        activeSheet === 'transfer' && (
          <TransferSheet
            categories={budget.categories}
            onClose={() => setActiveSheet(null)}
            onTransfer={handleTransfer}
          />
        )
      }

      {
        activeSheet === 'settings' && (
          <SettingsSheet
            onClose={() => setActiveSheet(null)}
            onResetData={budget.resetData}
          />
        )
      }

      {
        activeSheet === 'external-income' && (
          <ExternalIncomeModal
            open={true}
            onClose={() => setActiveSheet(null)}
            onSave={budget.addExternalIncome}
            categories={budget.categories}
          />
        )
      }

      {/* Modals */}
      <GoalFormModal
        open={activeModal === 'goal'}
        onClose={handleCloseGoalModal}
        onSave={budget.addGoal}
        onUpdate={budget.updateGoal}
        onDelete={budget.deleteGoal}
        goal={selectedGoal}
      />

      <PeriodicExpenseFormModal
        open={activeModal === 'periodic'}
        onClose={handleCloseExpenseModal}
        onSave={budget.addPeriodicExpense}
        onUpdate={budget.updatePeriodicExpense}
        onDelete={budget.deletePeriodicExpense}
        expense={selectedExpense}
      />

      <LoanFormModal
        open={activeModal === 'loan'}
        onClose={handleCloseLoanModal}
        onSave={budget.addLoan}
        onUpdate={budget.updateLoan}
        onDelete={budget.deleteLoan}
        loan={selectedLoan}
      />

      <ExpenseFormModal
        open={activeModal === 'expense'}
        onClose={handleCloseTransactionModal}
        onSave={budget.addExpense}
        onUpdate={budget.updateExpense}
        expenseToEdit={selectedTransaction}
        categories={budget.categories}
        goals={budget.goals}
        periodicExpenses={budget.periodicExpenses}
        gasAvailable={budget.gasAvailable}
      />

      <IncomeEditModal
        open={activeModal === 'income-edit'}
        onClose={handleCloseIncomeModal}
        onSave={budget.updateIncome}
        income={selectedIncome}
      />
    </div >
  );
}

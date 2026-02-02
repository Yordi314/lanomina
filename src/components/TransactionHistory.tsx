import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Receipt, ShoppingBag, Home, Wallet, Target, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import type { Expense, BudgetCategory, Goal, PeriodicExpense } from '@/hooks/useBudget';
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

interface TransactionHistoryProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  goals: Goal[];
  periodicExpenses: PeriodicExpense[];
  onDeleteExpense: (id: string) => void;
}

type FilterType = 'all' | 'current-month' | 'current-fortnight' | 'fixed' | 'savings' | 'variable';

const getCategoryIcon = (categoryType: Expense['categoryType'], categoryId: string) => {
  switch (categoryType) {
    case 'fixed': return Home;
    case 'savings': return Wallet;
    case 'variable': return ShoppingBag;
    case 'goal': return Target;
    case 'periodic': return CalendarClock;
    default: return Receipt;
  }
};

const getCategoryColor = (categoryType: Expense['categoryType']) => {
  switch (categoryType) {
    case 'fixed': return 'bg-fixed-light text-fixed';
    case 'savings': return 'bg-savings-light text-savings';
    case 'variable': return 'bg-variable-light text-variable';
    case 'goal': return 'bg-savings-light text-savings';
    case 'periodic': return 'bg-fixed-light text-fixed';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function TransactionHistory({
  expenses,
  categories,
  goals,
  periodicExpenses,
  onDeleteExpense
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const getCategoryName = (expense: Expense): string => {
    if (expense.categoryType === 'goal') {
      const goal = goals.find(g => g.id === expense.categoryId);
      return goal?.name || 'Meta';
    }
    if (expense.categoryType === 'periodic') {
      const pe = periodicExpenses.find(p => p.id === expense.categoryId);
      return pe?.name || 'Gasto Periódico';
    }
    const category = categories.find(c => c.id === expense.categoryId);
    if (category) return category.nameEs;
    return 'Otro';
  };

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const fortnightStart = subDays(now, 15);

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);

      switch (filter) {
        case 'current-month':
          return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
        case 'current-fortnight':
          return isWithinInterval(expenseDate, { start: fortnightStart, end: now });
        case 'fixed':
        case 'savings':
        case 'variable':
          return expense.categoryId === filter || expense.categoryType === filter;
        default:
          return true;
      }
    });
  }, [expenses, filter]);

  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-4">
      {/* Summary and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="card-soft px-4 py-3">
          <p className="text-sm text-muted-foreground">Total gastado</p>
          <p className="text-xl font-semibold text-destructive">
            -{formatCurrency(totalFiltered)}
          </p>
        </div>

        <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los gastos</SelectItem>
            <SelectItem value="current-month">Este mes</SelectItem>
            <SelectItem value="current-fortnight">Últimos 15 días</SelectItem>
            <SelectItem value="fixed">Solo Fijos</SelectItem>
            <SelectItem value="savings">Solo Ahorros</SelectItem>
            <SelectItem value="variable">Solo Personales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      {filteredExpenses.length > 0 ? (
        <div className="card-soft divide-y divide-border">
          {filteredExpenses.map(expense => {
            const Icon = getCategoryIcon(expense.categoryType, expense.categoryId);
            const colorClass = getCategoryColor(expense.categoryType);

            return (
              <div key={expense.id} className="p-4 flex items-center gap-4 group">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', colorClass)}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {expense.description || getCategoryName(expense)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getCategoryName(expense)} • {format(expense.date, "d 'de' MMMM", { locale: es })}
                  </p>
                </div>

                <span className="text-base font-semibold text-foreground">
                  -{formatCurrency(expense.amount)}
                </span>

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
                      <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se reembolsará {formatCurrency(expense.amount)} a la categoría "{getCategoryName(expense)}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteExpense(expense.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-soft py-12 text-center">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No hay gastos registrados</p>
        </div>
      )}
    </div>
  );
}

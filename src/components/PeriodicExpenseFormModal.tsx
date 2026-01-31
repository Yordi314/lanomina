import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, CalendarClock } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/formatCurrency';
import type { PeriodicExpense } from '@/hooks/useBudget';
import { cn } from '@/lib/utils';

interface PeriodicExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<PeriodicExpense, 'id' | 'currentAmount'>) => void;
  onUpdate?: (expenseId: string, updates: Partial<Omit<PeriodicExpense, 'id'>>) => void;
  onDelete?: (expenseId: string) => void;
  expense?: PeriodicExpense | null;
}

export function PeriodicExpenseFormModal({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  expense
}: PeriodicExpenseFormModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');

  const isEditing = !!expense;

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setTargetAmount(expense.targetAmount.toString());
      setDueDate(expense.dueDate.toISOString().split('T')[0]);
      setFrequency(expense.frequency);
    } else {
      setName('');
      setTargetAmount('');
      setDueDate('');
      setFrequency('quarterly');
    }
  }, [expense, open]);

  // Calculate savings needed per fortnight
  const calculateFortnightlySavings = () => {
    if (!dueDate || !targetAmount) return null;

    const target = parseFloat(targetAmount);
    const currentAmount = expense?.currentAmount || 0;
    const remaining = target - currentAmount;

    if (remaining <= 0) return null;

    const daysLeft = differenceInDays(new Date(dueDate), new Date());
    if (daysLeft <= 0) return null;

    const fortnightsLeft = Math.max(1, Math.ceil(daysLeft / 15));
    return remaining / fortnightsLeft;
  };

  const fortnightlySavings = calculateFortnightlySavings();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const parsedTarget = parseFloat(targetAmount) || 0;

    if (!trimmedName || parsedTarget <= 0 || !dueDate) return;

    const expenseData = {
      name: trimmedName,
      targetAmount: parsedTarget,
      dueDate: new Date(dueDate),
      frequency,
    };

    if (isEditing && onUpdate && expense) {
      onUpdate(expense.id, expenseData);
    } else {
      onSave(expenseData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (expense && onDelete) {
      onDelete(expense.id);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl shadow-soft-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-headline">
            {isEditing ? 'Editar Gasto Periódico' : 'Nuevo Gasto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-label mb-1.5 block">Nombre del gasto</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CalendarClock className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Ej: Mantenimiento Carro"
                />
              </div>
            </div>

            <div>
              <label className="text-label mb-1.5 block">Monto Necesario</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">RD$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-label mb-1.5 block">Fecha Límite</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-label mb-1.5 block">Frecuencia</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                >
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>

            {fortnightlySavings && (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ahorro sugerido</p>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(fortnightlySavings)} <span className="font-normal text-muted-foreground">/ quincena</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="w-12 h-12 p-0 flex-shrink-0 rounded-xl"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Gasto'}
            </Button>
          </div>
        </form>

        {/* Safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

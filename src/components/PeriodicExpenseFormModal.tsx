import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/formatCurrency';
import type { PeriodicExpense } from '@/hooks/useBudget';

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Gasto Periódico' : 'Nuevo Gasto Periódico'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-name">Nombre del gasto</Label>
            <Input
              id="expense-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Universidad, Mantenimiento Carro"
              maxLength={100}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expense-target">Monto Necesario (RD$)</Label>
            <Input
              id="expense-target"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="35,000"
              min="1"
              max="100000000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-due">Fecha Límite</Label>
            <Input
              id="expense-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-frequency">Frecuencia</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {fortnightlySavings && (
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">
                Para llegar a tiempo, debes ahorrar:
              </p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(fortnightlySavings)} <span className="text-sm font-normal text-muted-foreground">por quincena</span>
              </p>
            </div>
          )}

          {isEditing && expense && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Acumulado: RD$ {expense.currentAmount.toLocaleString()} de RD$ {expense.targetAmount.toLocaleString()}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar Cambios' : 'Crear Gasto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

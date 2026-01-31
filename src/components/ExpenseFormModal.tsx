import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Expense, BudgetCategory, Goal, PeriodicExpense } from '@/hooks/useBudget';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  categories: BudgetCategory[];
  goals: Goal[];
  periodicExpenses: PeriodicExpense[];
}

export function ExpenseFormModal({ 
  open, 
  onClose, 
  onSave,
  categories,
  goals,
  periodicExpenses,
}: ExpenseFormModalProps) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('variable');
  const [categoryType, setCategoryType] = useState<Expense['categoryType']>('variable');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (open) {
      setAmount('');
      setCategoryId('variable');
      setCategoryType('variable');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  const handleCategoryChange = (value: string) => {
    const [type, id] = value.split(':');
    setCategoryType(type as Expense['categoryType']);
    setCategoryId(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    onSave({
      amount: parsedAmount,
      categoryId,
      categoryType,
      description: description.trim(),
      date: new Date(date),
    });
    
    onClose();
  };

  const getCategoryLabel = (cat: BudgetCategory) => {
    switch (cat.id) {
      case 'fixed': return 'Gastos Fijos (50%)';
      case 'savings': return 'Ahorros (30%)';
      case 'variable': return 'Gastos Personales (20%)';
      default: return cat.nameEs;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Gasto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-amount">Monto (RD$)</Label>
            <Input
              id="expense-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1,500"
              min="1"
              max="100000000"
              required
              autoFocus
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-category">Categoría</Label>
            <Select 
              value={`${categoryType}:${categoryId}`} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="variable:variable">Gastos Personales (20%)</SelectItem>
                <SelectItem value="fixed:fixed">Gastos Fijos (50%)</SelectItem>
                <SelectItem value="savings:savings">Ahorros (30%)</SelectItem>
                
                {goals.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Metas
                    </div>
                    {goals.map(goal => (
                      <SelectItem key={goal.id} value={`goal:${goal.id}`}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                
                {periodicExpenses.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Gastos Periódicos
                    </div>
                    {periodicExpenses.map(pe => (
                      <SelectItem key={pe.id} value={`periodic:${pe.id}`}>
                        {pe.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expense-description">Descripción (opcional)</Label>
            <Textarea
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Cena con amigos, Uber, Supermercado..."
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-date">Fecha</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Gasto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

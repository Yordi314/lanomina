import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, Receipt, Fuel } from 'lucide-react';
import { Expense, BudgetCategory, Goal, PeriodicExpense } from '@/hooks/useBudget';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  categories: BudgetCategory[];
  goals: Goal[];
  periodicExpenses: PeriodicExpense[];
  gasAvailable?: number; // Optional prop for Gas display
}

export function ExpenseFormModal({
  open,
  onClose,
  onSave,
  categories,
  goals,
  periodicExpenses,
  gasAvailable = 0,
}: ExpenseFormModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryType, setCategoryType] = useState<Expense['categoryType']>('variable');
  const [isGas, setIsGas] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setDescription('');
      setAmount('');
      const defaultCat = categories.find(c => c.id === 'variable')?.id || '';
      setCategoryId(defaultCat);
      setCategoryType('variable');
      setIsGas(false);
    }
  }, [open, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: new Date(),
      amount: parseFloat(amount),
      categoryId,
      categoryType: isGas ? 'fixed' : categoryType, // Gas always comes from Fixed budget conceptually in logic, but we track it separately too
      description,
      isGas,
    });
    onClose();
  };

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedGoal = goals.find(g => g.id === categoryId);
  const selectedPeriodic = periodicExpenses.find(p => p.id === categoryId);

  // Logic to determine max amount based on selection
  let maxAmount = 0;
  if (isGas) {
    maxAmount = gasAvailable;
  } else if (selectedCategory) {
    maxAmount = selectedCategory.amount;
  } else if (selectedGoal) {
    maxAmount = selectedGoal.currentAmount;
  } else if (selectedPeriodic) {
    maxAmount = selectedPeriodic.currentAmount;
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);

    if (categories.some(c => c.id === value)) setCategoryType('variable');
    else if (goals.some(g => g.id === value)) setCategoryType('goal');
    else if (periodicExpenses.some(p => p.id === value)) setCategoryType('periodic');
    else if (value === 'fixed' || value === 'savings') setCategoryType(value as any);
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
          <h2 className="text-headline">Registrar Gasto</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="space-y-4">

            {/* Gasoline Toggle */}
            <div
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                isGas ? "bg-blue-50 border-blue-200" : "bg-card border-border hover:border-gray-300"
              )}
              onClick={() => setIsGas(!isGas)}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", isGas ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground")}>
                <Fuel className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Gasto de Gasolina</p>
                <p className="text-xs text-muted-foreground">
                  {isGas
                    ? `Disponible: ${formatCurrency(gasAvailable)}`
                    : "Activar para descontar del presupuesto de gasolina"}
                </p>
              </div>
              <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", isGas ? "border-blue-500 bg-blue-500" : "border-muted-foreground")}>
                {isGas && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </div>

            {!isGas && (
              <div>
                <label className="text-label mb-1.5 block">Categoría</label>
                <Select value={categoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full h-auto py-3 bg-muted/30 border-border rounded-xl focus:ring-2 focus:ring-primary/20 font-medium">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Presupuesto Base</SelectLabel>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nameEs} ({formatCurrency(cat.amount)})
                        </SelectItem>
                      ))}
                    </SelectGroup>

                    {goals.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Metas</SelectLabel>
                        {goals.map(goal => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.name} ({formatCurrency(goal.currentAmount)})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}

                    {periodicExpenses.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Gastos Periódicos</SelectLabel>
                        {periodicExpenses.map(exp => (
                          <SelectItem key={exp.id} value={exp.id}>
                            {exp.name} ({formatCurrency(exp.currentAmount)})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-label mb-1.5 block">Descripción</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="Ej: Supermercado, Cena..."
                />
              </div>
            </div>

            <div>
              <label className="text-label mb-1.5 block">Monto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">RD$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  max={maxAmount > 0 ? maxAmount : undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-lg",
                    parseFloat(amount) > maxAmount && maxAmount > 0 ? "focus:ring-destructive/50 border-destructive text-destructive" : "focus:ring-primary/20"
                  )}
                  placeholder="0.00"
                />
              </div>
              {maxAmount > 0 && (
                <p className={cn("text-xs mt-1.5 ml-1", parseFloat(amount) > maxAmount ? "text-destructive font-medium" : "text-muted-foreground")}>
                  Disponible: {formatCurrency(maxAmount)}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            disabled={!amount || !description || parseFloat(amount) > maxAmount}
          >
            Registrar Gasto
          </Button>
        </form>

        {/* Safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

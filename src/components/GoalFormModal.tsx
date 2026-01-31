import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, Target } from 'lucide-react';
import type { Goal } from '@/hooks/useBudget';
import { cn } from '@/lib/utils';

interface GoalFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  onUpdate?: (goalId: string, updates: Partial<Omit<Goal, 'id'>>) => void;
  onDelete?: (goalId: string) => void;
  goal?: Goal | null;
}

export function GoalFormModal({ open, onClose, onSave, onUpdate, onDelete, goal }: GoalFormModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [allocationPercentage, setAllocationPercentage] = useState('');

  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setAllocationPercentage(goal.allocationPercentage.toString());
    } else {
      setName('');
      setTargetAmount('');
      setAllocationPercentage('');
    }
  }, [goal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const parsedTarget = parseFloat(targetAmount) || 0;
    const parsedAllocation = parseFloat(allocationPercentage) || 0;

    if (!trimmedName || parsedTarget <= 0) return;

    if (isEditing && onUpdate && goal) {
      onUpdate(goal.id, {
        name: trimmedName,
        targetAmount: parsedTarget,
        allocationPercentage: parsedAllocation,
      });
    } else {
      onSave({
        name: trimmedName,
        targetAmount: parsedTarget,
        allocationPercentage: parsedAllocation,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (goal && onDelete) {
      onDelete(goal.id);
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
            {isEditing ? 'Editar Meta' : 'Nueva Meta'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-label mb-1.5 block">Nombre de la meta</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-savings-light flex items-center justify-center">
                  <Target className="w-4 h-4 text-savings" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-savings/20 transition-all font-medium"
                  placeholder="Ej: Fondo de Emergencia"
                />
              </div>
            </div>

            <div>
              <label className="text-label mb-1.5 block">Monto Objetivo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">RD$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-savings/20 transition-all font-medium text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-label mb-1.5 block">Porcentaje de Asignación</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={allocationPercentage}
                  onChange={(e) => setAllocationPercentage(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-savings/20 transition-all font-medium"
                  placeholder="30"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                Del total destinado a Ahorros, ¿cuánto va a esta meta?
              </p>
            </div>

            {isEditing && goal && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-muted-foreground">Progreso actual</span>
                  <span className="font-medium">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-savings transition-all duration-500"
                    style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs mt-2 font-medium">
                  <span>RD$ {goal.currentAmount.toLocaleString()}</span>
                  <span className="text-muted-foreground">Meta: RD$ {goal.targetAmount.toLocaleString()}</span>
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
              className="flex-1 h-12 text-lg rounded-xl bg-savings hover:bg-savings/90 text-white"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Meta'}
            </Button>
          </div>
        </form>

        {/* Safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

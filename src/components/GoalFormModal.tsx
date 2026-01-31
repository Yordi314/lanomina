import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Goal } from '@/hooks/useBudget';

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Meta' : 'Nueva Meta de Ahorro'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Nombre de la meta</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Fondo de Emergencia"
              maxLength={100}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal-target">Monto Objetivo (RD$)</Label>
            <Input
              id="goal-target"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="100,000"
              min="1"
              max="100000000"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal-allocation">Porcentaje de Asignación (%)</Label>
            <Input
              id="goal-allocation"
              type="number"
              value={allocationPercentage}
              onChange={(e) => setAllocationPercentage(e.target.value)}
              placeholder="30"
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground">
              Del total que entra a Ahorros, ¿qué porcentaje va a esta meta?
            </p>
          </div>

          {isEditing && goal && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Progreso actual: RD$ {goal.currentAmount.toLocaleString()} de RD$ {goal.targetAmount.toLocaleString()}
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
              {isEditing ? 'Guardar Cambios' : 'Crear Meta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

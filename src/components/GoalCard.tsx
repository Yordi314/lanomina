import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { ProgressRing } from './ProgressRing';
import { ChevronRight } from 'lucide-react';
import type { Goal, PeriodicExpense } from '@/hooks/useBudget';
import { differenceInDays, differenceInWeeks } from 'date-fns';

interface GoalCardProps {
  item: Goal | PeriodicExpense;
  type: 'goal' | 'periodic';
  onClick?: () => void;
}

export function GoalCard({ item, type, onClick }: GoalCardProps) {
  const progress = item.targetAmount > 0 
    ? (item.currentAmount / item.targetAmount) * 100 
    : 0;
  
  const remaining = item.targetAmount - item.currentAmount;
  const isComplete = progress >= 100;
  
  // Calculate time remaining for periodic expenses
  let timeRemaining = '';
  let isUrgent = false;
  
  if (type === 'periodic' && 'dueDate' in item) {
    const daysLeft = differenceInDays(item.dueDate, new Date());
    const weeksLeft = differenceInWeeks(item.dueDate, new Date());
    
    if (daysLeft < 0) {
      timeRemaining = 'Vencido';
      isUrgent = true;
    } else if (daysLeft <= 14) {
      timeRemaining = `${daysLeft} días`;
      isUrgent = !isComplete && remaining > 0;
    } else if (weeksLeft <= 8) {
      timeRemaining = `${weeksLeft} semanas`;
      isUrgent = !isComplete && progress < 50;
    } else {
      const fortnights = Math.ceil(daysLeft / 15);
      timeRemaining = `${fortnights} quincenas`;
    }
  }

  const colorClass = type === 'goal' 
    ? 'stroke-savings' 
    : isUrgent 
      ? 'stroke-destructive' 
      : 'stroke-fixed';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 bg-card border border-border rounded-2xl flex items-center gap-4 text-left',
        'transition-all duration-200 hover:shadow-soft hover:border-transparent active:scale-[0.99]'
      )}
    >
      <ProgressRing 
        progress={progress} 
        size={56} 
        strokeWidth={4}
        colorClass={colorClass}
      >
        <span className="text-xs font-medium text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </ProgressRing>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{item.name}</h3>
        <p className="text-caption">
          {isComplete ? (
            <span className="text-success">✓ Completado</span>
          ) : (
            <>Faltan {formatCurrency(remaining)}</>
          )}
        </p>
        {timeRemaining && (
          <p className={cn(
            'text-xs mt-0.5',
            isUrgent ? 'text-destructive font-medium' : 'text-muted-foreground'
          )}>
            {timeRemaining}
          </p>
        )}
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}

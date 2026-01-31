import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

interface BudgetComparisonBarProps {
  budgetAmount: number;
  actualAmount: number;
  label?: string;
}

export function BudgetComparisonBar({ budgetAmount, actualAmount, label }: BudgetComparisonBarProps) {
  const percentage = budgetAmount > 0 ? Math.min(100, (actualAmount / budgetAmount) * 100) : 0;
  const surplus = budgetAmount - actualAmount;
  const hasSurplus = surplus > 0;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className={cn(
            "font-medium",
            hasSurplus ? "text-savings" : "text-destructive"
          )}>
            {hasSurplus ? `+${formatCurrency(surplus)} disponible` : `${formatCurrency(Math.abs(surplus))} excedido`}
          </span>
        </div>
      )}
      
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {/* Background bar representing the budget (50%) */}
        <div className="absolute inset-0 bg-muted" />
        
        {/* Actual usage bar */}
        <div 
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            percentage > 100 ? "bg-destructive" : "bg-fixed"
          )}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Facturas: {formatCurrency(actualAmount)}</span>
        <span>Presupuesto: {formatCurrency(budgetAmount)}</span>
      </div>
    </div>
  );
}

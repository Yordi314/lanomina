import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import type { BudgetCategory } from '@/hooks/useBudget';

interface BudgetCardProps {
  category: BudgetCategory;
  totalBudget: number;
  onClick?: () => void;
}

const categoryStyles = {
  fixed: {
    bg: 'bg-fixed-light',
    text: 'text-fixed',
    accent: 'bg-fixed',
  },
  savings: {
    bg: 'bg-savings-light',
    text: 'text-savings',
    accent: 'bg-savings',
  },
  variable: {
    bg: 'bg-variable-light',
    text: 'text-variable',
    accent: 'bg-variable',
  },
};

const categoryLabels = {
  fixed: 'Restante',
  savings: 'Acumulado',
  variable: 'Disponible',
};

export function BudgetCard({ category, totalBudget, onClick }: BudgetCardProps) {
  const styles = categoryStyles[category.type];
  const label = categoryLabels[category.type];
  const percentage = totalBudget > 0 ? (category.amount / totalBudget) * 100 : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-5 rounded-3xl text-left transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-soft-lg active:scale-[0.98]',
        styles.bg
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-label">{category.nameEs}</span>
        <span className={cn('text-xs font-medium', styles.text)}>
          {category.percentage}%
        </span>
      </div>
      
      <div className="mb-3">
        <span className={cn('text-2xl font-semibold tracking-tight', styles.text)}>
          {formatCurrency(category.amount)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', styles.accent)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <p className="mt-2 text-caption">
        {label}
      </p>
    </button>
  );
}

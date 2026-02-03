import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { Plus } from 'lucide-react';
import type { BudgetCategory } from '@/hooks/useBudget';

interface BudgetCardProps {
  category: BudgetCategory;
  totalBudget: number;
  availableAmount?: number;
  onClick?: () => void;
  onAddFunds?: () => void;
}

import { Home, PiggyBank, Wallet, Snowflake, Sparkles, ChevronRight } from 'lucide-react';

const categoryStyles = {
  fixed: {
    bg: 'bg-slate-50',
    border: 'border-slate-100/50',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    text: 'text-slate-900',
    subtext: 'text-slate-600',
    barBg: 'bg-slate-200/50',
    barFill: 'bg-slate-600',
    Icon: Home
  },
  savings: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100/50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    text: 'text-emerald-900',
    subtext: 'text-emerald-600',
    barBg: 'bg-emerald-200/50',
    barFill: 'bg-emerald-500',
    Icon: PiggyBank
  },
  variable: {
    bg: 'bg-amber-50',
    border: 'border-amber-100/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    text: 'text-amber-900',
    subtext: 'text-amber-600',
    barBg: 'bg-amber-200/50',
    barFill: 'bg-amber-500',
    Icon: Wallet
  },
};

const categoryLabels = {
  fixed: 'Restante',
  savings: 'Acumulado',
  variable: 'Disponible',
};

const groupLabels = {
  fixed: 'Presupuesto Fijo',
  savings: 'Fondo de Ahorro',
  variable: 'Presupuesto Ocio',
};

export function BudgetCard({ category, totalBudget, availableAmount, onClick, onAddFunds }: BudgetCardProps) {
  const styles = categoryStyles[category.type];
  const label = categoryLabels[category.type];
  const groupLabel = groupLabels[category.type];
  const percentage = totalBudget > 0 ? (category.amount / totalBudget) * 100 : 0;
  const Icon = styles.Icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'w-full p-5 rounded-3xl transition-all duration-200 cursor-pointer relative group overflow-hidden border',
        'hover:shadow-soft-lg',
        styles.bg,
        styles.border
      )}
    >
      {/* Background Pattern */}
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-40", styles.iconBg)} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", styles.iconBg, styles.iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          {onClick && (
            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className={cn("w-4 h-4", styles.iconColor)} />
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-end mb-1">
          <p className={cn("text-sm font-medium opacity-80", styles.subtext)}>{groupLabel}</p>
          <span className={cn('text-xs font-medium', styles.subtext)}>
            {category.percentage}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <h3 className={cn("text-2xl font-bold tracking-tight", styles.text)}>
            {formatCurrency(category.amount)}
          </h3>

          {onAddFunds && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFunds();
              }}
              className={cn(
                "p-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95",
                "bg-white/60 hover:bg-white text-primary border border-border/50",
                "backdrop-blur-sm"
              )}
              title="Ingresar fondos"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className={cn("mt-4 flex items-center justify-between text-xs font-medium opacity-60", styles.subtext)}>
          <span>{label}</span>
          {availableAmount !== undefined && (
            <span>{formatCurrency(availableAmount)}</span>
          )}
        </div>

        {/* Progress bar */}
        <div className={cn("mt-2 h-2 w-full rounded-full overflow-hidden", styles.barBg)}>
          <div
            className={cn('h-full rounded-full transition-all duration-500', styles.barFill)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

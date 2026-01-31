import { X, Wallet, ArrowRightLeft, Target, CalendarClock, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionSheetProps {
  onClose: () => void;
  onAction: (action: 'income' | 'transfer' | 'goal' | 'periodic' | 'expense' | 'external-income') => void;
}

const actions = [
  {
    id: 'expense' as const,
    icon: Receipt,
    title: 'Registrar Gasto',
    description: 'Descontar de una categoría',
    color: 'bg-destructive text-destructive-foreground',
  },
  {
    id: 'income' as const,
    icon: Wallet,
    title: 'Registrar Quincena',
    description: 'Ingreso de nómina o gasolina',
    color: 'bg-savings text-white',
  },
  {
    id: 'external-income' as const,
    icon: Wallet,
    title: 'Ingreso Extra',
    description: 'Ahorros externos, regalos...',
    color: 'bg-emerald-600 text-white',
  },
  {
    id: 'transfer' as const,
    icon: ArrowRightLeft,
    title: 'Transferir Fondos',
    description: 'Mover entre categorías',
    color: 'bg-fixed text-white',
  },
  {
    id: 'goal' as const,
    icon: Target,
    title: 'Nueva Meta',
    description: 'Crear objetivo de ahorro',
    color: 'bg-variable text-white',
  },
  {
    id: 'periodic' as const,
    icon: CalendarClock,
    title: 'Gasto Periódico',
    description: 'Agregar provisión',
    color: 'bg-primary text-primary-foreground',
  },
];

export function ActionSheet({ onClose, onAction }: ActionSheetProps) {
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
          <h2 className="text-headline">¿Qué deseas hacer?</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className="p-4 card-soft text-left hover:shadow-soft-lg transition-all active:scale-[0.98]"
              >
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-3', action.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-sm mb-0.5">{action.title}</h3>
                <p className="text-caption text-xs">{action.description}</p>
              </button>
            );
          })}
        </div>

        {/* Safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';

interface SurplusCardProps {
  surplusAmount: number;
  onMoveToSavings: () => void;
  onMoveToVariable: () => void;
}

export function SurplusCard({ surplusAmount, onMoveToSavings, onMoveToVariable }: SurplusCardProps) {
  if (surplusAmount <= 0) return null;

  return (
    <div className="card-soft p-5 border-l-4 border-l-savings bg-gradient-to-r from-savings-light/50 to-transparent">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-savings/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-savings" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground">
            ¡Tienes dinero extra!
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tus gastos fijos son menores al 50%. Tienes{' '}
            <span className="font-semibold text-savings">{formatCurrency(surplusAmount)}</span>{' '}
            disponible para reubicar.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              onClick={onMoveToSavings}
            >
              Mover a Ahorros
              <ArrowRight className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-2"
              onClick={onMoveToVariable}
            >
              Mover a Lifestyle
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { ArrowDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BudgetCategory } from '@/hooks/useBudget';

interface TransferSheetProps {
  categories: BudgetCategory[];
  onClose: () => void;
  onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const categoryColors = {
  fixed: { bg: 'bg-fixed', light: 'bg-fixed-light', text: 'text-fixed' },
  savings: { bg: 'bg-savings', light: 'bg-savings-light', text: 'text-savings' },
  variable: { bg: 'bg-variable', light: 'bg-variable-light', text: 'text-variable' },
};

export function TransferSheet({ categories, onClose, onTransfer }: TransferSheetProps) {
  const [fromId, setFromId] = useState(categories[2]?.id || ''); // Default: Variable
  const [toId, setToId] = useState(categories[1]?.id || ''); // Default: Savings
  const [amount, setAmount] = useState('');

  const fromCategory = categories.find(c => c.id === fromId);
  const toCategory = categories.find(c => c.id === toId);
  const numericAmount = parseFloat(amount) || 0;

  const canTransfer = numericAmount > 0 && 
    fromId !== toId && 
    fromCategory && 
    numericAmount <= fromCategory.amount;

  const handleTransfer = () => {
    if (canTransfer) {
      onTransfer(fromId, toId, numericAmount);
      onClose();
    }
  };

  const handleSwap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl shadow-soft-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-title">Transferir</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* From */}
          <div className="text-center">
            <span className="text-label">Origen</span>
            <div className="flex justify-center gap-2 mt-3">
              {categories.map(cat => {
                const colors = categoryColors[cat.type];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFromId(cat.id)}
                    className={cn(
                      'px-4 py-3 rounded-2xl transition-all',
                      fromId === cat.id 
                        ? cn(colors.bg, 'text-white scale-105 shadow-lg') 
                        : cn(colors.light, colors.text)
                    )}
                  >
                    <div className="text-sm font-medium">{cat.nameEs}</div>
                    <div className="text-xs opacity-80">
                      {formatCurrency(cat.amount)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <button 
              onClick={handleSwap}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            
            <div className="pt-6 pb-4 border-t border-b border-border">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-light text-muted-foreground">RD$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="text-4xl font-light text-center bg-transparent outline-none w-32"
                />
              </div>
              {fromCategory && numericAmount > fromCategory.amount && (
                <p className="text-destructive text-sm text-center mt-2">
                  Saldo insuficiente
                </p>
              )}
            </div>
          </div>

          {/* To */}
          <div className="text-center">
            <span className="text-label">Destino</span>
            <div className="flex justify-center gap-2 mt-3">
              {categories.filter(c => c.id !== fromId).map(cat => {
                const colors = categoryColors[cat.type];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setToId(cat.id)}
                    className={cn(
                      'px-4 py-3 rounded-2xl transition-all',
                      toId === cat.id 
                        ? cn(colors.bg, 'text-white scale-105 shadow-lg') 
                        : cn(colors.light, colors.text)
                    )}
                  >
                    <div className="text-sm font-medium">{cat.nameEs}</div>
                    <div className="text-xs opacity-80">
                      {formatCurrency(cat.amount)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <Button
            onClick={handleTransfer}
            disabled={!canTransfer}
            className="w-full h-14 text-lg rounded-2xl"
          >
            Confirmar Transferencia
          </Button>
        </div>
      </div>
    </div>
  );
}

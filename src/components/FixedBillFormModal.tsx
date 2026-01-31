import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, Home } from 'lucide-react';
import { FixedBill } from '@/hooks/useBudget';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';

interface FixedBillFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bill: Omit<FixedBill, 'id'>) => void;
  onUpdate: (billId: string, updates: Partial<Omit<FixedBill, 'id'>>) => void;
  onDelete: (billId: string) => void;
  bill: FixedBill | null;
}

export function FixedBillFormModal({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  bill,
}: FixedBillFormModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [fortnight, setFortnight] = useState<1 | 2 | 'both'>('both');

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setAmount(bill.amount.toString());
      setFortnight(bill.fortnight === 1 ? 1 : bill.fortnight === 2 ? 2 : 'both');
    } else {
      setName('');
      setAmount('');
      setFortnight('both');
    }
  }, [bill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Logic: 
    // Ambas ('both') = Monthly frequency, pays half each fortnight implicitly (handled by calculation logic)
    // 1st/2nd = Biweekly frequency (pays full amount in that specific fortnight)
    const frequency: 'monthly' | 'biweekly' = fortnight === 'both' ? 'monthly' : 'biweekly';

    const billData = {
      name,
      amount: parseFloat(amount),
      frequency,
      fortnight: fortnight === 'both' ? null : fortnight,
    };

    if (bill) {
      onUpdate(bill.id, billData);
    } else {
      onSave(billData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (bill) {
      onDelete(bill.id);
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
            {bill ? 'Editar Factura' : 'Nueva Factura Fija'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-label mb-1.5 block">Nombre del servicio</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-fixed-light flex items-center justify-center">
                  <Home className="w-4 h-4 text-fixed" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-fixed/20 transition-all font-medium"
                  placeholder="Ej: Alquiler, Internet..."
                />
              </div>
            </div>

            <div>
              <label className="text-label mb-1.5 block">Monto total mensual</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">RD$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-fixed/20 transition-all font-medium text-lg"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-label mb-1.5 block">¿Cuándo se paga?</label>
              <div className="flex rounded-xl bg-muted/50 p-1">
                <button
                  type="button"
                  onClick={() => setFortnight(1)}
                  className={cn(
                    'flex-1 py-3 text-sm font-medium rounded-lg transition-all',
                    fortnight === 1
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  1ra Quincena
                </button>
                <button
                  type="button"
                  onClick={() => setFortnight(2)}
                  className={cn(
                    'flex-1 py-3 text-sm font-medium rounded-lg transition-all',
                    fortnight === 2
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  2da Quincena
                </button>
                <button
                  type="button"
                  onClick={() => setFortnight('both')}
                  className={cn(
                    'flex-1 py-3 text-sm font-medium rounded-lg transition-all',
                    fortnight === 'both'
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Ambas (Dividir)
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg flex items-start gap-2">
              <span className="text-lg leading-none">💡</span>
              <span>
                {fortnight === 'both'
                  ? `Se descontarán ${formatCurrency((parseFloat(amount) || 0) / 2)} en cada quincena para completar el pago mensual.`
                  : `Se descontará el monto total de ${formatCurrency(parseFloat(amount) || 0)} únicamente en la ${fortnight === 1 ? 'primera' : 'segunda'} quincena.`}
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            {bill && (
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
              className="flex-1 h-12 text-lg rounded-xl bg-fixed hover:bg-fixed/90 text-white"
            >
              {bill ? 'Guardar Cambios' : 'Agregar Factura'}
            </Button>
          </div>
        </form>

        {/* Safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

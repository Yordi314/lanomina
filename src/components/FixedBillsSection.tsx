import { useState } from 'react';
import { Plus, Receipt, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { BudgetComparisonBar } from './BudgetComparisonBar';
import { FixedBillFormModal } from './FixedBillFormModal';
import type { FixedBill, BudgetCategory, Loan } from '@/hooks/useBudget';

interface FixedBillsSectionProps {
  bills: FixedBill[];
  loans?: Loan[]; // Add loans as optional prop to avoid immediate break, but we will pass it
  fixedCategory: BudgetCategory;
  onAddBill: (bill: Omit<FixedBill, 'id'>) => void;
  onUpdateBill: (billId: string, updates: Partial<Omit<FixedBill, 'id'>>) => void;
  onDeleteBill: (billId: string) => void;
}

export function FixedBillsSection({
  bills,
  loans = [],
  fixedCategory,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
}: FixedBillsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<FixedBill | null>(null);

  // Derive current fortnight for display logic
  const currentDay = new Date().getDate();
  const currentFortnight = currentDay <= 15 ? 1 : 2;

  // Calculate strict total for THIS fortnight active bills only
  const totalBillsPerFortnight = bills.reduce((sum, bill) => {
    // Logic matches useBudget:
    // If specific fortnight (1 or 2), only add FULL amount if matches current
    // If monthly (null/both), add HALF amount
    // eslint-disable-next-line eqeqeq
    if (bill.fortnight == 1 || bill.fortnight == 2) {
      // eslint-disable-next-line eqeqeq
      if (bill.fortnight != currentFortnight) return sum;
      return sum + bill.amount;
    }
    return sum + (bill.amount / 2);
  }, 0);

  // Loans are always per fortnight, so we add them all
  const totalLoansPerFortnight = loans.reduce((sum, loan) => sum + loan.paymentPerFortnight, 0);

  const totalCommitted = totalBillsPerFortnight + totalLoansPerFortnight;

  const handleEditBill = (bill: FixedBill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
  };

  return (
    <div className="space-y-4">
      {/* Comparison Bar */}
      <BudgetComparisonBar
        budgetAmount={fixedCategory.amount}
        actualAmount={totalCommitted}
        label="Uso del presupuesto fijo (Facturas + Préstamos)"
      />

      {/* Info Banner */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Mostrando actividad para la <strong className="text-foreground">{currentFortnight}ª Quincena</strong></span>
        </div>
        <span>Total a pagar: <strong className="text-foreground">{formatCurrency(totalCommitted)}</strong></span>
      </div>

      {/* Bills List */}
      {bills.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bills.map(bill => {
            // Determine if bill is active for current fortnight
            // eslint-disable-next-line eqeqeq
            const isInactive = (bill.fortnight == 1 || bill.fortnight == 2) && bill.fortnight != currentFortnight;

            return (
              <button
                key={bill.id}
                onClick={() => handleEditBill(bill)}
                className={cn(
                  "p-4 bg-card border border-border rounded-xl flex items-center gap-4 text-left transition-all group relative overflow-hidden",
                  isInactive ? "opacity-50 hover:opacity-75 grayscale-[0.5]" : "hover:border-fixed/50 hover:shadow-soft"
                )}
              >
                {/* Visual cue for inactive */}
                {isInactive && (
                  <div className="absolute right-0 top-0 bg-muted px-2 py-0.5 rounded-bl-lg border-b border-l text-[10px] font-medium text-muted-foreground z-10">
                    No aplica esta Q.
                  </div>
                )}

                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  isInactive ? "bg-muted" : "bg-fixed-light"
                )}>
                  <Home className={cn("w-5 h-5", isInactive ? "text-muted-foreground" : "text-fixed")} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{bill.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{bill.frequency === 'monthly' ? 'Mensual' : 'Quincenal'}</span>
                    {bill.fortnight && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                        isInactive ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                      )}>
                        {bill.fortnight === 1 ? '1ra Q' : '2da Q'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn("font-semibold text-sm", isInactive && "text-muted-foreground decoration-slate-400")}>
                    {formatCurrency(bill.amount)}
                  </p>
                  {bill.frequency === 'monthly' && (
                    <p className="text-[10px] text-muted-foreground">
                      {formatCurrency(bill.amount / 2)}/q
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-border rounded-xl">
          <Receipt className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Agrega tus facturas fijas para ver cuánto te sobra
          </p>
        </div>
      )}

      {/* Add Button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Agregar Factura
      </Button>

      {/* Modal */}
      <FixedBillFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={onAddBill}
        onUpdate={onUpdateBill}
        onDelete={onDeleteBill}
        bill={selectedBill}
      />
    </div>
  );
}

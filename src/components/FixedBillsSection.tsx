import { useState } from 'react';
import { Plus, Receipt, Home, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { BudgetComparisonBar } from './BudgetComparisonBar';
import { FixedBillFormModal } from './FixedBillFormModal';
import type { FixedBill, BudgetCategory } from '@/hooks/useBudget';

interface FixedBillsSectionProps {
  bills: FixedBill[];
  fixedCategory: BudgetCategory;
  onAddBill: (bill: Omit<FixedBill, 'id'>) => void;
  onUpdateBill: (billId: string, updates: Partial<Omit<FixedBill, 'id'>>) => void;
  onDeleteBill: (billId: string) => void;
}

export function FixedBillsSection({ 
  bills, 
  fixedCategory,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
}: FixedBillsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<FixedBill | null>(null);

  const totalBillsPerFortnight = bills.reduce((sum, bill) => {
    return sum + (bill.frequency === 'monthly' ? bill.amount / 2 : bill.amount);
  }, 0);

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
        actualAmount={totalBillsPerFortnight}
        label="Uso del presupuesto fijo"
      />

      {/* Bills List */}
      {bills.length > 0 ? (
        <div className="space-y-2">
          {bills.map(bill => (
            <button
              key={bill.id}
              onClick={() => handleEditBill(bill)}
              className="w-full p-3 bg-card border border-border rounded-xl flex items-center gap-3 text-left hover:border-fixed/50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-fixed-light flex items-center justify-center">
                <Home className="w-4 h-4 text-fixed" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{bill.name}</p>
                <p className="text-xs text-muted-foreground">
                  {bill.frequency === 'monthly' ? 'Mensual' : 'Quincenal'}
                  {bill.frequency === 'monthly' && (
                    <span className="ml-1">
                      ({formatCurrency(bill.amount / 2)}/quincena)
                    </span>
                  )}
                </p>
              </div>
              
              <span className="text-sm font-medium">{formatCurrency(bill.amount)}</span>
              
              <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
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

import { useState } from 'react';
import { Plus, CreditCard, Receipt, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { BudgetComparisonBar } from './BudgetComparisonBar';
import { LoanFormModal } from './LoanFormModal';
import type { Loan, BudgetCategory } from '@/hooks/useBudget';

interface LoansSectionProps {
    loans: Loan[];
    fixedCategory: BudgetCategory;
    onAddLoan: (loan: Omit<Loan, 'id'>) => void;
    onUpdateLoan: (loanId: string, updates: Partial<Omit<Loan, 'id'>>) => void;
    onDeleteLoan: (loanId: string) => void;
}

export function LoansSection({
    loans,
    fixedCategory,
    onAddLoan,
    onUpdateLoan,
    onDeleteLoan,
}: LoansSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    const totalLoansPerFortnight = loans.reduce((sum, loan) => sum + loan.paymentPerFortnight, 0);

    const handleEditLoan = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLoan(null);
    };

    return (
        <div className="space-y-4">
            {/* Intro / Summary */}
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-medium">Compromiso Quincenal de Préstamos</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalLoansPerFortnight)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                <span>Este monto se descuenta automáticamente de tu presupuesto fijo.</span>
            </div>

            {/* Loans List */}
            {loans.length > 0 ? (
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {loans.map(loan => (
                        <button
                            key={loan.id}
                            onClick={() => handleEditLoan(loan)}
                            className="p-4 bg-card border border-border rounded-xl flex items-center gap-4 text-left hover:border-primary/50 hover:shadow-soft transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{loan.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {loan.durationValue} {loan.durationType === 'fortnights' ? 'Quincenas' : 'Meses'}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-semibold text-sm">{formatCurrency(loan.paymentPerFortnight)}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    Total: {formatCurrency(loan.totalAmount)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center border border-dashed border-border rounded-xl">
                    <CreditCard className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                        No tienes préstamos registrados
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
                Agregar Préstamo
            </Button>

            {/* Modal */}
            <LoanFormModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={onAddLoan}
                onUpdate={onUpdateLoan}
                onDelete={onDeleteLoan}
                loan={selectedLoan}
            />
        </div>
    );
}

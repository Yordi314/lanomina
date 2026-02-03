import { useState } from 'react';
import { Plus, CreditCard, Calendar, MoreVertical, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    onToggleStatus: (loanId: string, status: 'active' | 'paid') => void;
    onAddPayment: (loanId: string) => void;
}

export function LoansSection({
    loans,
    fixedCategory,
    onAddLoan,
    onUpdateLoan,
    onDeleteLoan,
    onToggleStatus,
    onAddPayment,
}: LoansSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

    const activeLoans = loans.filter(l => l.status === 'active');
    const totalLoansPerFortnight = activeLoans.reduce((sum, loan) => sum + loan.paymentPerFortnight, 0);

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
                    {loans.map(loan => {
                        const progress = Math.min(100, (loan.currentAmount / loan.totalAmount) * 100);
                        const isPaid = loan.status === 'paid';

                        return (
                            <div
                                key={loan.id}
                                className={cn(
                                    "relative p-4 bg-card border border-border rounded-xl transition-all group",
                                    isPaid ? "opacity-60 bg-muted/20" : "hover:border-primary/50 hover:shadow-soft"
                                )}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                            isPaid ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"
                                        )}>
                                            {isPaid ? <CheckCircle className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("font-medium truncate", isPaid && "line-through text-muted-foreground")}>{loan.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {loan.durationValue} {loan.durationType === 'fortnights' ? 'Quincenas' : 'Meses'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onAddPayment(loan.id)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Abonar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEditLoan(loan)}>
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onToggleStatus(loan.id, isPaid ? 'active' : 'paid')}>
                                                {isPaid ? (
                                                    <>
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        Marcar como Activo
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Marcar como Pagado
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleteLoan(loan.id)}>
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className={cn(isPaid ? "text-green-600" : "text-muted-foreground")}>
                                            {isPaid ? "Pagado" : "Progreso"}
                                        </span>
                                        <span className="text-foreground">
                                            {formatCurrency(loan.currentAmount)} / {formatCurrency(loan.totalAmount)}
                                        </span>
                                    </div>
                                    <Progress value={progress} className={cn("h-2", isPaid && "bg-green-100 [&>div]:bg-green-500")} />

                                    <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-3">
                                        <span className="text-xs text-muted-foreground">Cuota quincenal</span>
                                        <span className="font-semibold text-sm">{formatCurrency(loan.paymentPerFortnight)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, CreditCard, Wallet, Banknote, PiggyBank } from 'lucide-react';
import { Loan, BudgetCategory } from '@/hooks/useBudget';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoanPaymentModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: { loanId: string; amount: number; sourceCategoryId: string; sourceCategorySlug: string }) => void;
    loan: Loan | null;
    categories: BudgetCategory[];
}

export function LoanPaymentModal({
    open,
    onClose,
    onSave,
    loan,
    categories,
}: LoanPaymentModalProps) {
    const [amount, setAmount] = useState('');
    const [sourceCategoryId, setSourceCategoryId] = useState('');

    // Filter eligible source categories (Fixed, Variable, Savings)
    const sourceCategories = categories.filter(c => ['fixed', 'variable', 'savings'].includes(c.slug));

    useEffect(() => {
        if (open) {
            setAmount('');
            // Default to 'variable' if available
            const defaultCat = categories.find(c => c.slug === 'variable');
            if (defaultCat) setSourceCategoryId(defaultCat.id);
            else if (sourceCategories.length > 0) setSourceCategoryId(sourceCategories[0].id);
        }
    }, [open, categories, loan]);

    if (!open || !loan) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sourceCat = categories.find(c => c.id === sourceCategoryId);
        if (!sourceCat) return;

        onSave({
            loanId: loan.id,
            amount: parseFloat(amount),
            sourceCategoryId,
            sourceCategorySlug: sourceCat.slug
        });
        onClose();
    };

    const selectedSource = categories.find(c => c.id === sourceCategoryId);
    const remainingLoan = loan.totalAmount - loan.currentAmount;

    // Max payment is limited by EITHER the source balance OR the remaining loan debt
    const maxPayment = selectedSource
        ? Math.min(selectedSource.amount, remainingLoan)
        : 0;

    const getCategoryIcon = (slug: string) => {
        switch (slug) {
            case 'variable': return <Wallet className="w-4 h-4 mr-2" />;
            case 'fixed': return <Banknote className="w-4 h-4 mr-2" />;
            case 'savings': return <PiggyBank className="w-4 h-4 mr-2" />;
            default: return <CreditCard className="w-4 h-4 mr-2" />;
        }
    };

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
                    <div>
                        <h2 className="text-headline">Abonar a Préstamo</h2>
                        <p className="text-caption">{loan.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
                    <div className="space-y-4">

                        {/* Loan Status Card */}
                        <div className="p-4 bg-muted/30 rounded-xl border border-border">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Deuda Restante</span>
                                <span className="font-semibold">{formatCurrency(remainingLoan)}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${(loan.currentAmount / loan.totalAmount) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Source Selection */}
                        <div>
                            <label className="text-label mb-1.5 block">Pagar desde</label>
                            <Select value={sourceCategoryId} onValueChange={setSourceCategoryId}>
                                <SelectTrigger className="w-full h-auto py-3 bg-muted/30 border-border rounded-xl focus:ring-2 focus:ring-primary/20 font-medium">
                                    <SelectValue placeholder="Selecciona origen de fondos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Tus Presupuestos</SelectLabel>
                                        {sourceCategories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                <div className="flex items-center">
                                                    {getCategoryIcon(cat.slug)}
                                                    <span>{cat.nameEs}</span>
                                                    <span className="ml-2 text-muted-foreground">({formatCurrency(cat.amount)})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="text-label mb-1.5 block">Monto a Abonar</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">RD$</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    max={maxPayment > 0 ? maxPayment : undefined}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className={cn(
                                        "w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-lg",
                                        parseFloat(amount) > maxPayment && maxPayment > 0 ? "focus:ring-destructive/50 border-destructive text-destructive" : "focus:ring-primary/20"
                                    )}
                                    placeholder="0.00"
                                />
                            </div>
                            {selectedSource && (
                                <p className={cn("text-xs mt-1.5 ml-1", parseFloat(amount) > maxPayment ? "text-destructive font-medium" : "text-muted-foreground")}>
                                    Disponible para pago: {formatCurrency(maxPayment)}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        disabled={!amount || !sourceCategoryId || parseFloat(amount) > maxPayment || parseFloat(amount) <= 0}
                    >
                        Confirmar Abono
                    </Button>
                </form>

                {/* Safe area */}
                <div className="h-8" />
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, CreditCard, Calendar } from 'lucide-react';
import { Loan } from '@/hooks/useBudget';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LoanFormModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (loan: Omit<Loan, 'id'>) => void;
    onUpdate: (loanId: string, updates: Partial<Omit<Loan, 'id'>>) => void;
    onDelete: (loanId: string) => void;
    loan: Loan | null;
}

export function LoanFormModal({
    open,
    onClose,
    onSave,
    onUpdate,
    onDelete,
    loan,
}: LoanFormModalProps) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [durationValue, setDurationValue] = useState('');
    const [durationType, setDurationType] = useState<'fortnights' | 'months'>('months');

    useEffect(() => {
        if (loan) {
            setName(loan.name);
            setAmount(loan.totalAmount.toString());
            setDurationValue(loan.durationValue.toString());
            setDurationType(loan.durationType);
        } else {
            setName('');
            setAmount('');
            setDurationValue('');
            setDurationType('months'); // Default to months as requested
        }
    }, [loan, open]);

    // Calculate payment per fortnight
    const totalAmount = parseFloat(amount) || 0;
    const duration = parseFloat(durationValue) || 0;

    let totalFortnights = 0;
    if (duration > 0) {
        if (durationType === 'months') {
            totalFortnights = duration * 2;
        } else {
            totalFortnights = duration;
        }
    }

    const paymentPerFortnight = totalFortnights > 0 ? totalAmount / totalFortnights : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (totalAmount <= 0 || duration <= 0) return;

        const loanData = {
            name,
            totalAmount,
            durationValue: duration,
            durationType,
            paymentPerFortnight,
            startDate: loan ? loan.startDate : new Date(),
        };

        if (loan) {
            onUpdate(loan.id, loanData);
        } else {
            onSave(loanData);
        }
        onClose();
    };

    const handleDelete = () => {
        if (loan) {
            onDelete(loan.id);
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
                        {loan ? 'Editar Préstamo' : 'Nuevo Préstamo'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-label mb-1.5 block">Concepto del Préstamo</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-blue-600" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="Ej: Préstamo Carro, Personal..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-label mb-1.5 block">Monto Total Tomado</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">RD$</span>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-label mb-1.5 block">Duración</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={durationValue}
                                        onChange={(e) => setDurationValue(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-label mb-1.5 block">Unidad</label>
                                <Select
                                    value={durationType}
                                    onValueChange={(val: 'fortnights' | 'months') => setDurationType(val)}
                                >
                                    <SelectTrigger className="w-full h-auto py-3 bg-muted/30 border-border rounded-xl focus:ring-2 focus:ring-primary/20 font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="months">Meses</SelectItem>
                                        <SelectItem value="fortnights">Quincenas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Calculation Preview */}
                        <div className="bg-muted/50 p-4 rounded-xl space-y-2 border border-border/50">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total Quincenas:</span>
                                <span className="font-medium text-foreground">{totalFortnights} quincenas</span>
                            </div>

                            {durationType === 'fortnights' && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Equivalente a:</span>
                                    <span className="font-medium text-foreground">{(duration / 2).toFixed(1)} meses</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                <span className="font-medium text-foreground">Cuota por Quincena:</span>
                                <span className="font-bold text-lg text-primary">{formatCurrency(paymentPerFortnight)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        {loan && (
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
                            className="flex-1 h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={paymentPerFortnight <= 0}
                        >
                            {loan ? 'Guardar Cambios' : 'Agregar Préstamo'}
                        </Button>
                    </div>
                </form>

                {/* Safe area */}
                <div className="h-8" />
            </div>
        </div>
    );
}

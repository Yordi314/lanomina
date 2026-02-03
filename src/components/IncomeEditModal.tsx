import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Calendar, DollarSign, Type } from 'lucide-react';
import { Income } from '@/hooks/useBudget';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface IncomeEditModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Omit<Income, 'id'>>) => void;
    income: Income | null;
}

export function IncomeEditModal({
    open,
    onClose,
    onSave,
    income,
}: IncomeEditModalProps) {
    const [concept, setConcept] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        if (open && income) {
            setConcept(income.concept);
            setAmount(income.amount.toString());
            // Format date for input type="date"
            const d = new Date(income.date);
            setDate(format(d, 'yyyy-MM-dd'));
        }
    }, [open, income]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!income) return;

        onSave(income.id, {
            concept,
            amount: parseFloat(amount),
            date: new Date(date),
        });
        onClose();
    };

    if (!open || !income) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="absolute inset-x-0 bottom-0 bg-background rounded-t-3xl shadow-soft-lg animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-muted rounded-full" />
                </div>

                <div className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-headline">Editar Ingreso</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
                    <div className="space-y-4">

                        {/* Warning Alert */}
                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-900/50">
                            <p className="font-semibold mb-1">Nota Importante</p>
                            <p>Editar el monto de un ingreso pasado <strong>no ajustará automáticamente</strong> los balances de tus categorías (Ahorro, Fijo, Variable), ya que la distribución original no se guarda en el historial.</p>
                            <p className="mt-2">Si cambias el monto, deberás ajustar manualmente los balances si es necesario.</p>
                        </div>

                        <div>
                            <label className="text-label mb-1.5 block">Concepto</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Type className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-label mb-1.5 block">Monto</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">RD$</span>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-label mb-1.5 block">Fecha</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                        Guardar Cambios
                    </Button>
                </form>
                <div className="h-8" />
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Wallet, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BudgetCategory } from '@/hooks/useBudget';

interface ExternalIncomeModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (amount: number, categoryId: string, concept: string) => void;
    categories: BudgetCategory[];
    initialCategory?: string;
}

export function ExternalIncomeModal({ open, onClose, onSave, categories, initialCategory }: ExternalIncomeModalProps) {
    const [amount, setAmount] = useState('');
    const [concept, setConcept] = useState('');
    const defaultCategory = categories.find(c => c.slug === 'savings')?.id || '';
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || defaultCategory);

    // Sync state when initialCategory changes or modal opens
    useEffect(() => {
        if (open) {
            setSelectedCategory(initialCategory || defaultCategory);
        }
    }, [open, initialCategory, defaultCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) return;

        onSave(parsedAmount, selectedCategory, concept.trim() || 'Ingreso Extra');
        handleClose();
    };

    const handleClose = () => {
        setAmount('');
        setConcept('');
        setConcept('');
        const defaultCat = categories.find(c => c.slug === 'savings')?.id || '';
        setSelectedCategory(initialCategory || defaultCat);
        onClose();
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={handleClose}
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
                        <h2 className="text-headline">Ingreso Extra</h2>
                        {selectedCategory && (
                            <p className="text-sm text-muted-foreground">
                                Hacia: <strong className="text-primary">{categories.find(c => c.id === selectedCategory)?.nameEs}</strong>
                            </p>
                        )}
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
                    <div className="space-y-4">

                        {/* Amount Input */}
                        <div>
                            <label className="text-label mb-1.5 block">Monto a ingresar</label>
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
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Concept Input */}
                        <div>
                            <label className="text-label mb-1.5 block">Concepto (Opcional)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Wallet className="w-4 h-4 text-primary" />
                                </div>
                                <input
                                    type="text"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    className="w-full pl-14 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    placeholder="Ej: Ahorros anteriores, Regalo..."
                                />
                            </div>
                        </div>

                        {/* Category Selection Carousel - Only show if no initial category is forced */}
                        {!initialCategory && (
                            <div>
                                <label className="text-label mb-3 block">¿A dónde irá el dinero?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 h-24",
                                                selectedCategory === cat.id
                                                    ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                    : "bg-card border-border hover:bg-muted/50 text-muted-foreground"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted"
                                            )}>
                                                <ArrowDownCircle className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-medium text-center leading-tight">{cat.nameEs}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg rounded-xl gap-2"
                    >
                        Confirmar Ingreso
                    </Button>
                </form>

                {/* Safe area */}
                <div className="h-8" />
            </div>
        </div>
    );
}

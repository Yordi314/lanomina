
import { Fuel, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

interface GasCardProps {
    available: number;
    spent: number;
    totalIncome: number;
    onClick?: () => void;
}

export function GasCard({ available, spent, totalIncome, onClick }: GasCardProps) {
    const percentage = totalIncome > 0 ? (spent / totalIncome) * 100 : 0;

    return (
        <div
            onClick={onClick}
            className="w-full p-5 rounded-3xl bg-blue-50 border border-blue-100/50 hover:shadow-soft-lg transition-all cursor-pointer group relative overflow-hidden"
        >
            {/* Background Pattern - Simplified */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/40 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Fuel className="w-6 h-6" />
                </div>
                {onClick && (
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-blue-600" />
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-sm font-medium text-blue-600/80 mb-1">Presupuesto de Gasolina</p>
                <h3 className="text-2xl font-bold text-blue-900 tracking-tight">
                    {formatCurrency(available)}
                </h3>
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-blue-800/60">
                    <span>Gastado: {formatCurrency(spent)}</span>
                    <span>Total: {formatCurrency(totalIncome)}</span>
                </div>

                {/* Simple Progress Bar */}
                <div className="mt-2 h-2 w-full bg-blue-200/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

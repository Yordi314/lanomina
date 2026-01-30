import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { ArrowLeft, Check, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface IncomeWizardProps {
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    includesGas: boolean;
    distribution: { fixed: number; savings: number; variable: number };
  }) => void;
}

export function IncomeWizard({ onClose, onSubmit }: IncomeWizardProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [includesGas, setIncludesGas] = useState(false);
  const [distribution, setDistribution] = useState({
    fixed: 50,
    savings: 30,
    variable: 20,
  });
  const [editingFixed, setEditingFixed] = useState(false);
  const [customFixed, setCustomFixed] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  
  const calculateDistribution = (fixedPercent: number) => {
    const remaining = 100 - fixedPercent;
    // Maintain 30/20 ratio for savings/variable from the remaining
    const savingsPercent = Math.round(remaining * 0.6);
    const variablePercent = remaining - savingsPercent;
    return {
      fixed: fixedPercent,
      savings: savingsPercent,
      variable: variablePercent,
    };
  };

  const amounts = {
    fixed: Math.round(numericAmount * (distribution.fixed / 100)),
    savings: Math.round(numericAmount * (distribution.savings / 100)),
    variable: Math.round(numericAmount * (distribution.variable / 100)),
  };

  const handleFixedChange = (value: string) => {
    const percent = Math.max(0, Math.min(100, parseInt(value) || 0));
    setDistribution(calculateDistribution(percent));
    setCustomFixed(value);
  };

  const handleSubmit = () => {
    onSubmit({
      amount: numericAmount,
      includesGas,
      distribution: amounts,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-caption">
          Paso {step} de 2
        </span>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex flex-col h-[calc(100vh-65px)]">
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
            <h1 className="text-headline mb-8">¿Cuánto ingresó hoy?</h1>
            
            <div className="relative w-full max-w-sm mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-light text-muted-foreground">
                RD$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="input-ghost w-full pl-20 pr-4 py-4"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl w-full max-w-sm">
              <Fuel className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm">Incluir pago de gasolina</span>
              <Switch
                checked={includesGas}
                onCheckedChange={setIncludesGas}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 p-6 animate-fade-in">
            <h1 className="text-headline text-center mb-2">Tu distribución</h1>
            <p className="text-caption text-center mb-8">
              Ajusta los porcentajes según necesites
            </p>

            <div className="space-y-4 max-w-sm mx-auto">
              {/* Fixed */}
              <div 
                className="p-5 bg-fixed-light rounded-3xl cursor-pointer transition-all hover:shadow-soft"
                onClick={() => setEditingFixed(!editingFixed)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label">Fijos</span>
                  <span className="text-fixed text-sm font-medium">
                    {distribution.fixed}%
                  </span>
                </div>
                {editingFixed ? (
                  <input
                    type="number"
                    value={customFixed}
                    onChange={(e) => handleFixedChange(e.target.value)}
                    placeholder={distribution.fixed.toString()}
                    className="w-full bg-transparent text-2xl font-semibold text-fixed outline-none"
                    autoFocus
                    onBlur={() => setEditingFixed(false)}
                  />
                ) : (
                  <span className="text-2xl font-semibold text-fixed">
                    {formatCurrency(amounts.fixed)}
                  </span>
                )}
                <p className="text-caption mt-1">Toca para editar</p>
              </div>

              {/* Savings */}
              <div className="p-5 bg-savings-light rounded-3xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label">Futuro</span>
                  <span className="text-savings text-sm font-medium">
                    {distribution.savings}%
                  </span>
                </div>
                <span className="text-2xl font-semibold text-savings">
                  {formatCurrency(amounts.savings)}
                </span>
              </div>

              {/* Variable */}
              <div className="p-5 bg-variable-light rounded-3xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label">Lifestyle</span>
                  <span className="text-variable text-sm font-medium">
                    {distribution.variable}%
                  </span>
                </div>
                <span className="text-2xl font-semibold text-variable">
                  {formatCurrency(amounts.variable)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border">
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={numericAmount <= 0}
              className="w-full h-14 text-lg rounded-2xl"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="w-full h-14 text-lg rounded-2xl"
            >
              <Check className="w-5 h-5 mr-2" />
              Procesar Ingreso
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

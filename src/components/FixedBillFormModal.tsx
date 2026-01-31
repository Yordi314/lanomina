import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FixedBill } from '@/hooks/useBudget';

interface FixedBillFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (bill: Omit<FixedBill, 'id'>) => void;
  onUpdate?: (billId: string, updates: Partial<Omit<FixedBill, 'id'>>) => void;
  onDelete?: (billId: string) => void;
  bill?: FixedBill | null;
}

export function FixedBillFormModal({ 
  open, 
  onClose, 
  onSave, 
  onUpdate, 
  onDelete, 
  bill 
}: FixedBillFormModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly'>('monthly');

  const isEditing = !!bill;

  useEffect(() => {
    if (bill) {
      setName(bill.name);
      setAmount(bill.amount.toString());
      setFrequency(bill.frequency);
    } else {
      setName('');
      setAmount('');
      setFrequency('monthly');
    }
  }, [bill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const parsedAmount = parseFloat(amount) || 0;

    if (!trimmedName || parsedAmount <= 0) return;

    const billData = {
      name: trimmedName,
      amount: parsedAmount,
      frequency,
    };

    if (isEditing && onUpdate && bill) {
      onUpdate(bill.id, billData);
    } else {
      onSave(billData);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (bill && onDelete) {
      onDelete(bill.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Factura' : 'Nueva Factura Fija'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bill-name">Nombre</Label>
            <Input
              id="bill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Alquiler, Internet, Luz"
              maxLength={100}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bill-amount">Monto (RD$)</Label>
            <Input
              id="bill-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="15,000"
              min="1"
              max="100000000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-frequency">Frecuencia</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="biweekly">Quincenal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {frequency === 'monthly' 
                ? 'El monto se prorrateará a la mitad por quincena'
                : 'Se descontará el monto completo cada quincena'
              }
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Eliminar
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar Cambios' : 'Agregar Factura'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

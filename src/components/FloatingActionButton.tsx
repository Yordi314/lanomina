import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn('fab', className)}
      aria-label="Agregar"
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </button>
  );
}

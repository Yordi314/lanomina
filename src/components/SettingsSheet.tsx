import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SettingsSheetProps {
  onClose: () => void;
  onResetData: () => void;
}

export function SettingsSheet({ onClose, onResetData }: SettingsSheetProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onResetData();
    onClose();
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
          <h2 className="text-headline">Configuración</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-6">
          
          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-label text-destructive">Zona de Peligro</h3>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full p-4 border border-destructive/20 bg-destructive/5 rounded-xl flex items-center justify-between text-destructive hover:bg-destructive/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Borrar todos los datos</span>
                </div>
              </button>
            ) : (
              <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="font-medium text-sm">¿Estás seguro? Esta acción es irreversible.</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleDelete}
                  >
                    Sí, borrar todo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Safe area */}
        <div className="h-8" />
      </div>
    </div>
  );
}

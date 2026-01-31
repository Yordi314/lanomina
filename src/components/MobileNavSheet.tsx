import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface MobileNavSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: NavItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function MobileNavSheet({
    open,
    onOpenChange,
    items,
    activeTab,
    onTabChange,
}: MobileNavSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0">
                <SheetHeader className="p-6 border-b text-left">
                    <SheetTitle className="text-xl font-semibold tracking-tight">
                        Mi<span className="text-savings">Nómina</span>
                    </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {items.map(item => {
                            const Icon = item.icon;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            onTabChange(item.id);
                                            onOpenChange(false);
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                                            activeTab === item.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </SheetContent>
        </Sheet>
    );
}

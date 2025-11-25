import { Button } from "../ui/button";
import { BarChart3, CreditCard, Settings, Plus, Home } from "lucide-react";
import { cn } from "../../lib/utils";

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onAddExpense: () => void;
}

export function BottomNavigation({ currentTab, onTabChange, onAddExpense }: BottomNavigationProps) {
  const navItems = [
    { id: "", label: "Home", icon: Home },
    { id: "expenses", label: "Expenses", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="relative flex items-center justify-around px-1 py-2">
        {navItems.map((item, index) => (
          <div key={item.id || 'home'} className="flex-1 relative">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full flex-col h-12 gap-1 text-xs",
                currentTab === item.id && "text-primary bg-primary/10"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
            {index === 2 && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={onAddExpense}
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
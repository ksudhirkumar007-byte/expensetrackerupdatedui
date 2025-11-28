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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 border-t border-purple-200 dark:border-purple-800 md:hidden shadow-lg">
      <div className="relative flex items-center justify-around px-1 py-2">
        {navItems.map((item, index) => (
          <div key={item.id || 'home'} className="flex-1 relative">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full flex-col h-12 gap-1 text-xs transition-all duration-200",
                currentTab === item.id 
                  ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md" 
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
            {index === 2 && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={onAddExpense}
                  size="icon"
                  className="h-14 w-20 rounded-full shadow-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 transition-all duration-200 border-4 border-white dark:border-gray-900"
                >
                  <Plus className="h-8 w-8" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
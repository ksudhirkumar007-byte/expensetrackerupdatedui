import { useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu, PlusCircle, Settings, TrendingUp, Home } from "lucide-react";
import { Badge } from "../ui/badge";

interface MobileHeaderProps {
  totalExpenses: number;
  onAddExpense: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileHeader({ 
  totalExpenses, 
  onAddExpense, 
  currentTab, 
  onTabChange 
}: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "categories", label: "Categories", icon: Settings },
  ];

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-4">Menu</h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentTab === item.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        onTabChange(item.id);
                        setIsOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <div>
            <h1 className="text-xl font-bold">Expense Tracker</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                ₹{totalExpenses.toFixed(0)}
              </Badge>
            </div>
          </div>
        </div>

        <Button 
          onClick={onAddExpense}
          size="sm"
          className="shadow-lg"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}
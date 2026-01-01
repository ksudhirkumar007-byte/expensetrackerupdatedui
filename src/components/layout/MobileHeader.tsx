import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu, PlusCircle, Settings, TrendingUp, Home, BarChart3, RefreshCw, Wifi, WifiOff, LogOut } from "lucide-react";
import { Badge } from "../ui/badge";

interface MobileHeaderProps {
  onAddExpense: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  hasPendingChanges: boolean;
  isOnline: boolean;
  lastSync: Date | null;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function MobileHeader({ 
  onAddExpense, 
  currentTab, 
  onTabChange,
  onSync,
  isSyncing,
  hasPendingChanges,
  isOnline,
  lastSync,
  onLogout,
  onRefresh,
  isRefreshing
}: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: "categories", label: "Categories", icon: Settings },
    { id: "historical", label: "Historical Analytics", icon: BarChart3 },
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
                        if (item.id === "historical") {
                          navigate("/historical");
                        } else {
                          onTabChange(item.id);
                        }
                        setIsOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                  
                  <div className="border-t pt-2 mt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-green-600"
                      onClick={() => {
                        onRefresh();
                        setIsOpen(false);
                      }}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh Tokens
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600"
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          
          <div>
            <h1 className="text-xl font-bold">Expense Tracker</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span>{isOnline ? "Online" : "Offline"}</span>
              {lastSync && (
                <span>Last sync: {lastSync.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={onSync}
            size="sm"
            variant="outline"
            disabled={isSyncing || !isOnline}
            className="shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
            {hasPendingChanges && <Badge variant="destructive" className="ml-1 h-2 w-2 p-0" />}
          </Button>

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
    </div>
  );
}
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ExpenseStatsProps {
  totalExpenses: number;
  avgDaily: number;
  transactionCount: number;
  budgetRemaining: number;
}

export function ExpenseStats({
  totalExpenses,
  avgDaily,
  transactionCount,
  budgetRemaining,
}: ExpenseStatsProps) {
  const isOverBudget = budgetRemaining < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Spent
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-2">
                ₹{totalExpenses.toFixed(2)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-chart-1/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-chart-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Daily
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-2">
                ₹{avgDaily.toFixed(2)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Transactions
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-2">
                {transactionCount}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-chart-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={isOverBudget ? "border-destructive" : "border-success"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isOverBudget ? "Over Budget" : "Remaining"}
              </p>
              <h3
                className={`text-2xl font-bold mt-2 ${
                  isOverBudget ? "text-destructive" : "text-success"
                }`}
              >
                ₹{Math.abs(budgetRemaining).toFixed(2)}
              </h3>
            </div>
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                isOverBudget ? "bg-destructive/10" : "bg-success/10"
              }`}
            >
              <DollarSign
                className={`h-6 w-6 ${
                  isOverBudget ? "text-destructive" : "text-success"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

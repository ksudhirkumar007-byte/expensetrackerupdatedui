import { Category, CategoryStats } from "../../types/expense";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { AlertCircle, CheckCircle } from "lucide-react";

interface BudgetProgressProps {
  stats: CategoryStats[];
  onCategoryClick?: (categoryId: number) => void;
}

export function BudgetProgress({ stats, onCategoryClick }: BudgetProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No budget data available
          </p>
        ) : (
          stats.map((stat) => {
            const isOverBudget = stat.percentage > 100;
            const isNearLimit = stat.percentage > 80 && stat.percentage <= 100;

            return (
              <div 
                key={stat.category.id} 
                className={`space-y-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                  onCategoryClick ? 'hover:shadow-sm' : ''
                }`}
                onClick={() => onCategoryClick?.(stat.category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {stat.category.name}
                    </span>
                    {isOverBudget && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    {!isOverBudget && stat.percentage > 50 && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isOverBudget
                        ? "text-destructive"
                        : isNearLimit
                        ? "text-warning"
                        : "text-muted-foreground"
                    }`}
                  >
                    ₹{stat.spent.toFixed(2)} / ₹
                    {stat.category.budget.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={Math.min(stat.percentage, 100)}
                  className={`h-2 ${
                    isOverBudget
                      ? "[&>*]:bg-destructive"
                      : isNearLimit
                      ? "[&>*]:bg-warning"
                      : "[&>*]:bg-success"
                  }`}
                />
                <div className="flex justify-between text-xs">
                  <span
                    className={
                      isOverBudget
                        ? "text-destructive"
                        : isNearLimit
                        ? "text-warning"
                        : "text-muted-foreground"
                    }
                  >
                    {stat.percentage.toFixed(0)}% used
                  </span>
                  {!isOverBudget && (
                    <span className="text-muted-foreground">
                      ₹{stat.remaining.toFixed(2)} left
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

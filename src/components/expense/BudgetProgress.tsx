import { Category, CategoryStats } from "../../types/expense";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AlertCircle, CheckCircle } from "lucide-react";

interface BudgetProgressProps {
  stats: CategoryStats[];
  selectedType?: "all" | "fixed" | "variable";
  onTypeChange?: (type: "all" | "fixed" | "variable") => void;
}

export function BudgetProgress({ stats, selectedType = "all", onTypeChange }: BudgetProgressProps) {
  const filteredStats = stats.filter((stat) => 
    selectedType === "all" || stat.category.type === selectedType
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Budget Overview</CardTitle>
          {onTypeChange && (
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {stats.length === 0 ? "No budget data available" : "No categories match the selected filter."}
          </p>
        ) : (
          filteredStats.map((stat) => {
            const isOverBudget = stat.percentage > 100;
            const isNearLimit = stat.percentage > 80 && stat.percentage <= 100;

            return (
              <div key={stat.category.id} className="space-y-2">
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

import { Expense, Category } from "../../types/expense";
import { ExpenseCard } from "./ExpenseCard";
import { TrendingDown } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function ExpenseList({
  expenses,
  categories,
  onDelete,
  isLoading,
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingDown className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No expenses found
        </h3>
        <p className="text-muted-foreground">
          Add your first expense to get started tracking your spending
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const category = categories.find((c) => c.id === expense.category_id);
        return (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            category={category}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}

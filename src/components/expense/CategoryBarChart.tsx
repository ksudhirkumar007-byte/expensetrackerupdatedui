import { useMemo } from "react";
import { Expense, Category } from "../../types/expense";
import { TrendingDown } from "lucide-react";

interface CategoryBarChartProps {
  expenses: Expense[];
  categories: Category[];
}

export function CategoryBarChart({ expenses, categories }: CategoryBarChartProps) {
  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const categoryId = expense.category_id;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += expense.amount;
      return acc;
    }, {} as Record<number, number>);

    const maxAmount = Math.max(...Object.values(grouped));
    
    return Object.entries(grouped)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === parseInt(categoryId));
        return {
          categoryId: parseInt(categoryId),
          categoryName: category?.name || 'Unknown',
          amount,
          percentage: maxAmount > 0 ? (amount / maxAmount) * 100 : 0,
          expenseCount: expenses.filter(e => e.category_id === parseInt(categoryId)).length
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, categories]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingDown className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No expenses found
        </h3>
        <p className="text-muted-foreground">
          Add your first expense to see the category breakdown chart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
          🏷️ Category Breakdown Chart
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your spending by category
        </p>
      </div>
      
      <div className="px-2 sm:px-4 overflow-x-auto">
        <div className="flex items-end  gap-1 sm:gap-2 h-48 pt-8">
          {categoryData.map((category, index) => (
            <div key={category.categoryId} className="flex flex-col justify-end items-center gap-2 flex-1 min-w-12 sm:min-w-16 max-w-16 sm:max-w-20 h-full">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                ₹{category.amount.toFixed(0)}
              </div>
              <div  
                className="w-8 sm:w-10 bg-gradient-to-t from-green-500 to-emerald-600 rounded-t-lg transition-all duration-500 ease-out min-h-2"
                style={{ height: `${Math.max(category.percentage * 1.5, 8)}px` }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1 sm:gap-2 mt-2">
          {categoryData.map((category, index) => (
            <div key={`label-${category.categoryId}`} className="flex flex-col items-center gap-1 flex-1 min-w-12 sm:min-w-16 max-w-16 sm:max-w-20">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center truncate w-full">
                {category.categoryName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {category.expenseCount} spends
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Categories: {categoryData.length}
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Total: ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
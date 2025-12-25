import { useMemo } from "react";
import { Expense, Category } from "../../types/expense";
import { TrendingDown } from "lucide-react";

interface ExpenseBarChartProps {
  expenses: Expense[];
  categories: Category[];
  onDateClick?: (date: string) => void;
}

export function ExpenseBarChart({ expenses, categories, onDateClick }: ExpenseBarChartProps) {
  const dailyData = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    const maxAmount = Math.max(...Object.values(grouped));
    
    return sortedEntries.map(([date, amount]) => ({
      date,
      amount,
      percentage: maxAmount > 0 ? (amount / maxAmount) * 100 : 0,
      formattedDate: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingDown className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No expenses found
        </h3>
        <p className="text-muted-foreground">
          Add your first expense to see the daily spending chart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
          📊 Daily Spending Chart
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your spending pattern over time
        </p>
      </div>
      
      <div className="px-4 sm:px-6 overflow-x-auto">
        <div className="flex items-end gap-1 sm:gap-2 h-48 pt-8">
          {dailyData.map((day, index) => (
            <div key={day.date} className="flex flex-col justify-end items-center gap-2 flex-1 min-w-12 sm:min-w-16 max-w-16 sm:max-w-20 h-full">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                ₹{day.amount.toFixed(0)}
              </div>
              <div 
                className={`w-8 sm:w-10 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all duration-500 ease-out min-h-2 ${
                  onDateClick ? 'cursor-pointer hover:from-blue-600 hover:to-purple-700' : ''
                }`}
                style={{ height: `${Math.max(day.percentage * 1.5, 8)}px` }}
                onClick={() => onDateClick?.(day.date)}
              />
            </div>
          ))}
        </div>
        <div className="flex  gap-1 sm:gap-2 mt-2">
          {dailyData.map((day, index) => (
            <div key={`label-${day.date}`} className="flex flex-col items-center gap-1 flex-1 min-w-12 sm:min-w-16 max-w-16 sm:max-w-20">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center truncate w-full">
                {day.formattedDate}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {expenses.filter(e => e.date === day.date).length} spends
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total Days: {dailyData.length}
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Total: ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
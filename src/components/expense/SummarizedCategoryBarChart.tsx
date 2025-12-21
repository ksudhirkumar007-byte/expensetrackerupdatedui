import { useMemo, useState, useEffect } from "react";
import { Expense, Category, MonthSummary } from "../../types/expense";
import { TrendingDown, Calendar } from "lucide-react";
import { expenseApi } from "../../lib/api";
import { categoryApi } from "../../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface SummarizedCategoryBarChartProps {
  monthSummaries: MonthSummary[];
  expenseTypeFilter: "all" | "fixed" | "variable";
  onExpenseTypeChange: (value: "all" | "fixed" | "variable") => void;
}

export function SummarizedCategoryBarChart({ monthSummaries, expenseTypeFilter, onExpenseTypeChange }: SummarizedCategoryBarChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [summarizedExpenses, setSummarizedExpenses] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMonth) {
      fetchSummarizedData(selectedMonth);
    }
  }, [selectedMonth]);

  const fetchSummarizedData = async (month: string) => {
    setLoading(true);
    try {
      const response = await categoryApi.summarisedRecords(month);
      console.log(response.data);
      setSummarizedExpenses(response.data);
    } catch (error) {
      console.error('Error fetching summarized data:', error);
      setSummarizedExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    for (let i = 1; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const displayName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value: monthStr, label: displayName });
    }
    return months;
  }, []);

  const categoryData = useMemo(() => {
    const filteredExpenses = expenseTypeFilter === "all" 
      ? summarizedExpenses 
      : summarizedExpenses.filter(exp => exp.type === expenseTypeFilter);
    
    const grouped = filteredExpenses.reduce((acc, MonthSummary) => {
      const categoryName = MonthSummary.categoryName;
     
      if (!acc[categoryName]) {
        acc[categoryName] = MonthSummary.totalSpent?MonthSummary.totalSpent:0;
      }
      return acc;
    }, {} as Record<string, number>);

    const maxAmount = Math.max(...Object.values(grouped));
    
    return Object.entries(grouped)
      .map(([categoryName, amount]) => {
       // console.log(categoryName);
       // const monthSummary = monthSummaries.find(c => c.categoryName === categoryName);
       // console.log(monthSummary?.categoryName);
        return {
          categoryName: categoryName || 'Unknown',
          amount,
          percentage: maxAmount > 0 ? (amount / maxAmount) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [summarizedExpenses, monthSummaries, expenseTypeFilter]);

  if (!selectedMonth) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                📊 Historical Category Breakdown
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View summarized spending by category from previous months
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Select a month to view data
          </h3>
          <p className="text-muted-foreground">
            Choose a previous month to see the summarized category breakdown
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading summarized data...</p>
        </div>
      </div>
    );
  }

  if (summarizedExpenses.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                📊 Historical Category Breakdown
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View summarized spending by category from previous months
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="text-center py-16">
          <TrendingDown className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No data found
          </h3>
          <p className="text-muted-foreground">
            No summarized expenses found for the selected month
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
              📊 Historical Category Breakdown
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Summarized spending by category for {monthOptions.find(m => m.value === selectedMonth)?.label}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={expenseTypeFilter} onValueChange={onExpenseTypeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="fixed">Fixed</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
              </SelectContent>
            </Select>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 overflow-x-auto">
        <div className="flex items-end gap-1 sm:gap-2 h-48 pt-8 pl-2">
          {categoryData.map((category, index) => (
            <div key={category.categoryName} className="flex flex-col justify-end items-center gap-2 flex-1 min-w-12 sm:min-w-16 max-w-16 sm:max-w-20 h-full">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                ₹{category.amount.toFixed(0)}
              </div>
              <div  
                className="w-8 sm:w-10 bg-gradient-to-t from-orange-500 to-red-600 rounded-t-lg transition-all duration-500 ease-out min-h-2"
                style={{ height: `${Math.max(category.percentage * 1.5, 8)}px` }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1 sm:gap-2 mt-2">
          {categoryData.map((category, index) => (
            <div key={`label-${category.categoryName}`} className="flex flex-col items-center gap-1 flex-1 min-w-12 sm:min-w-16 max-w-16 sm:max-w-20">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center truncate w-full">
                {category.categoryName}
              </div>
              
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Categories: {categoryData.length} ({expenseTypeFilter})
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Total: ₹{categoryData.reduce((sum, cat) => sum + cat.amount, 0).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
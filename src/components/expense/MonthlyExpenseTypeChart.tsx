import { useMemo, useState, useEffect } from "react";
import { MonthSummary } from "../../types/expense";
import { TrendingUp, Calendar } from "lucide-react";
import { categoryApi } from "../../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface MonthlyExpenseTypeChartProps {
  expenseTypeFilter: "all" | "fixed" | "variable";
}

interface MonthlyData {
  month: string;
  amount: number;
}

export function MonthlyExpenseTypeChart({ expenseTypeFilter }: MonthlyExpenseTypeChartProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyData();
  }, [expenseTypeFilter]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const data: MonthlyData[] = [];
      const currentDate = new Date();
      
      for (let i = 1; i <= 6; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        try {
          const response = await categoryApi.summarisedRecords(monthStr);
          const filteredData = expenseTypeFilter === "all" 
            ? response.data 
            : response.data.filter((item: MonthSummary) => item.type === expenseTypeFilter);
          
          const totalAmount = filteredData.reduce((sum: number, item: MonthSummary) => 
            sum + (item.totalSpent || 0), 0);
          
          data.push({
            month: monthStr,
            amount: totalAmount
          });
        } catch (error) {
          data.push({ month: monthStr, amount: 0 });
        }
      }
      
      setMonthlyData(data.reverse());
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (monthlyData.length === 0) return [];
    
    const maxAmount = Math.max(...monthlyData.map(d => d.amount));
    
    return monthlyData.map(data => ({
      ...data,
      percentage: maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0,
    }));
  }, [monthlyData]);

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading monthly data...</p>
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
              📊 Monthly Spending by Type
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total spending per month for {expenseTypeFilter === "all" ? "all expense types" : `${expenseTypeFilter} expenses`}
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 overflow-x-auto">
        <div className="flex items-end gap-3 sm:gap-4 h-48 pt-8 pl-2">
          {chartData.map((data, index) => (
            <div key={data.month} className="flex flex-col justify-end items-center gap-2 flex-1 min-w-16 sm:min-w-20 max-w-20 sm:max-w-24 h-full">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">
                ₹{data.amount.toFixed(0)}
              </div>
              <div  
                className="w-10 sm:w-12 bg-gradient-to-t from-green-500 to-emerald-600 rounded-t-lg transition-all duration-500 ease-out min-h-2"
                style={{ height: `${Math.max(data.percentage * 1.5, 8)}px` }}
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                {data.month}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Last 6 months ({expenseTypeFilter})
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            Total: ₹{monthlyData.reduce((sum, data) => sum + data.amount, 0).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
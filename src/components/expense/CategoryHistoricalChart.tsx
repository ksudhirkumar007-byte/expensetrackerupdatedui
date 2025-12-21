import { useMemo, useState, useEffect } from "react";
import { Category } from "../../types/expense";
import { TrendingUp, Calendar } from "lucide-react";
import { categoryApi } from "../../lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface CategoryHistoricalChartProps {
  categories: Category[];
}

interface HistoricalData {
  month: string;
  amount: number;
}

export function CategoryHistoricalChart({ categories }: CategoryHistoricalChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
const [totalAmount, setTotalAmount] = useState(0);
var total =0;
  useEffect(() => {
    if (selectedCategory) {
      fetchHistoricalData(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchHistoricalData = async (categoryName: string) => {
    setLoading(true);
    try {
      const response = await categoryApi.summarisedCategories(categoryName);
      const monthSummaryRecords = response.data;
      console.log("category data is "+response.data);

      const data: HistoricalData[] = [];
      total = 0;
      
      if (monthSummaryRecords && Array.isArray(monthSummaryRecords)) {
        monthSummaryRecords.forEach((record: any) => {
          //const monthStr = new Date(record.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          data.push({
            month: record.month,
            amount: record.totalSpent || 0
          });
          total += record.totalSpent || 0;
        });
      }
      
      setTotalAmount(total);
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setHistoricalData([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (historicalData.length === 0) return [];
    
    const maxAmount = Math.max(...historicalData.map(d => d.amount));
    
    return historicalData.map(data => ({
      ...data,
      percentage: maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0,
    }));
  }, [historicalData]);

  if (!selectedCategory) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                📈 Category Historical Trend
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View spending trends for a specific category over the last 6 months
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
        </div>
        <div className="text-center py-16">
          <TrendingUp className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Select a category to view trends
          </h3>
          <p className="text-muted-foreground">
            Choose a category to see its spending pattern over the last 6 months
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
          <p className="text-gray-600 dark:text-gray-400">Loading historical data...</p>
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
              📈 Category Historical Trend
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Spending trend for "{selectedCategory}" over the last 6 months
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                className="w-10 sm:w-12 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all duration-500 ease-out min-h-2"
                style={{ height: `${Math.max(data.percentage * 1.5, 8)}px` }}
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                {data.month}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>total amount is : {totalAmount}</div>
      <div>Average spent is : {historicalData.length > 0 ? Math.round(totalAmount / historicalData.length) : 0}</div>
    </div>
  );
}
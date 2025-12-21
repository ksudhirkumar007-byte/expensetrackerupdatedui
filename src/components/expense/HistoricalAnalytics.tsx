import { useCategories } from "../../hooks/use-categories";
import { SummarizedCategoryBarChart } from "./SummarizedCategoryBarChart";
import { MonthlyExpenseTypeChart } from "./MonthlyExpenseTypeChart";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { CategoryHistoricalChart } from "./CategoryHistoricalChart";
import { useState } from "react";

export default function HistoricalAnalytics() {
  const { categories, isLoading } = useCategories();
  const navigate = useNavigate();
  const [expenseTypeFilter, setExpenseTypeFilter] = useState<"all" | "fixed" | "variable">("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                📊 Historical Analytics
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mt-2">
                View summarized spending patterns from previous months
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                📊 Historical Analytics
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Previous months breakdown
              </p>
            </div>
          </div>
        </div>

        <SummarizedCategoryBarChart 
          monthSummaries={[]} 
          expenseTypeFilter={expenseTypeFilter}
          onExpenseTypeChange={setExpenseTypeFilter}
        />
        <div className="mt-8">
          <MonthlyExpenseTypeChart expenseTypeFilter={expenseTypeFilter} />
        </div>
         <CategoryHistoricalChart
        categories={categories}
      />
      </div>
      
     
    </div>
  );
}
import { useMemo, useState } from "react";
import { Expense, Category } from "../../types/expense";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AnalyticsProps {
  expenses: Expense[];
  categories: Category[];
}

export function Analytics({ expenses, categories }: AnalyticsProps) {
  const [selectedType, setSelectedType] = useState<"all" | "fixed" | "variable">("all");

  const filteredExpenses = useMemo(() => {
    if (selectedType === "all") return expenses;
    
    const filteredCategoryIds = categories
      .filter(cat => cat.type === selectedType)
      .map(cat => cat.id);
    
    return expenses.filter(exp => filteredCategoryIds.includes(exp.category_id));
  }, [expenses, categories, selectedType]);

  const analytics = useMemo(() => {
    const expensesToAnalyze = filteredExpenses;
    const dayWise = expensesToAnalyze.reduce<Record<string, number>>((acc, exp) => {
      const dateObj = new Date(exp.date);
      const dayName = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      acc[dayName] = (acc[dayName] || 0) + exp.amount;
      return acc;
    }, {});

    const categoryWise = expensesToAnalyze.reduce<Record<number, number>>((acc, exp) => {
      acc[exp.category_id] = (acc[exp.category_id] || 0) + exp.amount;
      return acc;
    }, {});

    const sortedDayWise = Object.entries(dayWise).sort((a, b) => {
      const dateA = new Date(
        expensesToAnalyze.find(
          (e) =>
            new Date(e.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }) === a[0]
        )?.date || ""
      );
      const dateB = new Date(
        expensesToAnalyze.find(
          (e) =>
            new Date(e.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }) === b[0]
        )?.date || ""
      );
      return dateB.getTime() - dateA.getTime();
    });

    const uniqueDays = new Set(expensesToAnalyze.map((e) => e.date)).size;
    const avgDaily = uniqueDays > 0 ? expensesToAnalyze.reduce((sum, e) => sum + e.amount, 0) / uniqueDays : 0;

    const highestDay: [string, number] =
      sortedDayWise.length > 0
        ? sortedDayWise.reduce((max, curr) => (curr[1] > max[1] ? curr : max), sortedDayWise[0])
        : ["N/A", 0];

    const topCategoryId = Object.entries(categoryWise).reduce(
      (max, curr) => (curr[1] > max[1] ? curr : max),
      ["0", 0] as [string, number]
    );
    const topCategory = categories.find((c) => c.id === parseInt(topCategoryId[0]));

    return {
      dayWise: sortedDayWise,
      categoryWise: Object.entries(categoryWise)
        .map(([id, amount]) => ({
          category: categories.find((c) => c.id === parseInt(id)),
          amount,
        }))
        .filter((item) => item.category)
        .sort((a, b) => b.amount - a.amount),
      avgDaily,
      highestDay,
      topCategory: topCategory ? [topCategory.name, topCategoryId[1] as number] as [string, number] : ["N/A", 0] as [string, number],
    };
  }, [filteredExpenses, categories]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Expense Type:</label>
        <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="variable">Variable</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.avgDaily.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Spending Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.highestDay[1].toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{analytics.highestDay[0]}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Top Spending Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{analytics.topCategory[0]}</span>
            <span className="text-2xl font-bold">₹{analytics.topCategory[1].toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Daily Spending Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.dayWise.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.dayWise.slice(0, 7).map(([day, amount]) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm">{day}</span>
                  <span className="font-semibold">₹{amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.categoryWise.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.categoryWise.map((item) => (
                <div key={item.category?.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-chart-1" />
                    <span className="text-sm">{item.category?.name}</span>
                  </div>
                  <span className="font-semibold">₹{item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

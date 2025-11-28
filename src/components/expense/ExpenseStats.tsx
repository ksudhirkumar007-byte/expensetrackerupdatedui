import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ExpenseStatsProps {
  totalExpenses: number;
  budgetRemaining: number;
}

export function ExpenseStats({
  totalExpenses,
  budgetRemaining,
}: ExpenseStatsProps) {
  const isOverBudget = budgetRemaining < 0;

  const statsData = [
    {
      title: "Total Spent",
      value: `₹${totalExpenses.toFixed(0)}`,
      icon: TrendingDown,
      gradient: "from-slate-600 to-slate-700",
      bgGradient: "from-slate-50 to-gray-100 dark:from-slate-800/30 dark:to-gray-800/30",
      iconBg: "bg-gradient-to-r from-slate-500 to-slate-600",
      emoji: "💸"
     },
    // {
    //   title: "Daily Average",
    //   value: `₹${avgDaily.toFixed(0)}`,
    //   icon: Calendar,
    //   gradient: "from-blue-400 to-cyan-500",
    //   bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    //   iconBg: "bg-gradient-to-r from-blue-400 to-cyan-500",
    //   emoji: "📅"
    // },
    // {
    //   title: "Transactions",
    //   value: transactionCount.toString(),
    //   icon: BarChart3,
    //   gradient: "from-purple-400 to-indigo-500",
    //   bgGradient: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
    //   iconBg: "bg-gradient-to-r from-purple-400 to-indigo-500",
    //   emoji: "📊"
    // },
    {
      title: isOverBudget ? "Over Budget" : "Remaining",
      value: `₹${Math.abs(budgetRemaining).toFixed(0)}`,
      icon: DollarSign,
      gradient: isOverBudget ? "from-red-600 to-red-700" : "from-emerald-600 to-emerald-700",
      bgGradient: isOverBudget 
        ? "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30" 
        : "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30",
      iconBg: isOverBudget 
        ? "bg-gradient-to-r from-red-500 to-red-600" 
        : "bg-gradient-to-r from-emerald-500 to-emerald-600",
      emoji: isOverBudget ? "⚠️" : "💰"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card 
            key={stat.title}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
          >
            <CardContent className="p-6 relative">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full transform translate-x-6 -translate-y-6`}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stat.emoji}</span>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      {stat.title}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {index === 0 && "This month"}
                      {index === 1 && (isOverBudget ? "Exceeded" : "Available")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

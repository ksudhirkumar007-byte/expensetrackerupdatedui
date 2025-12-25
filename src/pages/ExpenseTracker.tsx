import { useState, useMemo } from "react";
import { useExpenses } from "../hooks/use-expenses";
import { useCategories } from "../hooks/use-categories";
import { useSync } from "../hooks/use-sync";
import { ExpenseStats } from "../components/expense/ExpenseStats";
import { BudgetProgress } from "../components/expense/BudgetProgress";
import { ExpenseFilters } from "../components/expense/ExpenseFilters";
import { ExpenseList } from "../components/expense/ExpenseList";
import { AddExpenseForm } from "../components/expense/AddExpenseForm";
import { CategoryManager } from "../components/expense/CategoryManager";
import { CategoryList } from "../components/expense/CategoryList";
import { Analytics } from "../components/expense/Analytics";
import { MobileHeader } from "../components/layout/MobileHeader";
import { BottomNavigation } from "../components/layout/BottomNavigation";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { PlusCircle, Loader2, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { CategoryStats } from "../types/expense";

export default function ExpenseTracker() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  const { expenses, isLoading: expensesLoading, addExpense, deleteExpense, isAdding } = useExpenses(selectedMonth);
  const {
    categories,
    isLoading: categoriesLoading,
    addCategory,
    deleteCategory,
    updateCategory,
    summariseAndUpdateMonth,
    isSummarising,
  } = useCategories();
  const { sync, isSyncing, lastSync, hasPendingChanges, isOnline } = useSync();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentTab, setCurrentTab] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Independent filter states for each tab
  const [homeFilters, setHomeFilters] = useState({
    globalExpenseType: "variable" as "all" | "fixed" | "variable",
    selectedMonth: new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  });
  
  const [expensesFilters, setExpensesFilters] = useState({
    selectedCategory: "all",
    selectedType: "all" as "all" | "fixed" | "variable",
    selectedMonth: new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    selectedDate: "" as string, // New date filter
  });
  
  const [analyticsFilters, setAnalyticsFilters] = useState({
    globalExpenseType: "all" as "all" | "fixed" | "variable",
    selectedMonth: new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    selectedCategory: "all"
  });

  const [categoriesFilters, setCategoriesFilters] = useState({
    selectedType: "all" as "all" | "fixed" | "variable"
  });

  // Independent filtering logic for each tab
  const homeFilteredCategories = useMemo(() => {
    return categories.filter((cat) => 
      homeFilters.globalExpenseType === "all" || cat.type === homeFilters.globalExpenseType
    );
  }, [categories, homeFilters.globalExpenseType]);

  const homeFilteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const cat = categories.find((c) => c.id === exp.category_id);
      if (!cat) return false;
      return homeFilters.globalExpenseType === "all" || cat.type === homeFilters.globalExpenseType;
    });
  }, [expenses, categories, homeFilters.globalExpenseType]);

  const expensesFilteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const cat = categories.find((c) => c.id === exp.category_id);
      if (!cat) return false;

      const matchesType = expensesFilters.selectedType === "all" || cat.type === expensesFilters.selectedType;
      const matchesCategory = expensesFilters.selectedCategory === "all" || cat.id.toString() === expensesFilters.selectedCategory;
      const matchesDate = expensesFilters.selectedDate === "" || exp.date === expensesFilters.selectedDate;

      return matchesType && matchesCategory && matchesDate;
    });
  }, [expenses, categories, expensesFilters]);

  const analyticsFilteredCategories = useMemo(() => {
    return categories.filter((cat) => 
      analyticsFilters.globalExpenseType === "all" || cat.type === analyticsFilters.globalExpenseType
    );
  }, [categories, analyticsFilters.globalExpenseType]);

  const analyticsFilteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const cat = categories.find((c) => c.id === exp.category_id);
      if (!cat) return false;

      const matchesGlobalType = analyticsFilters.globalExpenseType === "all" || cat.type === analyticsFilters.globalExpenseType;
      const matchesCategory = analyticsFilters.selectedCategory === "all" || cat.id.toString() === analyticsFilters.selectedCategory;

      return matchesGlobalType && matchesCategory;
    });
  }, [expenses, categories, analyticsFilters]);

  const categoriesFilteredCategories = useMemo(() => {
    return categories.filter((cat) => 
      categoriesFilters.selectedType === "all" || cat.type === categoriesFilters.selectedType
    );
  }, [categories, categoriesFilters.selectedType]);

  // Legacy variables for backward compatibility (used in home/stats)
  const globalFilteredCategories = homeFilteredCategories;
  const filteredExpenses = homeFilteredExpenses;

  const categoryStats: CategoryStats[] = useMemo(() => {
    return globalFilteredCategories.map((cat) => {
      const spent = expenses
        .filter((exp) => exp.category_id === cat.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      const remaining = cat.budget - spent;
      const percentage = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
      return { category: cat, spent, remaining, percentage };
    });
  }, [globalFilteredCategories, expenses]);

  const totalBudget = globalFilteredCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetRemaining = totalBudget - totalExpenses;

  const handleDateClick = (date: string) => {
    // Set expenses filters to show only expenses for the selected date
    setExpensesFilters(prev => ({
      ...prev,
      selectedCategory: "all", // Reset category filter
      selectedType: "all", // Reset type filter
      selectedDate: date, // Set specific date
      selectedMonth: selectedMonth // Keep current month
    }));
    
    // Switch to expenses tab
    setCurrentTab("expenses");
  };

  const handleCategoryClick = (categoryId: number) => {
    // Set expenses filters to show only the selected category
    setExpensesFilters(prev => ({
      ...prev,
      selectedCategory: categoryId.toString(),
      selectedType: "all", // Reset type filter
      selectedDate: "", // Clear date filter
      selectedMonth: selectedMonth // Use current selected month
    }));
    
    // Switch to expenses tab
    setCurrentTab("expenses");
  };
  const uniqueDays = new Set(filteredExpenses.map((e) => e.date)).size;
  const avgDaily = uniqueDays > 0 ? totalExpenses / uniqueDays : 0;

  const handleAddExpense = (data: any) => {
    addExpense(data);
    setShowAddForm(false);
  };

  if (expensesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader
         
          onAddExpense={() => setShowAddForm(true)}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onSync={sync}
          isSyncing={isSyncing}
          hasPendingChanges={hasPendingChanges()}
          isOnline={isOnline}
          lastSync={lastSync}
        />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Expense Tracker
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Take control of your finances with intelligent spending insights
            </p>
            {!showAddForm && (
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Expense
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="container mx-auto px-4 max-w-7xl">
          <AddExpenseForm
            categories={globalFilteredCategories}
            onSubmit={handleAddExpense}
            onCancel={() => setShowAddForm(false)}
            isSubmitting={isAdding}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20 md:pb-8 max-w-7xl">
        {/* Global Filter - Desktop */}
        <div className="hidden md:flex justify-center mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between p-6 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Filters</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customize your view</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {showFilters ? 'Hide' : 'Show'}
                </span>
                {showFilters ? 
                  <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : 
                  <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                }
              </div>
            </div>
            
            {/* Filter Content */}
            {showFilters && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">📊 Expense Type:</span>
                  </div>
                  <Select value={homeFilters.globalExpenseType} onValueChange={(value: "all" | "fixed" | "variable") => setHomeFilters(prev => ({...prev, globalExpenseType: value}))}>
                    <SelectTrigger className="w-[160px] border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white/50 dark:bg-gray-700/50 font-medium">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-purple-200">
                      <SelectItem value="all" className="font-medium">🌟 All Types</SelectItem>
                      <SelectItem value="fixed" className="font-medium">🏠 Fixed</SelectItem>
                      <SelectItem value="variable" className="font-medium">💫 Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters - Show only when no tab is selected */}
        {!currentTab && (
          <div className="md:hidden mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
            {/* Mobile Filter Toggle Button */}
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Filters</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tap to customize</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {showFilters ? 'Hide' : 'Show'}
                </span>
                {showFilters ? 
                  <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                }
              </div>
            </div>
            
            {/* Mobile Filter Content */}
            {showFilters && (
              <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span className="text-base">📊</span>
                    Expense Type
                  </label>
                  <Select value={homeFilters.globalExpenseType} onValueChange={(value: "all" | "fixed" | "variable") => setHomeFilters(prev => ({...prev, globalExpenseType: value}))}>
                    <SelectTrigger className="w-full border-2 border-blue-200 focus:border-blue-500 rounded-xl bg-white/70 dark:bg-gray-700/70 font-medium h-12">
                      <SelectValue placeholder="Select Expense Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-blue-200">
                      <SelectItem value="all" className="font-medium py-3">🌟 All Types</SelectItem>
                      <SelectItem value="fixed" className="font-medium py-3">🏠 Fixed Expenses</SelectItem>
                      <SelectItem value="variable" className="font-medium py-3">💫 Variable Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span className="text-base">📅</span>
                    Time Period
                  </label>
                  <Select value={homeFilters.selectedMonth} onValueChange={(month: string) => setHomeFilters(prev => ({...prev, selectedMonth: month}))}>
                    <SelectTrigger className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white/70 dark:bg-gray-700/70 font-medium h-12">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-purple-200">
                      {(() => {
                        const options = [];
                        const currentDate = new Date();
                        for (let i = 0; i < 12; i++) {
                          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                          const value = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                          const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                          options.push({ value, label });
                        }
                        return options.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="font-medium py-3">
                            📆 {option.label}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats - Show only when no tab is selected */}
        {!currentTab && (
          <div className="mb-8">
            <ExpenseStats
              totalExpenses={totalExpenses}
              budgetRemaining={budgetRemaining}
            />
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-gray-700/30">
              <Tabs value={currentTab || ""} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100/80 dark:bg-gray-700/80 rounded-2xl p-2 mb-8">
                  <TabsTrigger value="" className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200">🏠 Home</TabsTrigger>
                  <TabsTrigger value="expenses" className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200">💳 Expenses</TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200">📈 Analytics</TabsTrigger>
                  <TabsTrigger value="categories" className="rounded-xl font-semibold data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-200">🏷️ Categories</TabsTrigger>
                </TabsList>
              
              <TabsContent value="expenses" className="space-y-6 mt-6">
                {/* Expenses Filter Component */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden">
                  <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Filter className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Expense Filters</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Filter expenses by category, type & date</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {showFilters ? 'Hide' : 'Show'}
                      </span>
                      {showFilters ? 
                        <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      }
                    </div>
                  </div>
                  
                  {showFilters && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <ExpenseFilters
                        categories={categories}
                        selectedCategory={expensesFilters.selectedCategory}
                        selectedType={expensesFilters.selectedType}
                        selectedMonth={expensesFilters.selectedMonth}
                        onCategoryChange={(value) => setExpensesFilters(prev => ({...prev, selectedCategory: value}))}
                        onTypeChange={(value) => setExpensesFilters(prev => ({...prev, selectedType: value}))}
                        onMonthChange={(value) => setExpensesFilters(prev => ({...prev, selectedMonth: value}))}
                      />
                    </div>
                  )}
                </div>
                
                <ExpenseList
                  expenses={expensesFilteredExpenses}
                  categories={categories}
                  onDelete={deleteExpense}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                {/* Analytics Filter Component */}
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden">
                  <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Filter className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Analytics Filters</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Customize analytics data view</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {showFilters ? 'Hide' : 'Show'}
                      </span>
                      {showFilters ? 
                        <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      }
                    </div>
                  </div>
                  
                  {showFilters && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Expense Type</label>
                          <Select value={analyticsFilters.globalExpenseType} onValueChange={(value: "all" | "fixed" | "variable") => setAnalyticsFilters(prev => ({...prev, globalExpenseType: value}))}>
                            <SelectTrigger className="w-full border border-gray-300 focus:border-green-400 rounded-lg">
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">🌟 All Types</SelectItem>
                              <SelectItem value="fixed">🏠 Fixed</SelectItem>
                              <SelectItem value="variable">💫 Variable</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📅 Time Period</label>
                          <Select value={analyticsFilters.selectedMonth} onValueChange={(month: string) => setAnalyticsFilters(prev => ({...prev, selectedMonth: month}))}>
                            <SelectTrigger className="w-full border border-gray-300 focus:border-green-400 rounded-lg">
                              <SelectValue placeholder="Select Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {(() => {
                                const options = [];
                                const currentDate = new Date();
                                for (let i = 0; i < 12; i++) {
                                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                                  const value = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                                  const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                                  options.push({ value, label });
                                }
                                return options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    📆 {option.label}
                                  </SelectItem>
                                ));
                              })()}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">🏷️ Category</label>
                          <Select value={analyticsFilters.selectedCategory} onValueChange={(value) => setAnalyticsFilters(prev => ({...prev, selectedCategory: value}))}>
                            <SelectTrigger className="w-full border border-gray-300 focus:border-green-400 rounded-lg">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">🌟 All Categories</SelectItem>
                              {analyticsFilteredCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Analytics expenses={analyticsFilteredExpenses} categories={analyticsFilteredCategories} onDateClick={handleDateClick} />
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
                <div className="space-y-6">
                  {/* Categories Filter */}
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden">
                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                          <Filter className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Category Filters</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Filter categories by type</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {showFilters ? 'Hide' : 'Show'}
                        </span>
                        {showFilters ? 
                          <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        }
                      </div>
                    </div>
                    
                    {showFilters && (
                      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <span className="text-base">📊</span>
                            Expense Type
                          </label>
                          <Select value={categoriesFilters.selectedType} onValueChange={(value: "all" | "fixed" | "variable") => setCategoriesFilters(prev => ({...prev, selectedType: value}))}>
                            <SelectTrigger className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl bg-white/70 dark:bg-gray-700/70 font-medium h-12">
                              <SelectValue placeholder="Select Expense Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2 border-purple-200">
                              <SelectItem value="all" className="font-medium py-3">🌟 All Types</SelectItem>
                              <SelectItem value="fixed" className="font-medium py-3">🏠 Fixed Expenses</SelectItem>
                              <SelectItem value="variable" className="font-medium py-3">💫 Variable Expenses</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <CategoryManager onAddCategory={addCategory} />
                  <CategoryList
                    categories={categoriesFilteredCategories}
                    onDeleteCategory={deleteCategory}
                    onUpdateCategory={updateCategory}
                    onSummariseAndUpdateMonth={summariseAndUpdateMonth}
                    isSummarising={isSummarising}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>
              </TabsContent>

              <TabsContent value="" className="mt-6">
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">📊 Dashboard Overview</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Your complete financial summary at a glance</p>
                </div>
              </TabsContent>
            </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/30 dark:border-gray-700/30">
              <BudgetProgress stats={categoryStats} onCategoryClick={handleCategoryClick} />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Mobile Tab Content */}
          {currentTab === "expenses" && (
            <div className="space-y-4">
              {/* Mobile Expenses Filter */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Filter className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Filters</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Tap to filter expenses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {showFilters ? 'Hide' : 'Show'}
                    </span>
                    {showFilters ? 
                      <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    }
                  </div>
                </div>
                
                {showFilters && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <ExpenseFilters
                      categories={categories}
                      selectedCategory={expensesFilters.selectedCategory}
                      selectedType={expensesFilters.selectedType}
                      selectedMonth={expensesFilters.selectedMonth}
                      onCategoryChange={(value) => setExpensesFilters(prev => ({...prev, selectedCategory: value}))}
                      onTypeChange={(value) => setExpensesFilters(prev => ({...prev, selectedType: value}))}
                      onMonthChange={(value) => setExpensesFilters(prev => ({...prev, selectedMonth: value}))}
                    />
                  </div>
                )}
              </div>
              
              <ExpenseList
                expenses={expensesFilteredExpenses}
                categories={categories}
                onDelete={deleteExpense}
              />
            </div>
          )}

          {currentTab === "analytics" && (
            <div className="space-y-4">
              {/* Mobile Analytics Filter */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Filter className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Analytics Filters</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Customize data view</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {showFilters ? 'Hide' : 'Show'}
                    </span>
                    {showFilters ? 
                      <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    }
                  </div>
                </div>
                
                {showFilters && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Expense Type</label>
                      <Select value={analyticsFilters.globalExpenseType} onValueChange={(value: "all" | "fixed" | "variable") => setAnalyticsFilters(prev => ({...prev, globalExpenseType: value}))}>
                        <SelectTrigger className="w-full border border-gray-300 focus:border-green-400 rounded-lg h-10">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">🌟 All Types</SelectItem>
                          <SelectItem value="fixed">🏠 Fixed</SelectItem>
                          <SelectItem value="variable">💫 Variable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📅 Time Period</label>
                      <Select value={analyticsFilters.selectedMonth} onValueChange={(month: string) => setAnalyticsFilters(prev => ({...prev, selectedMonth: month}))}>
                        <SelectTrigger className="w-full border border-gray-300 focus:border-green-400 rounded-lg h-10">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const options = [];
                            const currentDate = new Date();
                            for (let i = 0; i < 12; i++) {
                              const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                              const value = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                              const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                              options.push({ value, label });
                            }
                            return options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                📆 {option.label}
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
              
              <Analytics expenses={analyticsFilteredExpenses} categories={analyticsFilteredCategories} onDateClick={handleDateClick} />
            </div>
          )}

          {currentTab === "categories" && (
            <div className="space-y-6">
              <CategoryManager onAddCategory={addCategory} />
              <CategoryList
                categories={categoriesFilteredCategories}
                onDeleteCategory={deleteCategory}
                onUpdateCategory={updateCategory}
                onSummariseAndUpdateMonth={summariseAndUpdateMonth}
                isSummarising={isSummarising}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          )}

          {/* Mobile Home View - Show budget progress when no tab selected */}
           {!currentTab && (
            <div className="space-y-6">
              <BudgetProgress stats={categoryStats} onCategoryClick={handleCategoryClick} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onAddExpense={() => setShowAddForm(true)}
      />
    </div>
  );
}

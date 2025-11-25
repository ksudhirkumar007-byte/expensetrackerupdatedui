import { useState, useMemo } from "react";
import { useExpenses } from "../hooks/use-expenses";
import { useCategories } from "../hooks/use-categories";
import { ExpenseStats } from "../components/expense/ExpenseStats";
import { BudgetProgress } from "../components/expense/BudgetProgress";
import { ExpenseFilters } from "../components/expense/ExpenseFilters";
import { ExpenseList } from "../components/expense/ExpenseList";
import { AddExpenseForm } from "../components/expense/AddExpenseForm";
import { CategoryManager } from "../components/expense/CategoryManager";
import { CategoryList } from "../components/expense/CategoryList";
import { Analytics } from "../components/expense/Analytics";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { CategoryStats } from "../types/expense";

export default function ExpenseTracker() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
     const month = new Date(now.getFullYear(), now.getMonth(), 1);

    const year = month.getFullYear().toString().slice(-2);
    return `${monthNames[month.getMonth()]}-${year}`;
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
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "fixed" | "variable">("all");
  const [globalExpenseType, setGlobalExpenseType] = useState<"all" | "fixed" | "variable">("all");

  const globalFilteredCategories = useMemo(() => {
    return categories.filter((cat) => 
      globalExpenseType === "all" || cat.type === globalExpenseType
    );
  }, [categories, globalExpenseType]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const cat = categories.find((c) => c.id === exp.category_id);
      if (!cat) return false;

      const matchesGlobalType = globalExpenseType === "all" || cat.type === globalExpenseType;
      const matchesType = selectedType === "all" || cat.type === selectedType;
      const matchesCategory = selectedCategory === "all" || cat.id.toString() === selectedCategory;

      return matchesGlobalType && matchesType && matchesCategory;
    });
  }, [expenses, categories, selectedCategory, selectedType, globalExpenseType]);

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
  const budgetRemaining = totalBudget - expenses.reduce((sum, exp) => sum + exp.amount, 0);
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Expense Tracker</h1>
              <p className="text-muted-foreground mt-2">Manage your spending and budgets</p>
            </div>
            <CategoryManager onAddCategory={addCategory} />
          </div>
          
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Expense Type:</span>
              <Select value={globalExpenseType} onValueChange={(value: "all" | "fixed" | "variable") => setGlobalExpenseType(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ExpenseStats
            totalExpenses={totalExpenses}
            avgDaily={avgDaily}
            transactionCount={filteredExpenses.length}
            budgetRemaining={budgetRemaining}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="expenses" className="space-y-6 mt-6">
                <ExpenseFilters
                  categories={globalFilteredCategories}
                  selectedCategory={selectedCategory}
                  selectedType={selectedType}
                  selectedMonth={selectedMonth}
                  onCategoryChange={setSelectedCategory}
                  onTypeChange={setSelectedType}
                  onMonthChange={setSelectedMonth}
                />

                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)} className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Expense
                  </Button>
                )}

                {showAddForm && (
                  <AddExpenseForm
                    categories={globalFilteredCategories}
                    onSubmit={handleAddExpense}
                    onCancel={() => setShowAddForm(false)}
                    isSubmitting={isAdding}
                  />
                )}

                <ExpenseList
                  expenses={filteredExpenses}
                  categories={categories}
                  onDelete={deleteExpense}
                />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <Analytics expenses={filteredExpenses} categories={globalFilteredCategories} />
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
            <CategoryList
              categories={globalFilteredCategories}
              onDeleteCategory={deleteCategory}
              onUpdateCategory={updateCategory}
              onSummariseAndUpdateMonth={summariseAndUpdateMonth}
              isSummarising={isSummarising}
            />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <BudgetProgress stats={categoryStats} />
          </div>
        </div>
      </div>
    </div>
  );
}

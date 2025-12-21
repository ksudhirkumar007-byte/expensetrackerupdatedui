export interface Category {
  id: number;
  name: string;
  budget: number;
  type: "fixed" | "variable";
  icon?: string;
  month?: string;
  totalSpent?:number;
}
export interface MonthSummary {
  id: number;
  categoryName: string;
  budget: number;
  type: "fixed" | "variable";
  icon?: string;
  month?: string;
  totalSpent?:number;
}
export interface Expense {
  id: number;
  amount: number;
  category_id: number;
  description: string;
  date: string;
  month: string
}

export interface CategoryStats {
  category: Category;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Analytics {
  totalExpenses: number;
  avgDaily: number;
  transactionCount: number;
  highestDay: [string, number];
  topCategory: [string, number];
  dayWise: [string, number][];
  categoryWise: [string, number][];
}

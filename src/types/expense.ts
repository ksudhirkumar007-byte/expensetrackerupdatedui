export interface Category {
  id: number;
  name: string;
  budget: number;
  type: "fixed" | "variable";
  icon?: string;
  month?: string;
}

export interface Expense {
  id: number;
  amount: number;
  category_id: number;
  description: string;
  date: string;
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

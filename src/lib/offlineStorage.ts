import { Expense, Category, MonthSummary } from "../types/expense";
import { expenseApi, categoryApi } from "./api";

const STORAGE_KEYS = {
  EXPENSES: 'expenses',
  CATEGORIES: 'categories',
  MONTH_SUMMARIES: 'monthSummaries',
  LAST_SYNC: 'lastSync',
  PENDING_SYNC: 'pendingSync'
};

export { STORAGE_KEYS };

interface PendingSync {
  expenses: {
    create: Expense[];
    update: Expense[];
    delete: number[];
  };
  categories: {
    create: Category[];
    update: Category[];
    delete: number[];
  };
}

export const offlineStorage = {
  // Expenses
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  addExpense: (expense: Expense) => {
    const expenses = offlineStorage.getExpenses();
    const newExpense = { ...expense, id: Date.now() };
    expenses.push(newExpense);
    offlineStorage.saveExpenses(expenses);
    offlineStorage.addToPendingSync('expenses', 'create', newExpense);
    return newExpense;
  },

  updateExpense: (id: number, expense: Expense) => {
    const expenses = offlineStorage.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expense, id };
      offlineStorage.saveExpenses(expenses);
      offlineStorage.addToPendingSync('expenses', 'update', expenses[index]);
    }
  },

  deleteExpense: (id: number) => {
    const expenses = offlineStorage.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    offlineStorage.saveExpenses(filtered);
    offlineStorage.addToPendingSync('expenses', 'delete', id);
  },

  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory: (category: Category) => {
    const categories = offlineStorage.getCategories();
    const newCategory = { ...category, id: Date.now() };
    categories.push(newCategory);
    offlineStorage.saveCategories(categories);
    offlineStorage.addToPendingSync('categories', 'create', newCategory);
    return newCategory;
  },

  updateCategory: (id: number, category: Category) => {
    const categories = offlineStorage.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...category, id };
      offlineStorage.saveCategories(categories);
      offlineStorage.addToPendingSync('categories', 'update', categories[index]);
    }
  },

  deleteCategory: (id: number) => {
    const categories = offlineStorage.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    offlineStorage.saveCategories(filtered);
    offlineStorage.addToPendingSync('categories', 'delete', id);
  },

  // Month Summaries
  getMonthSummaries: (): MonthSummary[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MONTH_SUMMARIES);
    return data ? JSON.parse(data) : [];
  },

  saveMonthSummaries: (summaries: MonthSummary[]) => {
    localStorage.setItem(STORAGE_KEYS.MONTH_SUMMARIES, JSON.stringify(summaries));
  },

  // Sync Management
  getPendingSync: (): PendingSync => {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return data ? JSON.parse(data) : {
      expenses: { create: [], update: [], delete: [] },
      categories: { create: [], update: [], delete: [] }
    };
  },

  addToPendingSync: (type: 'expenses' | 'categories', action: 'create' | 'update' | 'delete', data: any) => {
    const pending = offlineStorage.getPendingSync();
    if (action === 'delete') {
      pending[type][action].push(data);
    } else {
      pending[type][action].push(data);
    }
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
  },

  clearPendingSync: () => {
    localStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  },

  getLastSync: (): Date | null => {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return data ? new Date(data) : null;
  },

  setLastSync: (date: Date) => {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
  },

  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Sync function
  sync: async (): Promise<{ success: boolean; message: string }> => {
    if (!offlineStorage.isOnline()) {
      return { success: false, message: "No internet connection" };
    }

    try {
      const pending = offlineStorage.getPendingSync();

      // Sync expenses
      for (const expense of pending.expenses.create) {
        await expenseApi.create(expense);
      }
      for (const expense of pending.expenses.update) {
        await expenseApi.update(expense.id, expense);
      }
      for (const id of pending.expenses.delete) {
        await expenseApi.delete(id);
      }

      // Sync categories
      for (const category of pending.categories.create) {
        await categoryApi.create(category);
      }
      for (const category of pending.categories.update) {
        await categoryApi.update(category.id, category);
      }
      for (const id of pending.categories.delete) {
        await categoryApi.delete(id);
      }

      // Fetch latest data from server and merge with local data
      const [expensesRes, categoriesRes] = await Promise.all([
        expenseApi.getAll(),
        categoryApi.getAll()
      ]);

      // Update local storage with server data
      offlineStorage.saveExpenses(expensesRes.data);
      offlineStorage.saveCategories(categoriesRes.data);

      // Clear pending sync since we've synced everything
      offlineStorage.clearPendingSync();
      offlineStorage.setLastSync(new Date());

      return { success: true, message: "Sync completed successfully" };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || "Sync failed" };
    }
  }
};
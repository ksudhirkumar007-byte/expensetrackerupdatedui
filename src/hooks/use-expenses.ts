import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "../lib/api";
import { offlineStorage, STORAGE_KEYS } from "../lib/offlineStorage";
import { Expense } from "../types/expense";
import { toast } from "sonner";

export function useExpenses(month?: string) {
  const queryClient = useQueryClient();

  const {
    data: expenses = [],
    isLoading,
    error,
  } = useQuery<Expense[]>({
    queryKey: ["expenses", month],
    queryFn: async () => {
      // Try to get from offline storage first
      const offlineExpenses = offlineStorage.getExpenses();
      if (offlineExpenses.length > 0) {
        return offlineExpenses.filter(expense => 
          !month || expense.month === month
        );
      }
      
      // If no offline data, try to fetch from API
      if (offlineStorage.isOnline()) {
        try {
          const { data } = await expenseApi.getAll(month);
          offlineStorage.saveExpenses(data);
          return data;
        } catch (error) {
          // If API fails, return empty array
          return [];
        }
      }
      
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Always save locally first (offline-first approach)
      const newExpense = offlineStorage.addExpense(data);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });

      // Try to sync immediately if online
      if (offlineStorage.isOnline()) {
        try {
          await expenseApi.create(newExpense);
          // If successful, remove from pending sync
          const pending = offlineStorage.getPendingSync();
          pending.expenses.create = pending.expenses.create.filter(e => e.id !== newExpense.id);
          localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
          // Keep in pending sync for later
          console.log('Failed to sync, will retry later');
        }
      }

      return { data: newExpense };
    },
    onSuccess: () => {
      toast.success("Expense added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Always delete locally first
      offlineStorage.deleteExpense(id);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });

      // Try to sync immediately if online
      if (offlineStorage.isOnline()) {
        try {
          await expenseApi.delete(id);
          // If successful, remove from pending sync
          const pending = offlineStorage.getPendingSync();
          pending.expenses.delete = pending.expenses.delete.filter(deleteId => deleteId !== id);
          localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
          // Keep in pending sync for later
          console.log('Failed to sync, will retry later');
        }
      }

      return { data: null };
    },
    onSuccess: () => {
      toast.success("Expense deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Always update locally first
      offlineStorage.updateExpense(id, data);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });

      // Try to sync immediately if online
      if (offlineStorage.isOnline()) {
        try {
          await expenseApi.update(id, data);
          // If successful, remove from pending sync
          const pending = offlineStorage.getPendingSync();
          pending.expenses.update = pending.expenses.update.filter(e => e.id !== id);
          localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
          // Keep in pending sync for later
          console.log('Failed to sync, will retry later');
        }
      }

      return { data: null };
    },
    onSuccess: () => {
      toast.success("Expense updated successfully");
    },
    onError: () => {
      toast.error("Failed to update expense");
    },
  });

  return {
    expenses,
    isLoading,
    error,
    addExpense: createMutation.mutate,
    deleteExpense: deleteMutation.mutate,
    updateExpense: updateMutation.mutate,
    isAdding: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

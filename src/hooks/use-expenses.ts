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
      // Always get local data first for immediate display
      const offlineExpenses = offlineStorage.getExpenses();
      const filteredOffline = offlineExpenses.filter(expense => 
        !month || expense.month === month
      );

      // If online, fetch fresh data and update cache
      if (offlineStorage.isOnline()) {
        try {
          console.log('Fetching fresh data from API for month:', month);
          const { data } = await expenseApi.getAll(month);
          console.log('Fresh API data received:', data);
          
          // Merge server data with local pending changes
          const pending = offlineStorage.getPendingSync();
          const mergedData = [...data];
          
          // Add locally created expenses that haven't synced yet
          pending.expenses.create.forEach(localExpense => {
            if (!month || localExpense.month === month) {
              mergedData.push(localExpense);
            }
          });
          
          // Update cache with server data only
          offlineStorage.saveExpenses(data);
          return mergedData;
        } catch (error) {
          console.error('API failed, using cached data:', error);
        }
      }
      
      return filteredOffline;
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
          console.log('Making API call to create expense:', newExpense);
          const response = await expenseApi.create(newExpense);
          console.log('Create expense API response:', response);
          // If successful, remove from pending sync
          const pending = offlineStorage.getPendingSync();
          pending.expenses.create = pending.expenses.create.filter(e => e.id !== newExpense.id);
          localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
          // Keep in pending sync for later
          console.error('Failed to sync expense creation, will retry later:', error);
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

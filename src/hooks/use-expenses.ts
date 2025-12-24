import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "../lib/api";
import { offlineStorage } from "../lib/offlineStorage";
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
          !month || expense.date.includes(month)
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
      if (offlineStorage.isOnline()) {
        return await expenseApi.create(data);
      } else {
        // Offline: save locally
        const newExpense = offlineStorage.addExpense(data);
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        return { data: newExpense };
      }
    },
    onSuccess: () => {
      if (offlineStorage.isOnline()) {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        toast.success("Expense added successfully");
      } else {
        toast.success("Expense added locally (will sync when online)");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (offlineStorage.isOnline()) {
        return await expenseApi.delete(id);
      } else {
        // Offline: delete locally
        offlineStorage.deleteExpense(id);
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        return { data: null };
      }
    },
    onSuccess: () => {
      if (offlineStorage.isOnline()) {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        toast.success("Expense deleted successfully");
      } else {
        toast.success("Expense deleted locally (will sync when online)");
      }
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (offlineStorage.isOnline()) {
        return await expenseApi.update(id, data);
      } else {
        // Offline: update locally
        offlineStorage.updateExpense(id, data);
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        return { data: null };
      }
    },
    onSuccess: () => {
      if (offlineStorage.isOnline()) {
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        toast.success("Expense updated successfully");
      } else {
        toast.success("Expense updated locally (will sync when online)");
      }
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

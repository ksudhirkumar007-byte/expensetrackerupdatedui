import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "../lib/api";
import { Expense } from "../types/expense";
import { toast } from "sonner";

export function useExpenses() {
  const queryClient = useQueryClient();

  const {
    data: expenses = [],
    isLoading,
    error,
  } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await expenseApi.getAll();
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: expenseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add expense");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: expenseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      expenseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
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

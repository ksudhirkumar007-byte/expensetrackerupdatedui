import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../lib/api";
import { Category } from "../types/expense";
import { toast } from "sonner";

export function useCategories() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryApi.getAll();
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });


  const summariseAndUpdateMutation = useMutation({
    mutationFn: async (month: string) => {
      // Then summarise the month
      await categoryApi.summariseMonth(month);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Month summarised and categories updated successfully");
    },
    onError: () => {
      toast.error("Failed to summarise and update month");
    },
  });
  return {
    categories,
    isLoading,
    error,
    addCategory: createMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    updateCategory: updateMutation.mutate,
    summariseAndUpdateMonth: summariseAndUpdateMutation.mutate,
    isAdding: createMutation.isPending,
    isSummarising: summariseAndUpdateMutation.isPending,
  };
}

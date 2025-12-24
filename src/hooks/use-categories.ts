import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../lib/api";
import { offlineStorage } from "../lib/offlineStorage";
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
      // Try to get from offline storage first
      const offlineCategories = offlineStorage.getCategories();
      if (offlineCategories.length > 0) {
        return offlineCategories;
      }
      
      // If no offline data, try to fetch from API
      if (offlineStorage.isOnline()) {
        try {
          const { data } = await categoryApi.getAll();
          offlineStorage.saveCategories(data);
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
        return await categoryApi.create(data);
      } else {
        // Offline: save locally
        const newCategory = offlineStorage.addCategory(data);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        return { data: newCategory };
      }
    },
    onSuccess: () => {
      if (offlineStorage.isOnline()) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success("Category created successfully");
      } else {
        toast.success("Category created locally (will sync when online)");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (offlineStorage.isOnline()) {
        return await categoryApi.delete(id);
      } else {
        // Offline: delete locally
        offlineStorage.deleteCategory(id);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        return { data: null };
      }
    },
    onSuccess: () => {
      if (offlineStorage.isOnline()) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success("Category deleted successfully");
      } else {
        toast.success("Category deleted locally (will sync when online)");
      }
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (offlineStorage.isOnline()) {
        return await categoryApi.update(id, data);
      } else {
        // Offline: update locally
        offlineStorage.updateCategory(id, data);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        return { data: null };
      }
    },
    onSuccess: () => {
      if (offlineStorage.isOnline()) {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success("Category updated successfully");
      } else {
        toast.success("Category updated locally (will sync when online)");
      }
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

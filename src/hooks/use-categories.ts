import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../lib/api";
import { offlineStorage, STORAGE_KEYS } from "../lib/offlineStorage";
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
      // Always save locally first
      const newCategory = offlineStorage.addCategory(data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Try to sync immediately if online
      if (offlineStorage.isOnline()) {
        try {
          await categoryApi.create(newCategory);
          // If successful, remove from pending sync
          const pending = offlineStorage.getPendingSync();
          pending.categories.create = pending.categories.create.filter(c => c.id !== newCategory.id);
          localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
          // Keep in pending sync for later
          console.log('Failed to sync, will retry later');
        }
      }

      return { data: newCategory };
    },
    onSuccess: () => {
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // Always delete locally first
      offlineStorage.deleteCategory(id);
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Try to sync immediately if online
      if (offlineStorage.isOnline()) {
        try {
          await categoryApi.delete(id);
          // If successful, remove from pending sync
          const pending = offlineStorage.getPendingSync();
          pending.categories.delete = pending.categories.delete.filter(deleteId => deleteId !== id);
          localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
          // Keep in pending sync for later
          console.log('Failed to sync, will retry later');
        }
      }

      return { data: null };
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Always update locally first
      offlineStorage.updateCategory(id, data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Try to sync immediately if online
      if (offlineStorage.isOnline()) {
        try {
          await categoryApi.update(id, data);
          // If successful, remove from pending sync
          const pending = offlineStorage.getPendingSync();
          pending.categories.update = pending.categories.update.filter(c => c.id !== id);
          localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
        } catch (error) {
          // Keep in pending sync for later
          console.log('Failed to sync, will retry later');
        }
      }

      return { data: null };
    },
    onSuccess: () => {
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

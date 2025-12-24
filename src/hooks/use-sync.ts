import { useMutation } from "@tanstack/react-query";
import { offlineStorage } from "../lib/offlineStorage";
import { toast } from "sonner";

export function useSync() {
  const syncMutation = useMutation({
    mutationFn: offlineStorage.sync,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: any) => {
      toast.error("Sync failed: " + error.message);
    },
  });

  return {
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    lastSync: offlineStorage.getLastSync(),
    hasPendingChanges: () => {
      const pending = offlineStorage.getPendingSync();
      return (
        pending.expenses.create.length > 0 ||
        pending.expenses.update.length > 0 ||
        pending.expenses.delete.length > 0 ||
        pending.categories.create.length > 0 ||
        pending.categories.update.length > 0 ||
        pending.categories.delete.length > 0
      );
    },
    isOnline: offlineStorage.isOnline(),
  };
}
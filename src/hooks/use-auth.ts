import { useMutation } from "@tanstack/react-query";
import { authApi } from "../lib/api";
import { authStorage } from "../lib/auth";
import { toast } from "sonner";

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: async ({ email, passwordHash }: { email: string; passwordHash: string }) => {
      const response = await authApi.login(email, passwordHash);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Login successful, storing tokens."+data.accessToken+" and "+data.refreshToken);
      authStorage.setTokens(data.accessToken, data.refreshToken);
      toast.success("Login successful!");
      window.location.reload(); // Refresh to load authenticated app
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");
      const response = await authApi.refresh(refreshToken);
      return response.data;
    },
    onSuccess: (data) => {
      authStorage.setTokens(data.accessToken, data.refreshToken);
      toast.success("Tokens refreshed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Token refresh failed");
    },
  });

  const logout = () => {
    authStorage.clearTokens();
    toast.success("Logged out successfully!");
    window.location.reload();
  };

  return {
    login: loginMutation.mutate,
    refresh: refreshMutation.mutate,
    logout,
    isLoading: loginMutation.isPending,
    isRefreshing: refreshMutation.isPending,
    isAuthenticated: authStorage.isAuthenticated(),
  };
}
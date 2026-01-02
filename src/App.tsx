import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { authStorage } from "./lib/auth";
import ExpenseTracker from "./pages/ExpenseTracker";
import LoginPage from "./pages/LoginPage";
import HistoricalAnalytics from "./components/expense/HistoricalAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const isAuthenticated = authStorage.isAuthenticated();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/" element={<ExpenseTracker />} />
                <Route path="/historical" element={<HistoricalAnalytics />} />
              </>
            ) : (
              <Route path="*" element={<LoginPage />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

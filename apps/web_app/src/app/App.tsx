import { MainLayout } from "@/shared/layout/MainLayout";
import { AppRouter } from "./router";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { LanguageProvider } from "@/shared/context/LanguageContext";

import { BrowserRouter } from "react-router-dom";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <MainLayout>
              <AppRouter />
            </MainLayout>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


// Force Vite to reload

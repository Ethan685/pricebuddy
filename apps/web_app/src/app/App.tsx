import { AppRouter } from "./router";
import { MainLayout } from "@/shared/layout/MainLayout";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { LanguageProvider } from "@/shared/context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout>
          <AppRouter />
        </MainLayout>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;


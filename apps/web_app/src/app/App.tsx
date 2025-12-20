import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/shared/layout/MainLayout";
import { AppRouter } from "./router";

export default function App() {
  return (
    <MainLayout>
      <AppRouter />
    </MainLayout>
  );
}

// Force Vite to reload

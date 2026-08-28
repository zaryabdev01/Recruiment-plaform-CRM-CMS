import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { PagesListPage } from "@/pages/PagesListPage";
import { SectorsPage } from "@/pages/SectorsPage";
import { HomepagePage } from "@/pages/HomepagePage";
import { BannersPage } from "@/pages/BannersPage";
import { MediaLibraryPage } from "@/pages/MediaLibraryPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/pages" replace />} />
                <Route path="/pages" element={<PagesListPage />} />
                <Route path="/sectors" element={<SectorsPage />} />
                <Route path="/homepage" element={<HomepagePage />} />
                <Route path="/banners" element={<BannersPage />} />
                <Route path="/media" element={<MediaLibraryPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

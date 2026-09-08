import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ConsoleHomePage } from "@/pages/ConsoleHomePage";
import { PagesListPage } from "@/pages/PagesListPage";
import { SectorsPage } from "@/pages/SectorsPage";
import { HomepagePage } from "@/pages/HomepagePage";
import { BannersPage } from "@/pages/BannersPage";
import { MediaLibraryPage } from "@/pages/MediaLibraryPage";
import { CrmDashboardPage } from "@/pages/crm/CrmDashboardPage";
import { CrmRelationshipsPage } from "@/pages/crm/CrmRelationshipsPage";
import { CrmJobsPage } from "@/pages/crm/CrmJobsPage";
import { CrmTeamPage } from "@/pages/crm/CrmTeamPage";
import { RecruiterDashboardPage } from "@/pages/recruiter/RecruiterDashboardPage";
import { RecruiterTeamPage } from "@/pages/recruiter/RecruiterTeamPage";
import { RecruiterRelationshipsPage } from "@/pages/recruiter/RecruiterRelationshipsPage";
import { OrganisationsListPage } from "@/pages/recruiter/OrganisationsListPage";
import { OrganisationDetailPage } from "@/pages/recruiter/OrganisationDetailPage";
import { DecisionMakersListPage } from "@/pages/recruiter/DecisionMakersListPage";
import { CandidatesListPage } from "@/pages/recruiter/CandidatesListPage";
import { RecruiterLibraryPage } from "@/pages/recruiter/RecruiterLibraryPage";

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
                <Route index element={<ConsoleHomePage />} />

                {/* CRM — internal support desk */}
                <Route path="/crm" element={<CrmDashboardPage />} />
                <Route path="/crm/relationships" element={<CrmRelationshipsPage />} />
                <Route path="/crm/jobs" element={<CrmJobsPage />} />
                <Route path="/crm/team" element={<CrmTeamPage />} />

                {/* Recruiter portal (preview) */}
                <Route path="/recruiter" element={<RecruiterDashboardPage />} />
                <Route path="/recruiter/relationships" element={<RecruiterRelationshipsPage />} />
                <Route path="/recruiter/relationships/organisations" element={<OrganisationsListPage />} />
                <Route path="/recruiter/relationships/organisations/:id" element={<OrganisationDetailPage />} />
                <Route path="/recruiter/relationships/decision-makers" element={<DecisionMakersListPage />} />
                <Route path="/recruiter/relationships/candidates" element={<CandidatesListPage />} />
                <Route path="/recruiter/team" element={<RecruiterTeamPage />} />
                <Route path="/recruiter/library" element={<RecruiterLibraryPage />} />

                {/* CMS (existing — needs the backend) */}
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

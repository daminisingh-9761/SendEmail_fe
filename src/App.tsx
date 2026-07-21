import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import HistoryPage from "@/pages/HistoryPage";
import ApplicationDetailPage from "@/pages/ApplicationDetailPage";
import TopNavBar from "@/components/TopNavBar";
import BottomTabBar from "@/components/BottomTabBar";
import { Toaster } from "@/components/ui/toaster";
import LoginModal from "@/components/LoginModal";
import ResumeModal from "@/components/ResumeModal";
import InstallBanner from "@/components/InstallBanner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function App() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="min-h-screen flex flex-col bg-background safe-top">
      {isDesktop && <TopNavBar />}
      
      <main className={`flex-1 flex flex-col relative overflow-hidden ${!isDesktop ? "pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))]" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          </Route>
        </Routes>
      </main>
      {!isDesktop && <BottomTabBar />}
      {/* Global modals, driven by zustand state so they can be triggered from anywhere */}
      <LoginModal />
      <ResumeModal />
      <InstallBanner />
      <Toaster />
    </div>
  );
}

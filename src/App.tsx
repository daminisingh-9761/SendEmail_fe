import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import HistoryPage from "@/pages/HistoryPage";
import ApplicationDetailPage from "@/pages/ApplicationDetailPage";
import NavBar from "@/components/NavBar";
import { Toaster } from "@/components/ui/toaster";
import LoginModal from "@/components/LoginModal";
import ResumeModal from "@/components/ResumeModal";
import InstallBanner from "@/components/InstallBanner";


export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        </Routes>
      </main>
      {/* Global modals, driven by zustand state so they can be triggered from anywhere */}
      <LoginModal />
      <ResumeModal />
      <InstallBanner />
      <Toaster />
    </div>
  );
}

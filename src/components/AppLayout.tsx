import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import DirectoryPage from "@/pages/DirectoryPage";
import LocationsPage from "@/pages/LocationsPage";
import SettingsPage from "@/pages/SettingsPage";
import AppSidebar from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";
import QuickAddModal from "@/components/QuickAddModal";
import NotFound from "@/pages/NotFound";

const AppLayout = () => {
  const { user, loading } = useAuth();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar onNewContact={() => setQuickAddOpen(true)} />
      <main className="flex-1 min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <MobileNav onNewContact={() => setQuickAddOpen(true)} />
      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
};

export default AppLayout;

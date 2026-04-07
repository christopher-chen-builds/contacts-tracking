import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import AddContactForm from "@/components/AddContactForm";
import ContactList from "@/components/ContactList";
import AnalyticsTab from "@/components/AnalyticsTab";
import MessagesTab from "@/components/MessagesTab";
import ProfileTab from "@/components/ProfileTab";
import AuthPage from "@/pages/AuthPage";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "add" | "network" | "personal" | "analytics" | "messages" | "profile";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [bumpContactId, setBumpContactId] = useState<string | null>(null);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.12 }}
          >
            {activeTab === "add" && <AddContactForm />}
            {activeTab === "network" && <ContactList category="Network" onBump={(id) => { setBumpContactId(id); setActiveTab("messages"); }} />}
            {activeTab === "personal" && <ContactList category="Personal" onBump={(id) => { setBumpContactId(id); setActiveTab("messages"); }} />}
            {activeTab === "analytics" && <AnalyticsTab />}
            {activeTab === "messages" && <MessagesTab preselectedContactId={bumpContactId} />}
            {activeTab === "profile" && <ProfileTab />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

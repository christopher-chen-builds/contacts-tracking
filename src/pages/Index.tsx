import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import AddContactForm from "@/components/AddContactForm";
import ContactList from "@/components/ContactList";
import AnalyticsTab from "@/components/AnalyticsTab";

type Tab = "add" | "network" | "personal" | "analytics";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("add");

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
            {activeTab === "network" && <ContactList category="Network" />}
            {activeTab === "personal" && <ContactList category="Personal" />}
            {activeTab === "analytics" && <AnalyticsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

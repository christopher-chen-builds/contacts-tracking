import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, UserCircle, Settings, Database, LogOut } from "lucide-react";

const ProfileTab = () => {
  const { user, signOut } = useAuth();

  const rows = [
    { icon: UserCircle, label: "Edit Profile", sub: "Coming soon" },
    { icon: Settings, label: "App Settings", sub: "Coming soon" },
    { icon: Database, label: "Database Sync", sub: "Connected to Lovable Cloud", accent: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="px-4 pb-32"
    >
      <h1 className="text-display text-2xl text-foreground mb-4">Profile</h1>

      {/* User info card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <UserCircle size={28} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground font-semibold truncate">{user?.email}</p>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mt-0.5">
              CRM User
            </p>
          </div>
        </div>
      </div>

      {/* Action rows */}
      <div className="flex flex-col gap-3 mb-6">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Icon size={18} className={row.accent ? "text-green-400" : "text-primary"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm">{row.label}</p>
                <p className="text-muted-foreground text-xs">{row.sub}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 h-14 bg-card border border-destructive/30 rounded-2xl text-destructive font-semibold transition-all ease-snap duration-100"
      >
        <LogOut size={18} />
        Logout
      </motion.button>
    </motion.div>
  );
};

export default ProfileTab;

import { useAuth } from "@/contexts/AuthContext";
import { UserCircle, Database, LogOut } from "lucide-react";

const SettingsPage = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-display text-2xl text-foreground mb-6">Settings</h1>

      {/* User info */}
      <div className="bg-card border border-border rounded-lg p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center">
            <UserCircle size={22} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">CRM User</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 mb-4">
        <div className="flex items-center gap-3">
          <Database size={16} className="text-success shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Database Sync</p>
            <p className="text-xs text-muted-foreground">Connected to Lovable Cloud</p>
          </div>
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 h-11 bg-card border border-destructive/30 rounded-lg text-destructive font-medium text-sm transition-all hover:bg-destructive/5"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
};

export default SettingsPage;

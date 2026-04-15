import { Home, Users, MapPin, Settings, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onNewContact: () => void;
}

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/directory", icon: Users, label: "Directory" },
  { to: "/locations", icon: MapPin, label: "Locations" },
];

const AppSidebar = ({ onNewContact }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-[220px] h-screen bg-sidebar border-r border-sidebar-border shrink-0 sticky top-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-display text-base text-foreground tracking-tight">
          Contacts Directory
        </h1>
      </div>

      {/* Quick Add */}
      <div className="px-3 mb-4">
        <button
          onClick={onNewContact}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all"
        >
          <Plus size={16} />
          New Contact
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 mt-auto">
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === "/settings"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};

export default AppSidebar;

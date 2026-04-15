import { Home, Users, MapPin, Settings, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onNewContact: () => void;
}

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/directory", icon: Users, label: "Directory" },
  { to: "/locations", icon: MapPin, label: "Locations" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const MobileNav = ({ onNewContact }: MobileNavProps) => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {tabs.slice(0, 2).map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <NavLink key={tab.to} to={tab.to} className="flex flex-col items-center gap-0.5 flex-1">
              <tab.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{tab.label}</span>
            </NavLink>
          );
        })}

        {/* Center FAB */}
        <button
          onClick={onNewContact}
          className="w-12 h-12 -mt-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        >
          <Plus size={22} />
        </button>

        {tabs.slice(2).map((tab) => {
          const isActive = location.pathname === tab.to;
          return (
            <NavLink key={tab.to} to={tab.to} className="flex flex-col items-center gap-0.5 flex-1">
              <tab.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
              <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

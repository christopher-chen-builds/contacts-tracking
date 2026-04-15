import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, AlertTriangle, Sparkles, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, startOfMonth, isAfter } from "date-fns";
import ContactSlideOver from "@/components/ContactSlideOver";

interface Contact {
  id: string;
  name: string;
  company: string | null;
  city: string | null;
  date_of_last_connection: string | null;
  contact_method: string | null;
  comments: string | null;
  category: string;
  created_at: string;
}

const HomePage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("contacts").select("*").order("date_of_last_connection", { ascending: true, nullsFirst: true });
      setContacts((data as Contact[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const totalNetwork = contacts.filter((c) => c.category === "Network").length;
  const totalPersonal = contacts.filter((c) => c.category === "Personal").length;
  const overdue = contacts.filter((c) => {
    if (!c.date_of_last_connection) return true;
    return differenceInDays(new Date(), new Date(c.date_of_last_connection)) > 60;
  });
  const needsAttention = overdue.slice(0, 5);

  // City hubs
  const cityMap = new Map<string, number>();
  contacts.forEach((c) => {
    if (c.city) cityMap.set(c.city, (cityMap.get(c.city) || 0) + 1);
  });
  const topCities = Array.from(cityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-display text-2xl text-foreground mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Contacts", value: contacts.length, icon: Users, color: "text-primary" },
          { label: "Network", value: totalNetwork, icon: Briefcase, color: "text-primary" },
          { label: "Overdue Follow-ups", value: overdue.length, icon: AlertTriangle, color: "text-destructive" },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <kpi.icon size={16} className={kpi.color} />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</span>
            </div>
            <p className="text-data text-3xl text-foreground font-semibold">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Attention */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Needs Attention</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {needsAttention.length === 0 ? (
              <p className="p-5 text-muted-foreground text-sm">All contacts are up to date!</p>
            ) : (
              needsAttention.map((c) => {
                const days = c.date_of_last_connection
                  ? differenceInDays(new Date(), new Date(c.date_of_last_connection))
                  : null;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-foreground font-semibold text-sm shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.company || c.city || "No details"}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium shrink-0">
                      {days !== null ? `${days}d ago` : "Never"}
                    </span>
                    <Sparkles size={14} className="text-muted-foreground shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Network Hubs */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Network Hubs</h2>
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            {topCities.length === 0 ? (
              <p className="text-muted-foreground text-sm">No location data yet.</p>
            ) : (
              topCities.map(([city, count]) => (
                <div key={city} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{city}</span>
                  </div>
                  <span className="text-data text-xs text-muted-foreground font-medium">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ContactSlideOver contact={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default HomePage;

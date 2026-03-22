import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, isAfter, differenceInDays } from "date-fns";

interface Contact {
  id: string;
  name: string;
  city: string | null;
  category: string;
  created_at: string;
  date_of_last_connection: string | null;
}

interface CityBreakdown {
  city: string;
  network: number;
  personal: number;
}

const AnalyticsTab = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("contacts").select("id, name, city, category, created_at, date_of_last_connection");
      setContacts((data as Contact[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const newThisMonth = contacts.filter((c) => isAfter(new Date(c.created_at), monthStart)).length;
  const totalNetwork = contacts.filter((c) => c.category === "Network").length;
  const totalPersonal = contacts.filter((c) => c.category === "Personal").length;

  // Follow-up health: contacts with last connection > 30 days ago (or never)
  const overdueCount = contacts.filter((c) => {
    if (!c.date_of_last_connection) return true;
    return differenceInDays(now, new Date(c.date_of_last_connection)) > 30;
  }).length;

  // City breakdown
  const cityMap = new Map<string, { network: number; personal: number }>();
  contacts.forEach((c) => {
    const city = c.city || "Unknown";
    const existing = cityMap.get(city) || { network: 0, personal: 0 };
    if (c.category === "Network") existing.network++;
    else existing.personal++;
    cityMap.set(city, existing);
  });
  const cityBreakdown: CityBreakdown[] = Array.from(cityMap.entries())
    .map(([city, counts]) => ({ city, ...counts }))
    .sort((a, b) => b.network + b.personal - (a.network + a.personal))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="px-4 pt-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="px-4 pb-32"
    >
      <h1 className="text-display text-2xl text-foreground mb-4">Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">This Month</p>
          <p className="text-data text-3xl text-foreground">{newThisMonth}</p>
          <p className="text-muted-foreground text-xs mt-1">new entries</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Total</p>
          <p className="text-data text-3xl text-foreground">{contacts.length}</p>
          <p className="text-muted-foreground text-xs mt-1">contacts</p>
        </div>
      </div>

      {/* Follow-up Health */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Follow-up Health</p>
        <div className="flex items-baseline gap-2">
          <p className="text-data text-3xl text-foreground">{overdueCount}</p>
          <p className="text-destructive text-xs font-medium">overdue (30+ days)</p>
        </div>
        <p className="text-muted-foreground text-xs mt-1">contacts need a follow-up</p>
      </div>

      {/* Network vs Personal bar */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3">Breakdown</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-primary font-medium">Network</span>
              <span className="text-data text-foreground">{totalNetwork}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: contacts.length > 0 ? `${(totalNetwork / contacts.length) * 100}%` : "0%" }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground font-medium">Personal</span>
              <span className="text-data text-foreground">{totalPersonal}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: contacts.length > 0 ? `${(totalPersonal / contacts.length) * 100}%` : "0%" }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="h-full bg-muted-foreground rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Cities */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-4">Top Cities</p>
        {cityBreakdown.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {cityBreakdown.map((item) => (
              <div key={item.city} className="flex items-center justify-between">
                <span className="text-foreground text-sm font-medium truncate flex-1">{item.city}</span>
                <div className="flex gap-3 text-xs shrink-0">
                  <span className="text-primary text-data">{item.network}N</span>
                  <span className="text-muted-foreground text-data">{item.personal}P</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsTab;

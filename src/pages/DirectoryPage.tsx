import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
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

type Filter = "All" | "Network" | "Personal";

const DirectoryPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("contacts").select("*").order("name");
      setContacts((data as Contact[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter !== "All") list = list.filter((c) => c.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.comments && c.comments.toLowerCase().includes(q))
      );
    }
    return list;
  }, [contacts, filter, search]);

  const getStatusColor = (dateStr: string | null) => {
    if (!dateStr) return "bg-muted-foreground";
    const days = differenceInDays(new Date(), new Date(dateStr));
    if (days < 30) return "bg-success";
    if (days <= 60) return "bg-warning";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-display text-2xl text-foreground">Directory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} contacts</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(["All", "Network", "Personal"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2.5 bg-accent/50 text-xs uppercase tracking-wider text-muted-foreground font-medium border-b border-border">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Company</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Status</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-muted-foreground text-sm">
              {search ? "No matches found." : "No contacts yet."}
            </p>
          ) : (
            filtered.map((contact, i) => (
              <motion.button
                key={contact.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(contact)}
                className="w-full grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 hover:bg-accent/30 transition-colors text-left items-center"
              >
                <div className="sm:col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-foreground font-semibold text-xs shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{contact.name}</span>
                </div>
                <div className="sm:col-span-3 text-sm text-muted-foreground truncate pl-11 sm:pl-0">
                  {contact.company || "—"}
                </div>
                <div className="sm:col-span-2 pl-11 sm:pl-0">
                  {contact.city ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{contact.city}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
                <div className="sm:col-span-2 pl-11 sm:pl-0">
                  <span className="text-xs text-muted-foreground">{contact.category}</span>
                </div>
                <div className="sm:col-span-1 pl-11 sm:pl-0 flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(contact.date_of_last_connection)}`} />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      <ContactSlideOver contact={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default DirectoryPage;

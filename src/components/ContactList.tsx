import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Mail, Linkedin, Phone, Briefcase, User, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import ContactDetail from "./ContactDetail";

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

interface ContactListProps {
  category: "Network" | "Personal";
}

const methodIcon = (method: string | null) => {
  switch (method) {
    case "Email": return <Mail size={18} />;
    case "LinkedIn": return <Linkedin size={18} />;
    case "Phone Number": return <Phone size={18} />;
    default: return null;
  }
};

const CategoryIcon = ({ category }: { category: string }) =>
  category === "Network" ? <Briefcase size={18} /> : <User size={18} />;

const ContactList = ({ category }: ContactListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");

  const fetchContacts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });
    setContacts((data as Contact[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
    setSearch("");
  }, [category]);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  if (loading) {
    return (
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
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
      <h1 className="text-display text-2xl text-foreground mb-1">{category}</h1>
      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-4">
        {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
      </p>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, company or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {filtered.map((contact, i) => (
            <motion.button
              key={contact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.15 }}
              onClick={() => setSelected(contact)}
              className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border active:bg-surface-hover transition-colors ease-snap duration-150 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
                {contact.contact_method ? methodIcon(contact.contact_method) : <CategoryIcon category={category} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-base truncate">{contact.name}</p>
                <p className="text-muted-foreground text-xs truncate">
                  {[
                    contact.company,
                    contact.city,
                    contact.date_of_last_connection
                      ? format(new Date(contact.date_of_last_connection), "MMM d")
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" • ") || "No details"}
                </p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground shrink-0" />
            </motion.button>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {search ? "No matches found." : `No ${category.toLowerCase()} contacts yet.`}
          </div>
        )}
      </div>

      <ContactDetail contact={selected} onClose={() => setSelected(null)} />
    </motion.div>
  );
};

export default ContactList;

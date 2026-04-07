import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Contact {
  id: string;
  name: string;
  company: string | null;
  city: string | null;
  date_of_last_connection: string | null;
}

interface MessagesTabProps {
  preselectedContactId?: string | null;
}

const MessagesTab = ({ preselectedContactId }: MessagesTabProps = {}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [messageType, setMessageType] = useState<"email" | "linkedin" | null>(null);
  const [styleNotes, setStyleNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contactSearch, setContactSearch] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase
        .from("contacts")
        .select("id, name, company, city, date_of_last_connection")
        .order("name");
      setContacts((data as Contact[]) || []);
      setLoading(false);
    };
    fetchContacts();
  }, []);

  const selected = contacts.find((c) => c.id === selectedId) || null;

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.company && c.company.toLowerCase().includes(q));
  });

  const handleGenerate = async () => {
    if (!selected || !messageType) return;
    setGenerating(true);
    setDraft("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-followup", {
        body: {
          contactName: selected.name,
          company: selected.company,
          lastConnection: selected.date_of_last_connection
            ? format(new Date(selected.date_of_last_connection), "MMMM d, yyyy")
            : null,
          messageType,
          styleNotes: styleNotes.trim() || null,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "Generation failed", description: data.error, variant: "destructive" });
      } else {
        setDraft(data.text);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to generate message", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="px-4 pb-32"
    >
      <h1 className="text-display text-2xl text-foreground mb-1">Follow-up Generator</h1>
      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-6">
        AI-powered message drafts
      </p>

      {/* Contact Search & Select */}
      <label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
        Select Contact
      </label>
      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search contacts…"
          value={contactSearch}
          onChange={(e) => setContactSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>
      <select
        value={selectedId}
        onChange={(e) => {
          setSelectedId(e.target.value);
          setMessageType(null);
          setDraft("");
        }}
        className={`${inputClass} mb-5 ${!selectedId ? "text-muted-foreground" : ""}`}
      >
        <option value="">Choose a contact…</option>
        {filteredContacts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}{c.company ? ` — ${c.company}` : ""}
          </option>
        ))}
      </select>

      {/* Template Buttons */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
            Message Type
          </label>
          <div className="flex gap-3 mb-5">
            {([
              { key: "linkedin" as const, label: "LinkedIn (Short)" },
              { key: "email" as const, label: "Email (Detailed)" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => { setMessageType(t.key); setDraft(""); }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  messageType === t.key
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.3)]"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Style Notes */}
          <label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
            Custom Style Notes (optional)
          </label>
          <textarea
            placeholder="e.g. Make it sound like we just met at a coffee shop and keep it casual…"
            value={styleNotes}
            onChange={(e) => setStyleNotes(e.target.value)}
            rows={2}
            className={`${inputClass} resize-none mb-4`}
          />

          {/* Generate Button */}
          {messageType && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              disabled={generating}
              className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50 transition-all mb-4"
            >
              <Sparkles size={18} />
              {generating ? "Generating…" : "Generate Follow-up"}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Draft Output */}
      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-muted-foreground text-xs uppercase tracking-wider block">
            Generated Message
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            className={`${inputClass} resize-none`}
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="w-full h-12 bg-card border border-border text-foreground font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </motion.button>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-3 mt-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MessagesTab;

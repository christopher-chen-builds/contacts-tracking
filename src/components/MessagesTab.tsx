import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
  name: string;
  company: string | null;
  city: string | null;
}

const generateDraft = (contact: Contact, type: "email" | "linkedin") => {
  const name = contact.name.split(" ")[0];
  const company = contact.company ? ` at ${contact.company}` : "";
  const city = contact.city ? ` in ${contact.city}` : "";

  if (type === "email") {
    return `Hi ${name},\n\nI hope this message finds you well. It was great connecting with you${company}${city}. I wanted to follow up and see if there's an opportunity for us to catch up soon.\n\nLooking forward to hearing from you.\n\nBest regards`;
  }
  return `Hi ${name}, it was great connecting with you${company}${city}. Let's catch up soon! Would love to hear what you've been working on.`;
};

const MessagesTab = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [draftType, setDraftType] = useState<"email" | "linkedin" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("contacts")
        .select("id, name, company, city")
        .order("name");
      setContacts((data as Contact[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const selected = contacts.find((c) => c.id === selectedId) || null;
  const draft = selected && draftType ? generateDraft(selected, draftType) : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
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
        Draft a message for your contacts
      </p>

      {/* Contact Selector */}
      <label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">
        Select Contact
      </label>
      <select
        value={selectedId}
        onChange={(e) => {
          setSelectedId(e.target.value);
          setDraftType(null);
        }}
        className={`${inputClass} mb-5 ${!selectedId ? "text-muted-foreground" : ""}`}
      >
        <option value="">Choose a contact…</option>
        {contacts.map((c) => (
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
          className="flex gap-3 mb-5"
        >
          {(["email", "linkedin"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setDraftType(type)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                draftType === type
                  ? "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.3)]"
                  : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {type === "email" ? "Draft Email" : "Draft LinkedIn"}
            </button>
          ))}
        </motion.div>
      )}

      {/* Draft Area */}
      {draft && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <textarea
            value={draft}
            readOnly
            rows={7}
            className={`${inputClass} resize-none`}
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
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

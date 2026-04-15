import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Building2, MapPin, Calendar, Mail, Linkedin, Phone, MessageSquare, Copy, Check, Sparkles } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

interface ContactSlideOverProps {
  contact: Contact | null;
  onClose: () => void;
}

const methodIcon = (method: string | null) => {
  switch (method) {
    case "Email": return <Mail size={14} />;
    case "LinkedIn": return <Linkedin size={14} />;
    case "Phone Number": return <Phone size={14} />;
    default: return null;
  }
};

const ContactSlideOver = ({ contact, onClose }: ContactSlideOverProps) => {
  const [messageType, setMessageType] = useState<"email" | "linkedin" | null>(null);
  const [styleNotes, setStyleNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!contact || !messageType) return;
    setGenerating(true);
    setDraft("");
    try {
      const { data, error } = await supabase.functions.invoke("generate-followup", {
        body: {
          contactName: contact.name,
          company: contact.company,
          lastConnection: contact.date_of_last_connection
            ? format(new Date(contact.date_of_last_connection), "MMMM d, yyyy")
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
      toast({ title: "Error", description: err.message || "Failed to generate", variant: "destructive" });
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

  const handleClose = () => {
    setMessageType(null);
    setStyleNotes("");
    setDraft("");
    onClose();
  };

  const daysSince = contact?.date_of_last_connection
    ? differenceInDays(new Date(), new Date(contact.date_of_last_connection))
    : null;

  return (
    <AnimatePresence>
      {contact && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto shadow-2xl"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-display text-xl text-foreground">{contact.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-medium">
                      {contact.category}
                    </span>
                    {daysSince !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        daysSince < 30
                          ? "bg-success/10 text-success"
                          : daysSince <= 60
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {daysSince < 30 ? `${daysSince}d ago` : daysSince <= 60 ? "Due" : "Overdue"}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 -m-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                {contact.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground">{contact.company}</span>
                  </div>
                )}
                {contact.city && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground">{contact.city}</span>
                  </div>
                )}
                {contact.contact_method && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">{methodIcon(contact.contact_method)}</span>
                    <span className="text-foreground">{contact.contact_method}</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="border-t border-border pt-4 mb-6">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground/80">Created {format(new Date(contact.created_at), "MMM d, yyyy")}</span>
                  </div>
                  {contact.date_of_last_connection && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={14} className="text-muted-foreground shrink-0" />
                      <span className="text-foreground/80">Last connected {format(new Date(contact.date_of_last_connection), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              {contact.comments && (
                <div className="border-t border-border pt-4 mb-6">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Notes</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{contact.comments}</p>
                </div>
              )}

              {/* AI Follow-up Generator */}
              <div className="border-t border-border pt-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium flex items-center gap-2">
                  <Sparkles size={12} /> AI Follow-up
                </h3>

                <div className="flex gap-2 mb-3">
                  {([
                    { key: "linkedin" as const, label: "LinkedIn" },
                    { key: "email" as const, label: "Email" },
                  ]).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => { setMessageType(t.key); setDraft(""); }}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        messageType === t.key
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground border border-border hover:bg-accent"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {messageType && (
                  <>
                    <textarea
                      placeholder="Style notes (optional): e.g. casual, met at a coffee shop..."
                      value={styleNotes}
                      onChange={(e) => setStyleNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none mb-3"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="w-full h-10 bg-primary text-primary-foreground font-semibold rounded-lg text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 mb-3"
                    >
                      <Sparkles size={14} />
                      {generating ? "Generating…" : "Generate Draft"}
                    </button>
                  </>
                )}

                {draft && (
                  <div className="space-y-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="w-full h-9 bg-accent border border-border text-foreground font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-all hover:bg-surface-hover"
                    >
                      {copied ? <><Check size={14} className="text-success" /> Copied!</> : <><Copy size={14} /> Copy to Clipboard</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactSlideOver;

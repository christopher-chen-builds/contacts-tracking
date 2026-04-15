import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const CONTACT_METHODS = ["Email", "LinkedIn", "Phone Number"] as const;

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

const QuickAddModal = ({ open, onClose }: QuickAddModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [dateOfLastConnection, setDateOfLastConnection] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [comments, setComments] = useState("");
  const [category, setCategory] = useState<"Network" | "Personal">("Network");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const resetForm = () => {
    setName(""); setCompany(""); setCity(""); setDateOfLastConnection("");
    setContactMethod(""); setComments(""); setCategory("Network"); setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErrors({ name: "Name is required" }); return; }

    setSaving(true);
    const { error } = await supabase.from("contacts").insert({
      name: name.trim(),
      company: company.trim() || null,
      city: city.trim() || null,
      date_of_last_connection: dateOfLastConnection || null,
      contact_method: contactMethod || null,
      comments: comments.trim() || null,
      category,
      user_id: user?.id,
    });
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      toast({ title: "Contact saved", description: `${name} added to ${category}.` });
      setTimeout(() => { resetForm(); setSaved(false); onClose(); }, 800);
    }
  };

  const inputCls = "w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-display text-lg text-foreground">New Contact</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                {/* Category */}
                <div className="flex bg-secondary rounded-lg p-0.5 gap-0.5">
                  {(["Network", "Personal"] as const).map((cat) => (
                    <button
                      key={cat} type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all ${
                        category === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div>
                  <input type="text" placeholder="Name *" value={name}
                    onChange={(e) => { setName(e.target.value); setErrors({}); }}
                    className={`${inputCls} ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                </div>
                <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
                <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
                <input type="date" value={dateOfLastConnection} onChange={(e) => setDateOfLastConnection(e.target.value)}
                  className={`${inputCls} ${!dateOfLastConnection ? "text-muted-foreground" : ""}`}
                />
                <select value={contactMethod} onChange={(e) => setContactMethod(e.target.value)}
                  className={`${inputCls} ${!contactMethod ? "text-muted-foreground" : ""}`}
                >
                  <option value="">Contact Method</option>
                  {CONTACT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <textarea placeholder="Comments" value={comments} onChange={(e) => setComments(e.target.value)} rows={2} className={`${inputCls} resize-none`} />

                <button type="submit" disabled={saving}
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {saved ? <><CheckCircle size={16} /> Added!</> : saving ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : "Save Contact"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickAddModal;

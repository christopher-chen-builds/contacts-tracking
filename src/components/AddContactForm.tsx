import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const CONTACT_METHODS = ["Email", "LinkedIn", "Phone Number"] as const;

const AddContactForm = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [dateOfLastConnection, setDateOfLastConnection] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [comments, setComments] = useState("");
  const [category, setCategory] = useState<"Network" | "Personal">("Network");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setCompany("");
    setCity("");
    setDateOfLastConnection("");
    setContactMethod("");
    setComments("");
    setCategory("Network");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

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
      toast({ title: "Connection stored.", description: `${name} added to ${category}.` });
      resetForm();
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ease-snap";

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 px-4 pb-32"
    >
      <h1 className="text-display text-2xl text-foreground mb-2">Contacts Directory</h1>

      {/* Category Toggle */}
      <div className="flex bg-secondary rounded-xl p-1 gap-1">
        {(["Network", "Personal"] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ease-snap duration-150 ${
              category === cat
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className={inputClass}
      />

      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className={inputClass}
      />

      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className={inputClass}
      />

      <input
        type="date"
        placeholder="Date of Last Connection"
        value={dateOfLastConnection}
        onChange={(e) => setDateOfLastConnection(e.target.value)}
        className={`${inputClass} ${!dateOfLastConnection ? "text-muted-foreground" : ""}`}
      />

      <select
        value={contactMethod}
        onChange={(e) => setContactMethod(e.target.value)}
        className={`${inputClass} ${!contactMethod ? "text-muted-foreground" : ""}`}
      >
        <option value="">Contact Method</option>
        {CONTACT_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Comments"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows={3}
        className={`${inputClass} resize-none`}
      />

      <motion.button
        type="submit"
        disabled={saving || !name.trim()}
        whileTap={{ scale: 0.97 }}
        className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-2xl shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50 transition-all ease-snap duration-100 mt-2"
      >
        {saving ? "Saving..." : "Save Contact"}
      </motion.button>
    </motion.form>
  );
};

export default AddContactForm;

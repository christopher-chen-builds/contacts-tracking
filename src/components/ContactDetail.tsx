import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Linkedin, Phone, Building2, MapPin, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";

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

const methodIcon = (method: string | null) => {
  switch (method) {
    case "Email": return <Mail size={16} />;
    case "LinkedIn": return <Linkedin size={16} />;
    case "Phone Number": return <Phone size={16} />;
    default: return null;
  }
};

const ContactDetail = ({ contact, onClose }: { contact: Contact | null; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {contact && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border max-h-[80vh] overflow-y-auto pb-safe"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-display text-xl text-foreground">{contact.name}</h2>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">
                    {contact.category}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 -m-2 text-muted-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {contact.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground">{contact.company}</span>
                  </div>
                )}
                {contact.city && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground">{contact.city}</span>
                  </div>
                )}
                {contact.contact_method && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">{methodIcon(contact.contact_method)}</span>
                    <span className="text-foreground">{contact.contact_method}</span>
                  </div>
                )}
                {contact.date_of_last_connection && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground">
                      Last seen {format(new Date(contact.date_of_last_connection), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
                {contact.comments && (
                  <div className="flex items-start gap-3 text-sm mt-4 pt-4 border-t border-border">
                    <MessageSquare size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-foreground/80 leading-relaxed">{contact.comments}</p>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground text-xs mt-6">
                Added {format(new Date(contact.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactDetail;

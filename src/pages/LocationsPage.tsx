import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

const LocationsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("contacts").select("*").order("name");
      setContacts((data as Contact[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Group by city
  const cityGroups = new Map<string, Contact[]>();
  contacts.forEach((c) => {
    const city = c.city || "Unknown";
    const existing = cityGroups.get(city) || [];
    existing.push(c);
    cityGroups.set(city, existing);
  });
  const sorted = Array.from(cityGroups.entries()).sort((a, b) => b[1].length - a[1].length);

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-display text-2xl text-foreground mb-1">Locations</h1>
      <p className="text-sm text-muted-foreground mb-6">{sorted.length} cities</p>

      <div className="space-y-3">
        {sorted.map(([city, cityContacts]) => (
          <div key={city} className="bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedCity(expandedCity === city ? null : city)}
              className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">{city}</span>
              </div>
              <span className="text-data text-xs text-muted-foreground font-medium">{cityContacts.length}</span>
            </button>

            {expandedCity === city && (
              <div className="border-t border-border divide-y divide-border">
                {cityContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors text-left pl-16"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-foreground font-semibold text-xs shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.company || c.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-center py-16 text-muted-foreground text-sm">No contacts yet.</p>
        )}
      </div>

      <ContactSlideOver contact={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default LocationsPage;

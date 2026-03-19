
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  city TEXT,
  date_of_last_connection DATE,
  contact_method TEXT CHECK (contact_method IN ('Email', 'LinkedIn', 'Phone Number')),
  comments TEXT,
  category TEXT NOT NULL CHECK (category IN ('Network', 'Personal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read contacts" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update contacts" ON public.contacts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete contacts" ON public.contacts FOR DELETE USING (true);

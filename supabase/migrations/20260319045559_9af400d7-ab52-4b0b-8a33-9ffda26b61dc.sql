
-- Add user_id column to contacts
ALTER TABLE public.contacts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY "Anyone can read contacts" ON public.contacts;
DROP POLICY "Anyone can insert contacts" ON public.contacts;
DROP POLICY "Anyone can update contacts" ON public.contacts;
DROP POLICY "Anyone can delete contacts" ON public.contacts;

-- Create per-user RLS policies
CREATE POLICY "Users can view their own contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON public.contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

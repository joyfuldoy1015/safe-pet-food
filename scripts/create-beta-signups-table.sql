-- Beta signups table for beta tester recruitment landing page (/beta)
CREATE TABLE IF NOT EXISTS public.beta_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  pet_type text NOT NULL CHECK (pet_type IN ('dog', 'cat', 'both')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (no login required to sign up)
CREATE POLICY "anyone can signup"
  ON public.beta_signups
  FOR INSERT TO anon WITH CHECK (true);

-- Block public SELECT (admin reads via service role key)
CREATE POLICY "no public select"
  ON public.beta_signups
  FOR SELECT USING (false);

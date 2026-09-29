CREATE TYPE public.domain_inquiry_status AS ENUM ('new', 'contacted', 'closed');

CREATE TABLE public.domain_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  company TEXT CHECK (company IS NULL OR char_length(company) <= 120),
  email TEXT NOT NULL CHECK (char_length(email) <= 254),
  website TEXT CHECK (website IS NULL OR char_length(website) <= 500),
  offer_amount INTEGER NOT NULL CHECK (offer_amount BETWEEN 1 AND 100000000),
  intended_use TEXT NOT NULL CHECK (char_length(intended_use) BETWEEN 2 AND 120),
  message TEXT CHECK (message IS NULL OR char_length(message) <= 2000),
  status public.domain_inquiry_status NOT NULL DEFAULT 'new',
  submission_fingerprint TEXT NOT NULL CHECK (char_length(submission_fingerprint) = 64),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.domain_inquiries TO authenticated;
GRANT ALL ON public.domain_inquiries TO service_role;

ALTER TABLE public.domain_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view domain inquiries"
ON public.domain_inquiries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update domain inquiries"
ON public.domain_inquiries
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_domain_inquiries_updated_at
BEFORE UPDATE ON public.domain_inquiries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_domain_inquiries_created_at ON public.domain_inquiries(created_at DESC);
CREATE INDEX idx_domain_inquiries_status ON public.domain_inquiries(status);
CREATE INDEX idx_domain_inquiries_fingerprint_created_at ON public.domain_inquiries(submission_fingerprint, created_at DESC);
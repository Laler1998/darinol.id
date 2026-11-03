CREATE TABLE IF NOT EXISTS darinol_sponsor_inquiries (
  id TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL CHECK (char_length(brand_name) BETWEEN 2 AND 100),
  contact_name TEXT NOT NULL CHECK (char_length(contact_name) BETWEEN 2 AND 100),
  contact_email TEXT NOT NULL CHECK (char_length(contact_email) <= 254),
  contact_whatsapp TEXT CHECK (contact_whatsapp IS NULL OR char_length(contact_whatsapp) <= 40),
  product_url TEXT NOT NULL CHECK (product_url LIKE 'https://%'),
  logo_url TEXT CHECK (logo_url IS NULL OR logo_url LIKE 'https://%'),
  product_description TEXT NOT NULL CHECK (char_length(product_description) BETWEEN 20 AND 1500),
  placements JSONB NOT NULL CHECK (
    jsonb_typeof(placements) = 'array'
    AND placements <> '[]'::jsonb
    AND placements <@ '["homepage-radar-bottom", "homepage-sidebar", "homepage-inline"]'::jsonb
  ),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'approved', 'rejected', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'not_configured' CHECK (payment_status IN ('not_configured', 'pending', 'paid', 'failed', 'refunded')),
  contact_consent BOOLEAN NOT NULL CHECK (contact_consent),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS darinol_sponsor_inquiries_status_created_at_idx
  ON darinol_sponsor_inquiries (status, created_at DESC);

CREATE INDEX IF NOT EXISTS darinol_sponsor_inquiries_email_created_at_idx
  ON darinol_sponsor_inquiries (contact_email, created_at DESC);

ALTER TABLE darinol_sponsor_inquiries ENABLE ROW LEVEL SECURITY;
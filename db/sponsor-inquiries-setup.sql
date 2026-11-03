DO $sponsor_setup$
BEGIN
  EXECUTE $ddl$
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      design_blob_path TEXT,
      design_file_name TEXT,
      design_file_content_type TEXT,
      design_review_status TEXT NOT NULL DEFAULT 'not_submitted',
      requested_trend TEXT,
      CONSTRAINT darinol_sponsor_design_file_name_length
        CHECK (design_file_name IS NULL OR char_length(design_file_name) <= 200),
      CONSTRAINT darinol_sponsor_design_content_type
        CHECK (design_file_content_type IS NULL OR design_file_content_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
      CONSTRAINT darinol_sponsor_design_review_status
        CHECK (design_review_status IN ('not_submitted', 'pending_review', 'approved', 'rejected')),
      CONSTRAINT darinol_sponsor_design_review_consistency
        CHECK (
          (design_blob_path IS NULL AND design_file_name IS NULL AND design_file_content_type IS NULL AND design_review_status = 'not_submitted')
          OR (design_blob_path IS NOT NULL AND design_file_name IS NOT NULL AND design_file_content_type IS NOT NULL AND design_review_status IN ('pending_review', 'approved', 'rejected'))
        ),
      CONSTRAINT darinol_sponsor_requested_trend_length
        CHECK (requested_trend IS NULL OR char_length(requested_trend) <= 160)
    )
  $ddl$;

  EXECUTE $ddl$
    ALTER TABLE darinol_sponsor_inquiries
      ADD COLUMN IF NOT EXISTS design_blob_path TEXT,
      ADD COLUMN IF NOT EXISTS design_file_name TEXT,
      ADD COLUMN IF NOT EXISTS design_file_content_type TEXT,
      ADD COLUMN IF NOT EXISTS design_review_status TEXT NOT NULL DEFAULT 'not_submitted',
      ADD COLUMN IF NOT EXISTS requested_trend TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  $ddl$;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'darinol_sponsor_inquiries'::regclass
      AND conname = 'darinol_sponsor_design_file_name_length'
  ) THEN
    EXECUTE $ddl$
      ALTER TABLE darinol_sponsor_inquiries
        ADD CONSTRAINT darinol_sponsor_design_file_name_length
        CHECK (design_file_name IS NULL OR char_length(design_file_name) <= 200)
    $ddl$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'darinol_sponsor_inquiries'::regclass
      AND conname = 'darinol_sponsor_design_content_type'
  ) THEN
    EXECUTE $ddl$
      ALTER TABLE darinol_sponsor_inquiries
        ADD CONSTRAINT darinol_sponsor_design_content_type
        CHECK (design_file_content_type IS NULL OR design_file_content_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf'))
    $ddl$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'darinol_sponsor_inquiries'::regclass
      AND conname = 'darinol_sponsor_design_review_status'
  ) THEN
    EXECUTE $ddl$
      ALTER TABLE darinol_sponsor_inquiries
        ADD CONSTRAINT darinol_sponsor_design_review_status
        CHECK (design_review_status IN ('not_submitted', 'pending_review', 'approved', 'rejected'))
    $ddl$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'darinol_sponsor_inquiries'::regclass
      AND conname = 'darinol_sponsor_design_review_consistency'
  ) THEN
    EXECUTE $ddl$
      ALTER TABLE darinol_sponsor_inquiries
        ADD CONSTRAINT darinol_sponsor_design_review_consistency
        CHECK (
          (design_blob_path IS NULL AND design_file_name IS NULL AND design_file_content_type IS NULL AND design_review_status = 'not_submitted')
          OR (design_blob_path IS NOT NULL AND design_file_name IS NOT NULL AND design_file_content_type IS NOT NULL AND design_review_status IN ('pending_review', 'approved', 'rejected'))
        )
    $ddl$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'darinol_sponsor_inquiries'::regclass
      AND conname = 'darinol_sponsor_requested_trend_length'
  ) THEN
    EXECUTE $ddl$
      ALTER TABLE darinol_sponsor_inquiries
        ADD CONSTRAINT darinol_sponsor_requested_trend_length
        CHECK (requested_trend IS NULL OR char_length(requested_trend) <= 160)
    $ddl$;
  END IF;

  EXECUTE $ddl$
    CREATE INDEX IF NOT EXISTS darinol_sponsor_inquiries_status_created_at_idx
      ON darinol_sponsor_inquiries (status, created_at DESC)
  $ddl$;

  EXECUTE $ddl$
    CREATE INDEX IF NOT EXISTS darinol_sponsor_inquiries_email_created_at_idx
      ON darinol_sponsor_inquiries (contact_email, created_at DESC)
  $ddl$;

  EXECUTE $ddl$ ALTER TABLE darinol_sponsor_inquiries ENABLE ROW LEVEL SECURITY $ddl$;
END;
$sponsor_setup$;
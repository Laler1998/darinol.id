ALTER TABLE darinol_sponsor_inquiries
  ADD COLUMN IF NOT EXISTS design_blob_path TEXT,
  ADD COLUMN IF NOT EXISTS design_file_name TEXT,
  ADD COLUMN IF NOT EXISTS design_file_content_type TEXT,
  ADD COLUMN IF NOT EXISTS design_review_status TEXT NOT NULL DEFAULT 'not_submitted';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'darinol_sponsor_design_file_name_length'
  ) THEN
    ALTER TABLE darinol_sponsor_inquiries
      ADD CONSTRAINT darinol_sponsor_design_file_name_length
      CHECK (design_file_name IS NULL OR char_length(design_file_name) <= 200);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'darinol_sponsor_design_content_type'
  ) THEN
    ALTER TABLE darinol_sponsor_inquiries
      ADD CONSTRAINT darinol_sponsor_design_content_type
      CHECK (design_file_content_type IS NULL OR design_file_content_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'darinol_sponsor_design_review_status'
  ) THEN
    ALTER TABLE darinol_sponsor_inquiries
      ADD CONSTRAINT darinol_sponsor_design_review_status
      CHECK (design_review_status IN ('not_submitted', 'pending_review', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'darinol_sponsor_design_review_consistency'
  ) THEN
    ALTER TABLE darinol_sponsor_inquiries
      ADD CONSTRAINT darinol_sponsor_design_review_consistency
      CHECK (
        (design_blob_path IS NULL AND design_file_name IS NULL AND design_file_content_type IS NULL AND design_review_status = 'not_submitted')
        OR (design_blob_path IS NOT NULL AND design_file_name IS NOT NULL AND design_file_content_type IS NOT NULL AND design_review_status IN ('pending_review', 'approved', 'rejected'))
      );
  END IF;
END;
$$;
ALTER TABLE darinol_sponsor_inquiries
  ADD COLUMN IF NOT EXISTS requested_trend TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'darinol_sponsor_requested_trend_length'
  ) THEN
    ALTER TABLE darinol_sponsor_inquiries
      ADD CONSTRAINT darinol_sponsor_requested_trend_length
      CHECK (requested_trend IS NULL OR char_length(requested_trend) <= 160);
  END IF;
END;
$$;
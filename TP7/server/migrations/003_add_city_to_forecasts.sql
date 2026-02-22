-- TP7 Migration 003: Add city column to forecasts table

-- Add city column to forecasts (nullable for existing rows)
ALTER TABLE IF EXISTS forecasts
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Create index on city for faster queries
CREATE INDEX IF NOT EXISTS idx_forecasts_city ON forecasts(city);

-- Create rates table for Chine and Star rates per square meter
-- Run this SQL in your Supabase SQL Editor

-- Create rates table
CREATE TABLE IF NOT EXISTS rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_type VARCHAR(10) NOT NULL CHECK (rate_type IN ('CHINE', 'STAR')),
  rate_per_sq_meter DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on rate_type (only one rate per type)
CREATE UNIQUE INDEX IF NOT EXISTS rates_rate_type_unique ON rates(rate_type);

-- Enable Row Level Security
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read rates
CREATE POLICY "Allow read access to rates" ON rates
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert rates
CREATE POLICY "Only admins can insert rates" ON rates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

-- Policy: Only admins can update rates
CREATE POLICY "Only admins can update rates" ON rates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

-- Policy: Only admins can delete rates
CREATE POLICY "Only admins can delete rates" ON rates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rates_updated_at_trigger
  BEFORE UPDATE ON rates
  FOR EACH ROW
  EXECUTE FUNCTION update_rates_updated_at();

-- Insert default rates (optional)
-- INSERT INTO rates (rate_type, rate_per_sq_meter, description)
-- VALUES 
--   ('CHINE', 100.00, 'Standard Chine tile rate per square meter'),
--   ('STAR', 150.00, 'Premium Star tile rate per square meter');

/*
  # Update Labor Management Schema

  1. Changes
    - Add shift_type enum safely
    - Add shift_type and status columns to employee_schedules
    - Add indexes for better performance
    - Handle existing data safely

  2. Security
    - Maintain existing RLS policies
*/

-- Create shift_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_type') THEN
    CREATE TYPE shift_type AS ENUM ('Morning', 'Afternoon', 'Evening');
  END IF;
END$$;

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employee_schedules' AND column_name = 'shift_type'
  ) THEN
    ALTER TABLE employee_schedules ADD COLUMN shift_type shift_type;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employee_schedules' AND column_name = 'status'
  ) THEN
    ALTER TABLE employee_schedules ADD COLUMN status text DEFAULT 'scheduled';
  END IF;
END$$;

-- Add indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'employee_schedules' AND indexname = 'idx_employee_schedules_employee_id'
  ) THEN
    CREATE INDEX idx_employee_schedules_employee_id ON employee_schedules(employee_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'employee_schedules' AND indexname = 'idx_employee_schedules_day_of_week'
  ) THEN
    CREATE INDEX idx_employee_schedules_day_of_week ON employee_schedules(day_of_week);
  END IF;
END$$;

-- Update existing schedules with shift types based on start time
UPDATE employee_schedules
SET shift_type = CASE
  WHEN start_time < '12:00:00' THEN 'Morning'::shift_type
  WHEN start_time < '16:00:00' THEN 'Afternoon'::shift_type
  ELSE 'Evening'::shift_type
END
WHERE shift_type IS NULL;
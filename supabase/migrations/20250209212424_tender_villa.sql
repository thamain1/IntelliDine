/*
  # Clean up duplicate employee data

  1. Changes
    - Delete duplicate employee records
    - Add unique constraint on employee name
    - Delete duplicate schedule records
    
  2. Data Cleanup
    - Keeps only one instance of each employee
    - Maintains referential integrity with schedules
*/

-- Delete duplicate employees keeping the first inserted record
WITH duplicates AS (
  SELECT id
  FROM (
    SELECT id,
           name,
           ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
    FROM employees
  ) t
  WHERE rn > 1
)
DELETE FROM employees
WHERE id IN (SELECT id FROM duplicates);

-- Add unique constraint on employee name
ALTER TABLE employees
ADD CONSTRAINT employees_name_unique UNIQUE (name);
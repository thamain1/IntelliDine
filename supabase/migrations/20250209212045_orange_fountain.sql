/*
  # Add Employee Data and Schedules

  1. Changes
    - Insert all employees with their roles and rates
    - Add corresponding schedules with proper time handling
    
  2. Data Added
    - 8 employees with their roles and rates
    - Weekly schedules for each employee with correct time ranges
*/

-- Insert employees
INSERT INTO employees (name, role, hourly_rate) VALUES
  ('Marco Rossi', 'Executive Chef', 50.00),
  ('Lucia Bianchi', 'Sous Chef', 40.00),
  ('Giovanni Esposito', 'Line Cook', 30.00),
  ('Sophia Romano', 'Pastry Chef', 35.00),
  ('Alessandro Bruno', 'Bartender', 30.00),
  ('Isabella Ferrara', 'Server', 28.00),
  ('Matteo Conti', 'Server', 24.00),
  ('Francesca De Luca', 'Host', 24.00);

-- Insert schedules for Marco Rossi (Tue-Sun, 2 PM - 10 PM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '14:00'::time,
  '22:00'::time
FROM employees
CROSS JOIN (VALUES (2), (3), (4), (5), (6), (0)) AS days(day_number)
WHERE name = 'Marco Rossi';

-- Insert schedules for Lucia Bianchi (Wed-Sun, 3 PM - 11 PM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '15:00'::time,
  '23:00'::time
FROM employees
CROSS JOIN (VALUES (3), (4), (5), (6), (0)) AS days(day_number)
WHERE name = 'Lucia Bianchi';

-- Insert schedules for Giovanni Esposito (Thu-Sat, 4 PM - 12 AM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '16:00'::time,
  '23:59'::time
FROM employees
CROSS JOIN (VALUES (4), (5), (6)) AS days(day_number)
WHERE name = 'Giovanni Esposito';

-- Insert schedules for Sophia Romano (Tue-Sat, 10 AM - 6 PM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '10:00'::time,
  '18:00'::time
FROM employees
CROSS JOIN (VALUES (2), (3), (4), (5), (6)) AS days(day_number)
WHERE name = 'Sophia Romano';

-- Insert schedules for Alessandro Bruno (Thu-Sun, 5 PM - 12 AM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '17:00'::time,
  '23:59'::time
FROM employees
CROSS JOIN (VALUES (4), (5), (6), (0)) AS days(day_number)
WHERE name = 'Alessandro Bruno';

-- Insert schedules for Isabella Ferrara (Wed-Sat, 4 PM - 11 PM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '16:00'::time,
  '23:00'::time
FROM employees
CROSS JOIN (VALUES (3), (4), (5), (6)) AS days(day_number)
WHERE name = 'Isabella Ferrara';

-- Insert schedules for Matteo Conti (Fri-Sun, 5 PM - 11 PM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '17:00'::time,
  '23:00'::time
FROM employees
CROSS JOIN (VALUES (5), (6), (0)) AS days(day_number)
WHERE name = 'Matteo Conti';

-- Insert schedules for Francesca De Luca (Wed-Sat, 4 PM - 10 PM)
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_number,
  '16:00'::time,
  '22:00'::time
FROM employees
CROSS JOIN (VALUES (3), (4), (5), (6)) AS days(day_number)
WHERE name = 'Francesca De Luca';
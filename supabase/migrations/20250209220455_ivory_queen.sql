/*
  # Add Random Employee Schedule Data

  1. Changes
    - Add more employee schedule data with varied shifts
    - Ensure realistic restaurant coverage
    - Add different shift patterns for different roles

  2. Data
    - Morning shifts (9 AM - 5 PM)
    - Afternoon shifts (12 PM - 8 PM)
    - Evening shifts (4 PM - 12 AM)
*/

-- Clear existing schedules to avoid conflicts
DELETE FROM employee_schedules;

-- Insert schedules for Executive Chef (Marco Rossi)
-- Works mostly afternoon/evening shifts, Tuesday-Sunday
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  d.day_number,
  '13:00'::time,
  '21:00'::time,
  'Afternoon'::shift_type
FROM employees e
CROSS JOIN (VALUES (2), (3), (4), (5), (6), (0)) AS d(day_number)
WHERE e.name = 'Marco Rossi';

-- Insert schedules for Sous Chef (Lucia Bianchi)
-- Works split between morning prep and evening service
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  d.day_number,
  CASE 
    WHEN d.day_number IN (2, 3) THEN '09:00'::time
    ELSE '15:00'::time
  END,
  CASE 
    WHEN d.day_number IN (2, 3) THEN '17:00'::time
    ELSE '23:00'::time
  END,
  CASE 
    WHEN d.day_number IN (2, 3) THEN 'Morning'::shift_type
    ELSE 'Evening'::shift_type
  END
FROM employees e
CROSS JOIN (VALUES (2), (3), (4), (5), (6)) AS d(day_number)
WHERE e.name = 'Lucia Bianchi';

-- Insert schedules for Line Cook (Giovanni Esposito)
-- Works evening shifts during peak days
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  d.day_number,
  '16:00'::time,
  '23:59'::time,
  'Evening'::shift_type
FROM employees e
CROSS JOIN (VALUES (4), (5), (6), (0)) AS d(day_number)
WHERE e.name = 'Giovanni Esposito';

-- Insert schedules for Pastry Chef (Sophia Romano)
-- Works early morning shifts for prep
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  d.day_number,
  '06:00'::time,
  '14:00'::time,
  'Morning'::shift_type
FROM employees e
CROSS JOIN (VALUES (2), (3), (4), (5), (6)) AS d(day_number)
WHERE e.name = 'Sophia Romano';

-- Insert schedules for Bartender (Alessandro Bruno)
-- Works evening shifts during busy days
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  d.day_number,
  '17:00'::time,
  '23:59'::time,
  'Evening'::shift_type
FROM employees e
CROSS JOIN (VALUES (4), (5), (6), (0)) AS d(day_number)
WHERE e.name = 'Alessandro Bruno';

-- Insert schedules for Server (Isabella Ferrara)
-- Works mixed shifts throughout the week
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  day_number,
  CASE 
    WHEN day_number IN (3, 4) THEN '11:00'::time
    ELSE '16:00'::time
  END,
  CASE 
    WHEN day_number IN (3, 4) THEN '19:00'::time
    ELSE '23:00'::time
  END,
  CASE 
    WHEN day_number IN (3, 4) THEN 'Morning'::shift_type
    ELSE 'Evening'::shift_type
  END
FROM employees e
CROSS JOIN (VALUES (3), (4), (5), (6)) AS d(day_number)
WHERE e.name = 'Isabella Ferrara';

-- Insert schedules for Server (Matteo Conti)
-- Works busy evening shifts
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  d.day_number,
  '17:00'::time,
  '23:00'::time,
  'Evening'::shift_type
FROM employees e
CROSS JOIN (VALUES (5), (6), (0)) AS d(day_number)
WHERE e.name = 'Matteo Conti';

-- Insert schedules for Host (Francesca De Luca)
-- Works afternoon/evening shifts
INSERT INTO employee_schedules (employee_id, day_of_week, start_time, end_time, shift_type)
SELECT 
  e.id,
  d.day_number,
  '16:00'::time,
  '22:00'::time,
  'Evening'::shift_type
FROM employees e
CROSS JOIN (VALUES (3), (4), (5), (6)) AS d(day_number)
WHERE e.name = 'Francesca De Luca';
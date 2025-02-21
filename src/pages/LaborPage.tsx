import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, Clock, AlertTriangle, DollarSign, TrendingUp, Users } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { supabase } from '../lib/supabase';
import type { Employee, EmployeeSchedule } from '../types';

const DraggableEmployee = ({ employee }: { employee: Employee }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EMPLOYEE',
    item: employee,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 bg-indigo-100 text-indigo-800 rounded cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {employee.name} ({employee.role})
    </div>
  );
};

const DropZone = ({ 
  day, 
  shift, 
  onDrop, 
  assignedEmployees, 
  onRemove, 
  onTimeChange 
}: { 
  day: string;
  shift: string;
  onDrop: (day: string, shift: string, employee: Employee) => void;
  assignedEmployees: Array<Employee & { time?: string }>;
  onRemove: (day: string, shift: string, employeeId: string) => void;
  onTimeChange: (day: string, shift: string, employeeId: string, time: string) => void;
}) => {
  const [, drop] = useDrop(() => ({
    accept: 'EMPLOYEE',
    drop: (item: Employee) => onDrop(day, shift, item),
  }));

  return (
    <div 
      ref={drop} 
      className="p-4 border rounded min-h-[100px] bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <h3 className="font-bold mb-2">{day} - {shift}</h3>
      {assignedEmployees.length > 0 ? (
        assignedEmployees.map((emp) => (
          <div key={emp.id} className="p-2 mb-2 bg-indigo-100 text-indigo-800 rounded flex justify-between items-center">
            <div className="flex-1">
              {emp.name} ({emp.role})
            </div>
            <input
              type="time"
              value={emp.time || ''}
              onChange={(e) => onTimeChange(day, shift, emp.id, e.target.value)}
              className="mx-2 px-2 py-1 border rounded text-sm"
            />
            <button 
              onClick={() => onRemove(day, shift, emp.id)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-400">Drop employee here</p>
      )}
    </div>
  );
};

export function LaborPage() {
  const [view, setView] = React.useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [schedule, setSchedule] = React.useState<Record<string, Record<string, Array<Employee & { time?: string }>>>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [laborMetrics, setLaborMetrics] = useState({
    regularHours: 0,
    overtimeHours: 0,
    totalLaborCost: 0,
    laborCostRatio: 0,
    schedulingConflicts: [],
    overtimeAlerts: [],
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shifts = ['Morning', 'Afternoon', 'Evening'];

  React.useEffect(() => {
    fetchEmployeesAndSchedules();
  }, []);

  const fetchEmployeesAndSchedules = async () => {
    try {
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;

      const { data: schedulesData, error: schedulesError } = await supabase
        .from('employee_schedules')
        .select('*');

      if (schedulesError) throw schedulesError;

      const employeesWithSchedules: Employee[] = employeesData.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        hourlyRate: emp.hourly_rate,
        schedules: [],
      }));

      const formattedSchedule: Record<string, Record<string, Array<Employee & { time?: string }>>> = {};
      
      schedulesData.forEach(schedule => {
        const employee = employeesWithSchedules.find(emp => emp.id === schedule.employee_id);
        if (!employee) return;

        const day = days[schedule.day_of_week];
        const shift = schedule.shift_type || 'Morning';
        
        if (!formattedSchedule[day]) {
          formattedSchedule[day] = {};
        }
        if (!formattedSchedule[day][shift]) {
          formattedSchedule[day][shift] = [];
        }

        formattedSchedule[day][shift].push({
          ...employee,
          time: schedule.start_time,
        });
      });

      setEmployees(employeesWithSchedules);
      setSchedule(formattedSchedule);
      
      calculateLaborMetrics(formattedSchedule, employeesWithSchedules);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLaborMetrics = (
    currentSchedule: Record<string, Record<string, Array<Employee & { time?: string }>>>,
    currentEmployees: Employee[]
  ) => {
    let totalRegularHours = 0;
    let totalOvertimeHours = 0;
    let totalCost = 0;
    const conflicts: any[] = [];
    const overtimeAlerts: any[] = [];
    const weeklyHours: Record<string, number> = {};

    Object.entries(currentSchedule).forEach(([day, shifts]) => {
      Object.entries(shifts).forEach(([shift, employees]) => {
        employees.forEach((emp) => {
          if (!emp.time) return;

          const hours = 8;

          weeklyHours[emp.id] = (weeklyHours[emp.id] || 0) + hours;

          if (weeklyHours[emp.id] > 40) {
            const overtime = weeklyHours[emp.id] - 40;
            totalOvertimeHours += Math.min(hours, overtime);
            totalRegularHours += Math.max(0, hours - overtime);
            
            overtimeAlerts.push({
              employee: emp.name,
              hours: weeklyHours[emp.id],
            });
          } else {
            totalRegularHours += hours;
          }

          const regularHours = Math.min(hours, 40 - (weeklyHours[emp.id] - hours));
          const overtimeHours = Math.max(0, hours - regularHours);
          
          totalCost += (regularHours * emp.hourlyRate) + (overtimeHours * emp.hourlyRate * 1.5);

          employees.forEach((otherEmp) => {
            if (otherEmp.id !== emp.id && otherEmp.time === emp.time) {
              conflicts.push({
                day,
                shift,
                employee1: emp.name,
                employee2: otherEmp.name,
                time: emp.time,
              });
            }
          });
        });
      });
    });

    const weeklyRevenue = 50000;
    const laborCostRatio = (totalCost / weeklyRevenue) * 100;

    setLaborMetrics({
      regularHours: Math.round(totalRegularHours * 100) / 100,
      overtimeHours: Math.round(totalOvertimeHours * 100) / 100,
      totalLaborCost: Math.round(totalCost * 100) / 100,
      laborCostRatio: Math.round(laborCostRatio * 100) / 100,
      schedulingConflicts: conflicts,
      overtimeAlerts,
    });
  };

  const handleDrop = async (day: string, shift: string, employee: Employee) => {
    setSchedule((prev) => {
      const updated = { ...prev };
      if (!updated[day]) updated[day] = {};
      if (!updated[day][shift]) updated[day][shift] = [];
      if (!updated[day][shift].some((e) => e.id === employee.id)) {
        updated[day][shift].push({ ...employee, time: '' });
      }
      return updated;
    });

    try {
      const dayNumber = days.indexOf(day);
      if (dayNumber === -1) return;

      let startTime = '09:00';
      let endTime = '17:00';
      
      switch (shift) {
        case 'Morning':
          startTime = '09:00';
          endTime = '17:00';
          break;
        case 'Afternoon':
          startTime = '12:00';
          endTime = '20:00';
          break;
        case 'Evening':
          startTime = '16:00';
          endTime = '23:59';
          break;
      }

      const { error } = await supabase
        .from('employee_schedules')
        .insert({
          employee_id: employee.id,
          day_of_week: dayNumber,
          start_time: startTime,
          end_time: endTime,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleRemove = async (day: string, shift: string, employeeId: string) => {
    setSchedule((prev) => {
      const updated = { ...prev };
      if (updated[day]?.[shift]) {
        updated[day][shift] = updated[day][shift].filter(emp => emp.id !== employeeId);
      }
      return updated;
    });

    try {
      const dayNumber = days.indexOf(day);
      if (dayNumber === -1) return;

      const { error } = await supabase
        .from('employee_schedules')
        .delete()
        .eq('employee_id', employeeId)
        .eq('day_of_week', dayNumber);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing schedule:', error);
    }
  };

  const handleTimeChange = async (day: string, shift: string, employeeId: string, newTime: string) => {
    const startTime = new Date(`2000-01-01T${newTime}`);
    const endTime = new Date(startTime.getTime() + (8 * 60 * 60 * 1000));
    
    let endTimeStr = endTime.toTimeString().slice(0, 5);
    if (endTime.getDate() > 1) {
      endTimeStr = '23:59';
    }

    setSchedule((prev) => {
      const updated = { ...prev };
      if (updated[day]?.[shift]) {
        updated[day][shift] = updated[day][shift].map(emp =>
          emp.id === employeeId ? { ...emp, time: newTime } : emp
        );
      }
      return updated;
    });

    try {
      const dayNumber = days.indexOf(day);
      if (dayNumber === -1) return;

      const { error } = await supabase
        .from('employee_schedules')
        .upsert({
          employee_id: employeeId,
          day_of_week: dayNumber,
          start_time: newTime,
          end_time: endTimeStr,
        }, {
          onConflict: 'employee_id, day_of_week'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating time:', error);
      setSchedule((prev) => {
        const updated = { ...prev };
        if (updated[day]?.[shift]) {
          updated[day][shift] = updated[day][shift].map(emp =>
            emp.id === employeeId ? { ...emp, time: '' } : emp
          );
        }
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading schedule data...</div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8">
        <BackButton />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Labor & Scheduling</h1>
          <div className="space-x-4">
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg ${
                view === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg ${
                view === 'day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Day View
            </button>
          </div>
        </div>

        <div className="flex space-x-6">
          <div className="w-1/4 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold mb-4">Employees</h2>
            {employees.map((emp) => (
              <DraggableEmployee key={emp.id} employee={emp} />
            ))}
          </div>

          <div className="w-3/4 grid grid-cols-3 gap-4">
            {days.map((day) => (
              shifts.map((shift) => (
                <DropZone
                  key={`${day}-${shift}`}
                  day={day}
                  shift={shift}
                  onDrop={handleDrop}
                  assignedEmployees={schedule[day]?.[shift] || []}
                  onRemove={handleRemove}
                  onTimeChange={handleTimeChange}
                />
              ))
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Labor Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Regular Hours</h3>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">{laborMetrics.regularHours}</p>
              <p className="text-sm text-gray-600">Hours this week</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Overtime Hours</h3>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold">{laborMetrics.overtimeHours}</p>
              <p className="text-sm text-gray-600">Hours this week</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Total Labor Cost</h3>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold">${laborMetrics.totalLaborCost}</p>
              <p className="text-sm text-gray-600">Weekly projection</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm font-medium">Labor Cost Ratio</h3>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold">{laborMetrics.laborCostRatio}%</p>
              <p className="text-sm text-gray-600">Of revenue</p>
            </div>
          </div>

          <div className="space-y-4">
            {laborMetrics.overtimeAlerts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  <h3 className="font-semibold">Overtime Alerts</h3>
                </div>
                <ul className="space-y-2">
                  {laborMetrics.overtimeAlerts.map((alert, index) => (
                    <li key={index} className="text-yellow-700">
                      {alert.employee} is scheduled for {Math.round(alert.hours)} hours this week
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {laborMetrics.schedulingConflicts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <h3 className="font-semibold">Scheduling Conflicts</h3>
                </div>
                <ul className="space-y-2">
                  {laborMetrics.schedulingConflicts.map((conflict, index) => (
                    <li key={index} className="text-red-700">
                      Conflict on {conflict.day} ({conflict.shift}): {conflict.employee1} and{' '}
                      {conflict.employee2} at {conflict.time}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
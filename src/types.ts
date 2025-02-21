export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'entree' | 'dessert' | 'drink';
  image: string;
  dietary: {
    vegan: boolean;
    glutenFree: boolean;
    nutFree: boolean;
  };
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  hourlyRate: number;
  schedules: EmployeeSchedule[];
}

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  date: string;
  image?: string;
}

export interface DailySpecial {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  discount: number;
}
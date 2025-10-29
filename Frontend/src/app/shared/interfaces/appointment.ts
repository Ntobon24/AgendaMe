export interface Appointment {
  id: string;
  client_id: string;
  business_id: string;
  service_id: string;
  appointment_date: string; 
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  business?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
}

export interface CreateAppointmentDto {
  business_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  notes?: string;
}

export interface AppointmentTimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string;
  available: boolean;
  timeSlots: AppointmentTimeSlot[];
}
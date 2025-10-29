export class UpdateAppointmentDto {
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}
export class CreateAppointmentDto {
  business_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

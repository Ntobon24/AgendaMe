import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, CreateAppointmentDto, DayAvailability } from '../interfaces/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/appointments';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createAppointment(appointmentData: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointmentData, { 
      headers: this.getHeaders() 
    });
  }

  getClientAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/client`, { 
      headers: this.getHeaders() 
    });
  }

  getBusinessAppointments(businessId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/business/${businessId}`, { 
      headers: this.getHeaders() 
    });
  }

  getBusinessAvailability(businessId: string, date: string, serviceId?: string): Observable<DayAvailability> {
    let params = new HttpParams();
    if (serviceId) {
      params = params.append('serviceId', serviceId);
    }
    return this.http.get<DayAvailability>(`${this.apiUrl}/availability/${businessId}/${date}`, { 
      params
    });
  }

  getBusinessAvailabilityRange(businessId: string, startDate: string, endDate: string): Observable<DayAvailability[]> {
    return this.http.get<DayAvailability[]>(`${this.apiUrl}/availability/${businessId}/range`, {
      params: { startDate, endDate },
      headers: this.getHeaders()
    });
  }

  updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${appointmentId}/status`, { status }, { 
      headers: this.getHeaders() 
    });
  }

  cancelAppointment(appointmentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${appointmentId}`, { 
      headers: this.getHeaders() 
    });
  }

  getAppointmentById(appointmentId: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${appointmentId}`, { 
      headers: this.getHeaders() 
    });
  }
}
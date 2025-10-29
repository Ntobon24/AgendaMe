import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Business } from '../interfaces/business';
import { Appointment } from '../interfaces/appointment';

export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalServices: number;
  totalAppointments: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  getAllBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiUrl}/admin/businesses`);
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/admin/appointments`);
  }

  deactivateUser(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/admin/users/${userId}/deactivate`, {});
  }

  deactivateBusiness(businessId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/admin/businesses/${businessId}/deactivate`, {});
  }

  deleteBusiness(businessId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/businesses/${businessId}`);
  }

  updateBusinessTags(businessId: string, tags: string[]): Observable<Business> {
    return this.http.patch<Business>(`${this.apiUrl}/admin/businesses/${businessId}/tags`, { tags });
  }
}

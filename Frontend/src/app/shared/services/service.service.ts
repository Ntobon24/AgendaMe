import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../interfaces/service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createService(businessId: string, service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Observable<Service> {
    return this.http.post<Service>(`${this.apiUrl}/services/${businessId}`, service, { headers: this.getHeaders() });
  }

  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`);
  }

  getServicesByBusinessId(businessId: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services/business/${businessId}`);
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}`);
  }

  updateService(id: string, service: Partial<Service>): Observable<Service> {
    return this.http.patch<Service>(`${this.apiUrl}/services/${id}`, service, { headers: this.getHeaders() });
  }

  deleteService(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/services/${id}`, { headers: this.getHeaders() });
  }
}

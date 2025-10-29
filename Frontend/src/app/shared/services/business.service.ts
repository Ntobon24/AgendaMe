import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business } from '../interfaces/business';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createBusiness(business: Omit<Business, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>): Observable<Business> {
    return this.http.post<Business>(`${this.apiUrl}/businesses`, business, { headers: this.getHeaders() });
  }

  getAllBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiUrl}/businesses`, { headers: this.getHeaders() });
  }

  getMyBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiUrl}/businesses/my`, { headers: this.getHeaders() });
  }

  getBusinessById(id: string): Observable<Business> {
    return this.http.get<Business>(`${this.apiUrl}/businesses/${id}`, { headers: this.getHeaders() });
  }

  updateBusiness(id: string, business: Partial<Business>): Observable<Business> {
    return this.http.patch<Business>(`${this.apiUrl}/businesses/${id}`, business, { headers: this.getHeaders() });
  }

  deleteBusiness(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/businesses/${id}`, { headers: this.getHeaders() });
  }
}

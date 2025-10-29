import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Business } from '../interfaces/business';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  createBusiness(business: Omit<Business, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_active'>): Observable<Business> {
    return this.http.post<Business>(`${this.apiUrl}/businesses`, business);
  }

  getAllBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiUrl}/businesses`);
  }

  getMyBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiUrl}/businesses/my`);
  }

  getBusinessById(id: string): Observable<Business> {
    return this.http.get<Business>(`${this.apiUrl}/businesses/${id}`);
  }

  updateBusiness(id: string, business: Partial<Business>): Observable<Business> {
    return this.http.patch<Business>(`${this.apiUrl}/businesses/${id}`, business);
  }

  deleteBusiness(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/businesses/${id}`);
  }
}
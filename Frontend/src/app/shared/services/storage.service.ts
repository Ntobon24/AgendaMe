import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  http = inject(HttpClient);
  authService = inject(AuthService);
  apiUrl = 'http://localhost:3000/storage';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.apiUrl}/upload/avatar`, formData, {
      headers: this.getHeaders()
    });
  }

  uploadBusinessImage(file: File, businessId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('businessId', businessId);
    
    return this.http.post(`${this.apiUrl}/upload/business`, formData, {
      headers: this.getHeaders()
    });
  }

  uploadServiceImage(file: File, serviceId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('serviceId', serviceId);
    
    return this.http.post(`${this.apiUrl}/upload/service`, formData, {
      headers: this.getHeaders()
    });
  }

  validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)');
    }

    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. El tamaño máximo es 5MB');
    }

    return true;
  }
}

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { JwtService } from './jwt.service';

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtService = inject(JwtService);
  private apiUrl = 'http://localhost:3000';

  isLogged = signal(false);
  currentUser = signal<User | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    this.loadUserFromToken();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          localStorage.setItem('token', response.token);
          this.isLogged.set(true);
          this.currentUser.set(response.user || null);
              
          if (response.user?.id) {
            this.loadCompleteUserData(response.user.id);
          }
          
          this.router.navigate(['/home']);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        throw error;
      })
    );
  }

  register(userData: { email: string; password: string; username: string; name?: string; role: 'client' | 'business' }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.isLogged.set(true);
          this.currentUser.set(response.user || null);
          this.router.navigate(['/home']);
        }
      }),
      catchError(error => {
        console.error('Error en registro:', error);
        throw error;
      })
    );
  }

  private loadUserFromToken(): void {
    const token = this.jwtService.getToken();
    if (token && !this.jwtService.isTokenExpired()) {
      const payload = this.jwtService.decodeToken();
      if (payload) {
        this.isLogged.set(true);
        this.currentUser.set({
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          name: payload.name,
          role: payload.role as 'client' | 'business' | 'admin'
        });
        
        this.loadCompleteUserData(payload.sub);
      }
    } else if (token && this.jwtService.isTokenExpired()) {
      this.logout();
    }
  }

  private loadCompleteUserData(userId: string): void {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    fetch(`${this.apiUrl}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(user => {
      this.currentUser.set(user);
    })
    .catch(error => {
      console.error('Error cargando datos completos del usuario:', error);
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLogged.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getUserLogged(): User | null {
    return this.currentUser();
  }

  checkIsLogged(): boolean {
    return this.isLogged();
  }

  hasRole(role: string): boolean {
    const user = this.getUserLogged();
    return user?.role === role;
  }

  isBusinessUser(): boolean {
    return this.hasRole('business');
  }

  isAdminUser(): boolean {
    return this.hasRole('admin');
  }

  getToken(): string | null {
    return this.jwtService.getToken();
  }

  isTokenExpired(): boolean {
    return this.jwtService.isTokenExpired();
  }
}

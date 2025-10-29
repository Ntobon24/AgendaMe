import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  saveUser(user: any): void {
    localStorage.setItem(`user_${user.username}`, JSON.stringify(user));
  }

  getUser(username: string): any {
    const userStr = localStorage.getItem(`user_${username}`);
    return userStr ? JSON.parse(userStr) : null;
  }

  getAllUsers(): any[] {
    const users: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        const user = JSON.parse(localStorage.getItem(key) || '{}');
        users.push(user);
      }
    }
    return users;
  }

  saveBusiness(business: any): void {
    localStorage.setItem(`business_${business.id}`, JSON.stringify(business));
  }

  getBusiness(id: string): any {
    const businessStr = localStorage.getItem(`business_${id}`);
    return businessStr ? JSON.parse(businessStr) : null;
  }

  getAllBusinesses(): any[] {
    const businesses: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('business_')) {
        const business = JSON.parse(localStorage.getItem(key) || '{}');
        businesses.push(business);
      }
    }
    return businesses;
  }

  setCurrentUser(username: string): void {
    sessionStorage.setItem('currentUser', username);
  }

  getCurrentUser(): string | null {
    return sessionStorage.getItem('currentUser');
  }

  clearSession(): void {
    sessionStorage.clear();
  }

  clearAll(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}

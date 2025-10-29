import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { BusinessService } from '../../../shared/services/business';
import { Business } from '../../../shared/interfaces/business';
import { AuthService } from '../../../shared/services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  businessService = inject(BusinessService);
  authService = inject(AuthService);
  private router = inject(Router);
  businesses: Business[] = [];

  ngOnInit(): void {
    this.loadBusinesses();
  }

  loadBusinesses(): void {
    this.businessService.getAllBusinesses().subscribe({
      next: (businesses) => {
        this.businesses = businesses;
      },
      error: (error) => {
        console.error('Error al cargar negocios:', error);
      }
    });
  }

  getBusinessImage(business: Business): string {
    return business.logo_url || business.cover_image_url || 'assets/default-business.jpg';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewBusinessDetails(businessId: string): void {
    this.router.navigate(['/business', businessId]);
  }

  get isAuthenticated(): boolean {
    return this.authService.checkIsLogged();
  }
}

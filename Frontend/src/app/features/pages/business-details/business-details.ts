import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../../shared/services/business';
import { ServiceService } from '../../../shared/services/service.service';
import { AppointmentService } from '../../../shared/services/appointment.service';
import { AuthService } from '../../../shared/services/auth';
import { Business } from '../../../shared/interfaces/business';
import { Service } from '../../../shared/interfaces/service';
import { DayAvailability, AppointmentTimeSlot } from '../../../shared/interfaces/appointment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-business-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-details.html',
  styleUrls: ['./business-details.css'],    
})
export class BusinessDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private serviceService = inject(ServiceService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);

  business: Business | null = null;
  services: Service[] = [];
  selectedService: Service | null = null;
  selectedDate: string = '';
  selectedTime: string = '';
  availability: DayAvailability | null = null;
  isLoading = false;

  currentMonth = new Date();
  calendarDays: Date[] = [];
  selectedCalendarDate: Date | null = null;

  ngOnInit(): void {
    if (!this.authService.checkIsLogged()) {
      this.router.navigate(['/login']);
      return;
    }

    const businessId = this.route.snapshot.paramMap.get('id');
    if (businessId) {
      this.loadBusinessDetails(businessId);
      this.loadServices(businessId);
      this.generateCalendar();
    }
  }

  loadBusinessDetails(businessId: string): void {
    this.businessService.getBusinessById(businessId).subscribe({
      next: (business) => {
        this.business = business;
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo cargar la información del negocio', 'error');
        this.router.navigate(['/home']);
      }
    });
  }

  loadServices(businessId: string): void {
    this.serviceService.getServicesByBusinessId(businessId).subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
      }
    });
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    this.calendarDays = [];
    
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - i - 1);
      this.calendarDays.push(day);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      this.calendarDays.push(new Date(year, month, day));
    }
    
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      this.calendarDays.push(new Date(year, month + 1, day));
    }
  }

  selectService(service: Service): void {
    this.selectedService = service;
    this.selectedDate = '';
    this.selectedTime = '';
    this.availability = null;
  }

  selectDate(date: Date): void {
    if (!this.selectedService) {
      Swal.fire('Selecciona un servicio', 'Primero debes seleccionar un servicio', 'warning');
      return;
    }

    this.selectedCalendarDate = date;
    this.selectedDate = this.formatDate(date);
    this.loadAvailability();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadAvailability(): void {
    if (!this.selectedService || !this.selectedDate) return;

    this.isLoading = true;
    this.appointmentService.getBusinessAvailability(this.selectedService.business_id, this.selectedDate, this.selectedService.id).subscribe({
      next: (availability) => {
        this.availability = availability;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando disponibilidad:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudo cargar la disponibilidad', 'error');
      }
    });
  }

  selectTimeSlot(timeSlot: AppointmentTimeSlot): void {
    if (!timeSlot.available) {
      Swal.fire('Horario no disponible', timeSlot.reason || 'Este horario no está disponible', 'warning');
      return;
    }
    
    this.selectedTime = timeSlot.time;
  }

  bookAppointment(): void {
    if (!this.selectedService || !this.selectedDate || !this.selectedTime) {
      Swal.fire('Campos requeridos', 'Selecciona servicio, fecha y hora', 'warning');
      return;
    }

    if (!this.authService.checkIsLogged()) {
      Swal.fire({
        title: 'Inicia sesión requerido',
        text: 'Debes iniciar sesión para hacer una reserva',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Iniciar Sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const startTime = new Date(`2000-01-01T${this.selectedTime}`);
    const endTime = new Date(startTime.getTime() + this.selectedService.duration_minutes * 60000);
    const endTimeString = endTime.toTimeString().substring(0, 5);

    const appointmentData = {
      business_id: this.selectedService.business_id,
      service_id: this.selectedService.id,
      appointment_date: this.selectedDate,
      start_time: this.selectedTime,
      notes: ''
    };

    Swal.fire({
      title: 'Confirmar Reserva',
      html: `
        <div style="text-align: left;">
          <p><strong>Servicio:</strong> ${this.selectedService.name}</p>
          <p><strong>Fecha:</strong> ${this.formatDisplayDate(this.selectedDate)}</p>
          <p><strong>Hora:</strong> ${this.selectedTime} - ${endTimeString}</p>
          <p><strong>Duración:</strong> ${this.selectedService.duration_minutes} minutos</p>
          <p><strong>Precio:</strong> $${this.selectedService.price}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Reserva',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService.createAppointment(appointmentData).subscribe({
          next: (appointment) => {
            Swal.fire('¡Reserva Confirmada!', 'Tu cita ha sido agendada exitosamente', 'success');
            this.router.navigate(['/my-appointments']);
          },
          error: (error) => {
            if (error.status === 403) {
              Swal.fire('Error de autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
              this.router.navigate(['/login']);
            } else {
              Swal.fire('Error', 'No se pudo realizar la reserva', 'error');
            }
          }
        });
      }
    });
  }

  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  navigateMonth(direction: 'prev' | 'next'): void {
    if (direction === 'prev') {
      this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    } else {
      this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    }
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date): boolean {
    return this.selectedCalendarDate?.toDateString() === date.toDateString();
  }

  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}

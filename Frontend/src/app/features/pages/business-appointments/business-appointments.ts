import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../shared/services/appointment.service';
import { BusinessService } from '../../../shared/services/business';
import { AuthService } from '../../../shared/services/auth';
import { Appointment } from '../../../shared/interfaces/appointment';
import { Business } from '../../../shared/interfaces/business';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-business-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-appointments.html',
  styleUrl: './business-appointments.css',        
})
export class BusinessAppointmentsComponent implements OnInit {
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private businessService = inject(BusinessService);
  private authService = inject(AuthService);

  appointments = signal<Appointment[]>([]);
  business = signal<Business | null>(null);
  loading = signal(true);
  selectedDate = signal<string>('');
  selectedStatus = signal<string>('all');

  statusFilter = signal<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  dateFilter = signal<string>('');

  ngOnInit(): void {
    if (!this.authService.checkIsLogged()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isBusinessUser()) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Solo los usuarios de negocio pueden acceder a esta página'
      });
      this.router.navigate(['/home']);
      return;
    }

    this.loadBusinessData();
  }

  loadBusinessData(): void {
    this.businessService.getMyBusinesses().subscribe({
      next: (businesses) => {
        if (businesses.length > 0) {
          this.business.set(businesses[0]);
          this.loadAppointments(businesses[0].id);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Sin negocio',
            text: 'Primero debes crear un negocio para gestionar citas'
          });
          this.router.navigate(['/business-profile']);
        }
      },
      error: (error) => {
        console.error('Error cargando negocio:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del negocio'
        });
        this.loading.set(false);
      }
    });
  }

  loadAppointments(businessId: string): void {
    this.loading.set(true);
    this.appointmentService.getBusinessAppointments(businessId).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las citas'
        });
        this.loading.set(false);
      }
    });
  }

  updateAppointmentStatus(appointment: Appointment, newStatus: 'confirmed' | 'cancelled' | 'completed'): void {
    const statusLabels = {
      confirmed: 'confirmar',
      cancelled: 'cancelar',
      completed: 'marcar como completada'
    };

    Swal.fire({
      title: `¿${statusLabels[newStatus]} esta cita?`,
      html: `
        <div style="text-align: left;">
          <p><strong>Cliente:</strong> ${appointment.client?.name || 'N/A'}</p>
          <p><strong>Servicio:</strong> ${appointment.service?.name || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${this.formatDate(appointment.appointment_date)}</p>
          <p><strong>Hora:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
          <p><strong>Estado actual:</strong> ${this.getStatusLabel(appointment.status)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService.updateAppointmentStatus(appointment.id, newStatus).subscribe({
          next: (updatedAppointment) => {
            const currentAppointments = this.appointments();
            const index = currentAppointments.findIndex(apt => apt.id === appointment.id);
            if (index !== -1) {
              currentAppointments[index] = updatedAppointment;
              this.appointments.set([...currentAppointments]);
            }

            Swal.fire({
              icon: 'success',
              title: '¡Actualizado!',
              text: `La cita ha sido ${statusLabels[newStatus]}da correctamente`
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el estado de la cita'
            });
          }
        });
      }
    });
  }

  getFilteredAppointments(): Appointment[] {
    let filtered = this.appointments();

    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(apt => apt.status === this.statusFilter());
    }

    if (this.dateFilter()) {
      filtered = filtered.filter(apt => apt.appointment_date === this.dateFilter());
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.appointment_date + 'T' + a.start_time);
      const dateB = new Date(b.appointment_date + 'T' + b.start_time);
      return dateA.getTime() - dateB.getTime();
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    return classes[status] || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  }

  getUpcomingAppointments(): Appointment[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getFilteredAppointments().filter(apt => 
      apt.appointment_date >= today && 
      (apt.status === 'pending' || apt.status === 'confirmed')
    );
  }

  getPastAppointments(): Appointment[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getFilteredAppointments().filter(apt => 
      apt.appointment_date < today || 
      apt.status === 'cancelled' || 
      apt.status === 'completed'
    );
  }

  clearFilters(): void {
    this.statusFilter.set('all');
    this.dateFilter.set('');
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.statusFilter.set(target.value as any);
  }

  onDateFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateFilter.set(target.value);
  }

  getPendingCount(): number {
    return this.appointments().filter(apt => apt.status === 'pending').length;
  }

  getConfirmedCount(): number {
    return this.appointments().filter(apt => apt.status === 'confirmed').length;
  }

  getCompletedCount(): number {
    return this.appointments().filter(apt => apt.status === 'completed').length;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

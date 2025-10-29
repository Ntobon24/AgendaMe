import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../shared/services/appointment.service';
import { AuthService } from '../../../shared/services/auth';
import { Appointment } from '../../../shared/interfaces/appointment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-appointments.html',
  styleUrl: './client-appointments.css'
})
export class ClientAppointmentsComponent implements OnInit {
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);

  appointments = signal<Appointment[]>([]);
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

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.appointmentService.getClientAppointments().subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar tus citas'
        });
        this.loading.set(false);
      }
    });
  }

  cancelAppointment(appointment: Appointment): void {
    Swal.fire({
      title: '¿Cancelar esta cita?',
      html: `
        <div style="text-align: left;">
          <p><strong>Negocio:</strong> ${appointment.business?.name || 'N/A'}</p>
          <p><strong>Servicio:</strong> ${appointment.service?.name || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${this.formatDate(appointment.appointment_date)}</p>
          <p><strong>Hora:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
          <p><strong>Estado:</strong> ${this.getStatusLabel(appointment.status)}</p>
        </div>
        <p style="margin-top: 1rem; color: #e74c3c; font-weight: bold;">
          Esta acción no se puede deshacer
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Mantener cita',
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService.cancelAppointment(appointment.id).subscribe({
          next: () => {
            const currentAppointments = this.appointments();
            const index = currentAppointments.findIndex(apt => apt.id === appointment.id);
            if (index !== -1) {
              currentAppointments[index] = { ...currentAppointments[index], status: 'cancelled' };
              this.appointments.set([...currentAppointments]);
            }

            Swal.fire({
              icon: 'success',
              title: 'Cita cancelada',
              text: 'Tu cita ha sido cancelada correctamente'
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cancelar la cita'
            });
          }
        });
      }
    });
  }

  rescheduleAppointment(appointment: Appointment): void {
    Swal.fire({
      title: 'Reagendar Cita',
      text: 'Esta funcionalidad estará disponible próximamente. Por ahora, puedes cancelar esta cita y crear una nueva.',
      icon: 'info',
      confirmButtonText: 'Entendido'
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
      return dateB.getTime() - dateA.getTime();
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

  bookNewAppointment(): void {
    this.router.navigate(['/home']);
  }

  canCancelAppointment(appointment: Appointment): boolean {
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = appointment.appointment_date;
    
    return (appointment.status === 'pending' || appointment.status === 'confirmed') && 
           appointmentDate > today;
  }

  getAppointmentStatusMessage(appointment: Appointment): string {
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = appointment.appointment_date;
    
    if (appointment.status === 'pending') {
      return 'Esperando confirmación del negocio';
    } else if (appointment.status === 'confirmed') {
      if (appointmentDate === today) {
        return 'Tu cita es hoy';
      } else if (appointmentDate > today) {
        return 'Cita confirmada';
      } else {
        return 'Cita completada';
      }
    } else if (appointment.status === 'cancelled') {
      return 'Cita cancelada';
    } else if (appointment.status === 'completed') {
      return 'Cita completada';
    }
    
    return '';
  }
}

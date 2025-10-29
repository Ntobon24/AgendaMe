import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth';
import { AdminService } from '../../../shared/services/admin.service';
import { TagService } from '../../../shared/services/tag.service';
import { User } from '../../../shared/interfaces/user';
import { Business } from '../../../shared/interfaces/business';
import { Tag } from '../../../shared/interfaces/tag';
import Swal from 'sweetalert2';

interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalServices: number;
  totalAppointments: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],        
})
export class AdminComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private tagService = inject(TagService);

  stats = signal<AdminStats | null>(null);
  users = signal<User[]>([]);
  businesses = signal<Business[]>([]);
  tags = signal<Tag[]>([]);
  isLoading = signal(false);
  activeTab = signal('stats');

  constructor() {
    this.checkAdminAccess();
    this.loadStats();
  }

  checkAdminAccess() {
    const user = this.authService.getUserLogged();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/']);
      Swal.fire('Acceso denegado', 'No tienes permisos de administrador', 'error');
    }
  }

  async loadStats() {
    this.isLoading.set(true);
    try {
      const stats = await this.adminService.getStats().toPromise();
      this.stats.set(stats || null);
    } catch (error) {
      console.error('Error loading stats:', error);
      Swal.fire('Error', 'Error al cargar las estadísticas', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadUsers() {
    this.isLoading.set(true);
    try {
      const users = await this.adminService.getAllUsers().toPromise();
      this.users.set(users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Swal.fire('Error', 'Error al cargar los usuarios', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadBusinesses() {
    this.isLoading.set(true);
    try {
      const businesses = await this.adminService.getAllBusinesses().toPromise();
      this.businesses.set(businesses || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
      Swal.fire('Error', 'Error al cargar los negocios', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadTags() {
    this.isLoading.set(true);
    try {
      const tags = await this.tagService.getAllTags().toPromise();
      this.tags.set(tags || []);
    } catch (error) {
      console.error('Error loading tags:', error);
      Swal.fire('Error', 'Error al cargar las etiquetas', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    
    switch (tab) {
      case 'users':
        this.loadUsers();
        break;
      case 'businesses':
        this.loadBusinesses();
        break;
      case 'tags':
        this.loadTags();
        break;
    }
  }

  async deactivateUser(userId: string) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará al usuario',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.adminService.deactivateUser(userId).toPromise();
        Swal.fire('Éxito', 'Usuario desactivado correctamente', 'success');
        this.loadUsers();
      } catch (error) {
        Swal.fire('Error', 'Error al desactivar el usuario', 'error');
      }
    }
  }

  async deactivateBusiness(businessId: string) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará el negocio',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.adminService.deactivateBusiness(businessId).toPromise();
        Swal.fire('Éxito', 'Negocio desactivado correctamente', 'success');
        this.loadBusinesses();
      } catch (error) {
        Swal.fire('Error', 'Error al desactivar el negocio', 'error');
      }
    }
  }

  async deleteBusiness(businessId: string) {
    const result = await Swal.fire({
      title: '¿Eliminar negocio?',
      text: 'Esta acción eliminará permanentemente el negocio y todos sus datos asociados. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.adminService.deleteBusiness(businessId).toPromise();
        Swal.fire('Éxito', 'Negocio eliminado correctamente', 'success');
        this.loadBusinesses();
      } catch (error) {
        Swal.fire('Error', 'Error al eliminar el negocio', 'error');
      }
    }
  }

  async createTag() {
    const { value: formValues } = await Swal.fire({
      title: 'Crear Nueva Etiqueta',
      html: `
        <input id="tagName" class="swal2-input" placeholder="Nombre de la etiqueta" required>
        <textarea id="tagDescription" class="swal2-textarea" placeholder="Descripción de la etiqueta"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = (document.getElementById('tagName') as HTMLInputElement).value;
        const description = (document.getElementById('tagDescription') as HTMLTextAreaElement).value;

        if (!name.trim()) {
          Swal.showValidationMessage('El nombre de la etiqueta es requerido');
          return false;
        }

        return { name: name.trim(), description: description.trim() };
      }
    });

    if (formValues) {
      try {
        await this.tagService.createTag(formValues).toPromise();
        Swal.fire('Éxito', 'Etiqueta creada correctamente', 'success');
        this.loadTags();
      } catch (error) {
        Swal.fire('Error', 'Error al crear la etiqueta', 'error');
      }
    }
  }

  async updateTag(tag: Tag) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Etiqueta',
      html: `
        <input id="tagName" class="swal2-input" placeholder="Nombre de la etiqueta" value="${tag.name}" required>
        <textarea id="tagDescription" class="swal2-textarea" placeholder="Descripción de la etiqueta">${tag.description || ''}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = (document.getElementById('tagName') as HTMLInputElement).value;
        const description = (document.getElementById('tagDescription') as HTMLTextAreaElement).value;

        if (!name.trim()) {
          Swal.showValidationMessage('El nombre de la etiqueta es requerido');
          return false;
        }

        return { name: name.trim(), description: description.trim() };
      }
    });

    if (formValues) {
      try {
        await this.tagService.updateTag(tag.id, formValues).toPromise();
        Swal.fire('Éxito', 'Etiqueta actualizada correctamente', 'success');
        this.loadTags();
      } catch (error) {
        Swal.fire('Error', 'Error al actualizar la etiqueta', 'error');
      }
    }
  }

  async deleteTag(tagId: string) {
    const result = await Swal.fire({
      title: '¿Eliminar etiqueta?',
      text: 'Esta acción eliminará permanentemente la etiqueta. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.tagService.deleteTag(tagId).toPromise();
        Swal.fire('Éxito', 'Etiqueta eliminada correctamente', 'success');
        this.loadTags();
      } catch (error) {
        Swal.fire('Error', 'Error al eliminar la etiqueta', 'error');
      }
    }
  }

  async toggleTagStatus(tag: Tag) {
    const action = tag.is_active ? 'desactivar' : 'activar';
    const result = await Swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} etiqueta?`,
      text: `Esta acción ${action}á la etiqueta "${tag.name}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: tag.is_active ? '#dc3545' : '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.tagService.updateTag(tag.id, { is_active: !tag.is_active }).toPromise();
        Swal.fire('Éxito', `Etiqueta ${action}da correctamente`, 'success');
        this.loadTags();
      } catch (error) {
        Swal.fire('Error', `Error al ${action} la etiqueta`, 'error');
      }
    }
  }

  async assignTagsToBusiness(business: Business) {
    const availableTags = this.tags().filter(tag => tag.is_active);
    
    if (availableTags.length === 0) {
      Swal.fire('Sin etiquetas', 'No hay etiquetas disponibles para asignar', 'info');
      return;
    }

    const currentTags = business.tags || [];
    
    const { value: selectedTags } = await Swal.fire({
      title: `Asignar Etiquetas a "${business.name}"`,
      html: `
        <div style="text-align: left; max-height: 300px; overflow-y: auto;">
          ${availableTags.map(tag => `
            <label style="display: block; margin: 10px 0; cursor: pointer;">
              <input type="checkbox" 
                     value="${tag.name}" 
                     ${currentTags.includes(tag.name) ? 'checked' : ''}
                     style="margin-right: 8px;">
              <strong>${tag.name}</strong>
              ${tag.description ? `<br><small style="color: #666;">${tag.description}</small>` : ''}
            </label>
          `).join('')}
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map((cb: any) => cb.value);
      }
    });

    if (selectedTags !== undefined) {
      try {
        await this.adminService.updateBusinessTags(business.id, selectedTags).toPromise();
        Swal.fire('Éxito', 'Etiquetas asignadas correctamente', 'success');
        this.loadBusinesses();
      } catch (error) {
        Swal.fire('Error', 'Error al asignar las etiquetas', 'error');
      }
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}

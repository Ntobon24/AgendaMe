import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BusinessService } from '../../../shared/services/business';
import { Business } from '../../../shared/interfaces/business';
import { AuthService } from '../../../shared/services/auth';
import { StorageService } from '../../../shared/services/storage.service';
import { ServiceService } from '../../../shared/services/service.service';
import { Service } from '../../../shared/interfaces/service';
import { DAYS_OF_WEEK, BusinessSchedule, DaySchedule } from '../../../shared/interfaces/schedule';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-business-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './business-profile.html',
  styleUrl: './business-profile.css',
})
export class BusinessProfileComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  businessService = inject(BusinessService);
  authService = inject(AuthService);
  storageService = inject(StorageService);
  serviceService = inject(ServiceService);

  existingBusiness: Business | null = null;
  isEditMode = false;
  selectedFiles: { [key: string]: File } = {};
  services: Service[] = [];
  daysOfWeek = DAYS_OF_WEEK;
  currentSchedules: BusinessSchedule = {};

  get currentUser() {
    return this.authService.getUserLogged();
  }

  businessForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    address: [''],
    phone: [''],
    email: [''],
    website: [''],
    logo_url: [''],
    cover_image_url: [''],
  });

  ngOnInit(): void {
    if (!this.authService.checkIsLogged()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isBusinessUser()) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Solo los usuarios de negocio pueden acceder a esta página',
      });
      this.router.navigate(['/home']);
      return;
    }

    this.loadBusiness();
  }

  loadBusiness(): void {
    this.businessService.getMyBusinesses().subscribe({
      next: (businesses) => {
        if (businesses.length > 0) {
          this.existingBusiness = businesses[0];
          this.isEditMode = true;
          this.businessForm.patchValue({
            name: this.existingBusiness.name,
            description: this.existingBusiness.description || '',
            address: this.existingBusiness.address || '',
            phone: this.existingBusiness.phone || '',
            email: this.existingBusiness.email || '',
            website: this.existingBusiness.website || '',
            logo_url: this.existingBusiness.logo_url || '',
            cover_image_url: this.existingBusiness.cover_image_url || '',
          });

          this.loadSchedules();

          this.loadServices();
        }
      },
      error: (error) => {
        console.error('Error al cargar negocios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los negocios',
        });
      },
    });
  }

  onFileSelected(event: any, field: 'logo_url' | 'cover_image_url'): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.businessForm.patchValue({ [field]: e.target.result });
      };
      reader.readAsDataURL(file);

      this.selectedFiles = this.selectedFiles || {};
      this.selectedFiles[field] = file;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.businessForm.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos correctamente',
      });
      return;
    }

    try {
      const businessData = { ...this.businessForm.value } as Partial<Business>;

      businessData.schedules = this.currentSchedules;

      if (this.selectedFiles['logo_url']) {
        const logoResult = await this.storageService
          .uploadBusinessImage(this.selectedFiles['logo_url'], this.existingBusiness?.id || 'temp')
          .toPromise();
        if (logoResult?.url) {
          businessData.logo_url = logoResult.url;
        }
      }

      if (this.selectedFiles['cover_image_url']) {
        const coverResult = await this.storageService
          .uploadBusinessImage(
            this.selectedFiles['cover_image_url'],
            this.existingBusiness?.id || 'temp'
          )
          .toPromise();
        if (coverResult?.url) {
          businessData.cover_image_url = coverResult.url;
        }
      }

      if (this.isEditMode && this.existingBusiness) {
        this.businessService.updateBusiness(this.existingBusiness.id, businessData).subscribe({
          next: (updatedBusiness) => {
            Swal.fire({
              icon: 'success',
              title: '¡Actualizado!',
              text: 'Tu perfil de negocio ha sido actualizado',
            });
            this.existingBusiness = updatedBusiness;
            this.selectedFiles = {};
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el perfil',
            });
          },
        });
      } else {
        const createData = {
          name: businessData.name!,
          description: businessData.description,
          address: businessData.address,
          phone: businessData.phone,
          email: businessData.email,
          website: businessData.website,
          logo_url: businessData.logo_url,
          cover_image_url: businessData.cover_image_url,
          schedules: businessData.schedules,
        };

        this.businessService.createBusiness(createData).subscribe({
          next: (newBusiness) => {
            Swal.fire({
              icon: 'success',
              title: '¡Creado!',
              text: 'Tu perfil de negocio ha sido creado',
            });
            this.existingBusiness = newBusiness;
            this.isEditMode = true;
            this.selectedFiles = {};
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo crear el perfil',
            });
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al subir las imágenes',
      });
    }
  }

  deleteBusiness(): void {
    if (!this.existingBusiness) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.businessService.deleteBusiness(this.existingBusiness!.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Tu perfil de negocio ha sido eliminado',
            });
            this.router.navigate(['/']);
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el perfil',
            });
          },
        });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.businessForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  loadServices(): void {
    if (!this.existingBusiness) return;

    this.serviceService.getServicesByBusinessId(this.existingBusiness.id).subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => {
        console.error('Error cargando servicios:', error);
      },
    });
  }

  addNewService(): void {
    Swal.fire({
      title: 'Agregar Nuevo Servicio',
      html: `
        <div style="text-align: left;">
          <input id="serviceName" class="swal2-input" placeholder="Nombre del servicio" required>
          <textarea id="serviceDescription" class="swal2-textarea" placeholder="Descripción del servicio"></textarea>
          <input id="servicePrice" class="swal2-input" type="number" placeholder="Precio" step="0.01" required>
          <input id="serviceDuration" class="swal2-input" type="number" placeholder="Duración en minutos" required>
          <input id="serviceImage" type="file" accept="image/*" class="swal2-input" placeholder="Imagen del servicio (opcional)">
          <div id="imagePreview" style="margin-top: 10px; text-align: center;"></div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const imageInput = document.getElementById('serviceImage') as HTMLInputElement;
        const preview = document.getElementById('imagePreview');

        imageInput.addEventListener('change', (e: any) => {
          const file = e.target.files[0];
          if (file && preview) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
          }
        });
      },
      preConfirm: () => {
        const name = (document.getElementById('serviceName') as HTMLInputElement).value;
        const description = (document.getElementById('serviceDescription') as HTMLTextAreaElement)
          .value;
        const price = parseFloat(
          (document.getElementById('servicePrice') as HTMLInputElement).value
        );
        const duration = parseInt(
          (document.getElementById('serviceDuration') as HTMLInputElement).value
        );
        const imageFile = (document.getElementById('serviceImage') as HTMLInputElement).files?.[0];

        if (!name || !price || !duration) {
          Swal.showValidationMessage('Por favor completa todos los campos requeridos');
          return false;
        }

        return { name, description, price, duration, imageFile };
      },
    }).then(async (result) => {
      if (result.isConfirmed && this.existingBusiness) {
        try {
          let imageUrl = '';

          if (result.value.imageFile) {
            const uploadResult = await this.storageService
              .uploadServiceImage(result.value.imageFile, 'temp')
              .toPromise();
            if (uploadResult?.url) {
              imageUrl = uploadResult.url;
            }
          }

          const serviceData = {
            business_id: this.existingBusiness.id,
            name: result.value.name,
            description: result.value.description,
            price: result.value.price,
            duration_minutes: result.value.duration,
            images: imageUrl ? [imageUrl] : [],
          };

          this.serviceService.createService(this.existingBusiness.id, serviceData).subscribe({
            next: (newService) => {
              this.services.push(newService);
              Swal.fire('¡Éxito!', 'Servicio agregado correctamente', 'success');
            },
            error: (error) => {
              Swal.fire('Error', 'No se pudo agregar el servicio', 'error');
            },
          });
        } catch (error) {
          Swal.fire('Error', 'Error al subir la imagen', 'error');
        }
      }
    });
  }

  editService(index: number): void {
    const service = this.services[index];

    Swal.fire({
      title: 'Editar Servicio',
      html: `
        <div style="text-align: left;">
          <input id="serviceName" class="swal2-input" placeholder="Nombre del servicio" value="${
            service.name
          }" required>
          <textarea id="serviceDescription" class="swal2-textarea" placeholder="Descripción del servicio">${
            service.description || ''
          }</textarea>
          <input id="servicePrice" class="swal2-input" type="number" placeholder="Precio" value="${
            service.price
          }" step="0.01" required>
          <input id="serviceDuration" class="swal2-input" type="number" placeholder="Duración en minutos" value="${
            service.duration_minutes
          }" required>
          <input id="serviceImage" type="file" accept="image/*" class="swal2-input" placeholder="Nueva imagen del servicio (opcional)">
          <div id="imagePreview" style="margin-top: 10px; text-align: center;">
            ${
              service.images && service.images.length > 0
                ? `<img src="${service.images[0]}" style="max-width: 200px; max-height: 150px; border-radius: 8px; margin-bottom: 10px;"><br><small>Imagen actual</small>`
                : '<small>Sin imagen</small>'
            }
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const imageInput = document.getElementById('serviceImage') as HTMLInputElement;
        const preview = document.getElementById('imagePreview');

        imageInput.addEventListener('change', (e: any) => {
          const file = e.target.files[0];
          if (file && preview) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 8px;"><br><small>Nueva imagen</small>`;
            };
            reader.readAsDataURL(file);
          }
        });
      },
      preConfirm: () => {
        const name = (document.getElementById('serviceName') as HTMLInputElement).value;
        const description = (document.getElementById('serviceDescription') as HTMLTextAreaElement)
          .value;
        const price = parseFloat(
          (document.getElementById('servicePrice') as HTMLInputElement).value
        );
        const duration = parseInt(
          (document.getElementById('serviceDuration') as HTMLInputElement).value
        );
        const imageFile = (document.getElementById('serviceImage') as HTMLInputElement).files?.[0];

        if (!name || !price || !duration) {
          Swal.showValidationMessage('Por favor completa todos los campos requeridos');
          return false;
        }

        return { name, description, price, duration, imageFile };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let imageUrl = service.images && service.images.length > 0 ? service.images[0] : '';

          if (result.value.imageFile) {
            const uploadResult = await this.storageService
              .uploadServiceImage(result.value.imageFile, service.id)
              .toPromise();
            if (uploadResult?.url) {
              imageUrl = uploadResult.url;
            }
          }

          const serviceData = {
            name: result.value.name,
            description: result.value.description,
            price: result.value.price,
            duration_minutes: result.value.duration,
            images: imageUrl ? [imageUrl] : [],
          };

          this.serviceService.updateService(service.id, serviceData).subscribe({
            next: (updatedService) => {
              this.services[index] = updatedService;
              Swal.fire('¡Éxito!', 'Servicio actualizado correctamente', 'success');
            },
            error: (error) => {
              Swal.fire('Error', 'No se pudo actualizar el servicio', 'error');
            },
          });
        } catch (error) {
          Swal.fire('Error', 'Error al subir la imagen', 'error');
        }
      }
    });
  }

  deleteService(index: number): void {
    const service = this.services[index];

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el servicio "${service.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceService.deleteService(service.id).subscribe({
          next: () => {
            this.services.splice(index, 1);
            Swal.fire('¡Eliminado!', 'Servicio eliminado correctamente', 'success');
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar el servicio', 'error');
          },
        });
      }
    });
  }

  loadSchedules(): void {
    if (this.existingBusiness?.schedules) {
      this.currentSchedules = { ...this.existingBusiness.schedules };
    } else {
      this.currentSchedules = {};
      this.daysOfWeek.forEach((day) => {
        this.currentSchedules[day.key] = {
          open: '09:00',
          close: '18:00',
          closed: true,
        };
      });
    }
  }

  isDayClosed(dayKey: string): boolean {
    const schedule = (this.currentSchedules as any)[dayKey];
    return schedule ? schedule.closed : true;
  }

  getDaySchedule(dayKey: string): DaySchedule | null {
    return (this.currentSchedules as any)[dayKey] || null;
  }

  toggleDay(dayKey: string, event: any): void {
    const isChecked = event.target.checked;

    if (!(this.currentSchedules as any)[dayKey]) {
      (this.currentSchedules as any)[dayKey] = {
        open: '09:00',
        close: '18:00',
        closed: !isChecked,
      };
    } else {
      (this.currentSchedules as any)[dayKey].closed = !isChecked;
    }
  }

  updateSchedule(dayKey: string, field: 'open' | 'close', event: any): void {
    const value = event.target.value;

    if (!(this.currentSchedules as any)[dayKey]) {
      (this.currentSchedules as any)[dayKey] = {
        open: '09:00',
        close: '18:00',
        closed: false,
      };
    }

    (this.currentSchedules as any)[dayKey][field] = value;
  }
}

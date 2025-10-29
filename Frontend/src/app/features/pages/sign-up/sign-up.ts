import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth';
import { User } from '../../../shared/interfaces/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUpComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  validators = [Validators.required, Validators.minLength(4)];

  signUpForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', this.validators],
    rePassword: ['', this.validators],
    name: ['', [Validators.required, Validators.minLength(2)]],
    role: ['client', [Validators.required]],
  });

  onSignUp(): void {
    if (!this.signUpForm.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor completa todos los campos correctamente',
      });
      return;
    }

    const formData = this.signUpForm.value;

    if (formData.password !== formData.rePassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    const userData = {
      email: formData.email!,
      password: formData.password!,
      username: formData.username!,
      name: formData.name!,
      role: formData.role as 'client' | 'business'
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Tu cuenta ha sido creada correctamente',
          });
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error en el registro',
          text: 'No se pudo crear la cuenta',
        });
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.signUpForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} es requerido`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
    }
    return '';
  }
}

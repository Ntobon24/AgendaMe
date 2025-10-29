import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth';
import { UserService } from '../../../shared/services/user.service';
import { StorageService } from '../../../shared/services/storage.service';
import { User } from '../../../shared/interfaces/user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private storageService = inject(StorageService);

  userProfileForm: FormGroup;
  currentUser = signal<User | null>(null);
  isEditing = signal(false);
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor() {
    this.userProfileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phone: [''],
      biography: ['']
    });

    setTimeout(() => {
      this.loadUserProfile();
    }, 1000);
  }

  loadUserProfile() {
    const user = this.authService.getUserLogged();
    if (user) {
      this.currentUser.set(user);
      this.userProfileForm.patchValue({
        name: user.name || '',
        email: user.email,
        username: user.username,
        phone: user.phone || '',
        biography: user.biography || ''
      });
      this.previewUrl = user.avatar_url || null;
    }
  }

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        this.storageService.validateFile(file);
        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  }

  async saveProfile() {
    if (this.userProfileForm.valid) {
      try {
        let avatarUrl = this.currentUser()?.avatar_url;

        if (this.selectedFile) {
          const uploadResult = await this.storageService.uploadAvatar(this.selectedFile).toPromise();
          if (uploadResult && uploadResult.url) {
            avatarUrl = uploadResult.url;
          }
        }

        const userData = {
          ...this.userProfileForm.value,
          avatar_url: avatarUrl
        };

        const updatedUser = await this.userService.updateUser(this.currentUser()?.id!, userData).toPromise();
        
        if (updatedUser) {
          this.authService.currentUser.set(updatedUser);
        }
        
        Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
        this.isEditing.set(false);
        this.selectedFile = null;
      } catch (error: any) {
        Swal.fire('Error', 'Error al actualizar el perfil', 'error');
        console.error('Error updating profile:', error);
      }
    }
  }

  cancelEdit() {
    this.loadUserProfile();
    this.isEditing.set(false);
    this.selectedFile = null;
    this.previewUrl = this.currentUser()?.avatar_url || null;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    
    const name = user.name || user.username || user.email;
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}

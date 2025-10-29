import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase;

  constructor(private configService: ConfigService) {
    const supabaseUrl = "https://mhufucvjcbxrtaymidaa.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odWZ1Y3ZqY2J4cnRheW1pZGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQzNjk1OCwiZXhwIjoyMDc3MDEyOTU4fQ.IYYTP9DvQrXIFIbTjxYb7CFiFG502ZXaAgcEyiQ0rHg";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(bucket: string, fileName: string, file: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('Storage service not configured. Please check Supabase credentials.');
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType,
        upsert: true
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async deleteFile(bucket: string, fileName: string): Promise<void> {
    if (!this.supabase) {
      throw new BadRequestException('Storage service not configured. Please check Supabase credentials.');
    }

    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async uploadUserAvatar(userId: string, file: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('Storage service not configured. Please check Supabase credentials.');
    }
    
    const fileName = `avatars/${userId}-${Date.now()}.${this.getFileExtension(contentType)}`;
    return this.uploadFile('user-files', fileName, file, contentType);
  }

  async uploadBusinessImage(businessId: string, file: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('Storage service not configured. Please check Supabase credentials.');
    }
    
    const fileName = `businesses/${businessId}-${Date.now()}.${this.getFileExtension(contentType)}`;
    return this.uploadFile('business-files', fileName, file, contentType);
  }

  async uploadServiceImage(serviceId: string, file: Buffer, contentType: string): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('Storage service not configured. Please check Supabase credentials.');
    }
    
    const fileName = `services/${serviceId}-${Date.now()}.${this.getFileExtension(contentType)}`;
    return this.uploadFile('service-files', fileName, file, contentType);
  }

  private getFileExtension(contentType: string): string {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    return extensions[contentType] || 'jpg';
  }

  validateFile(file: Express.Multer.File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)');
    }

    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. El tamaño máximo es 5MB');
    }
  }
}

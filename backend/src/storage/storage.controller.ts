import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.storageService.validateFile(file);
    
    const userId = req.user.sub;
    const fileUrl = await this.storageService.uploadUserAvatar(userId, file.buffer, file.mimetype);
    
    return {
      success: true,
      url: fileUrl,
      message: 'Avatar subido exitosamente'
    };
  }

  @Post('upload/business')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBusinessImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.storageService.validateFile(file);
    
    const businessId = req.body.businessId;
    if (!businessId) {
      throw new BadRequestException('ID del negocio requerido');
    }

    const fileUrl = await this.storageService.uploadBusinessImage(businessId, file.buffer, file.mimetype);
    
    return {
      success: true,
      url: fileUrl,
      message: 'Imagen del negocio subida exitosamente'
    };
  }

  @Post('upload/service')
  @UseInterceptors(FileInterceptor('file'))
  async uploadServiceImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.storageService.validateFile(file);
    
    const serviceId = req.body.serviceId;
    if (!serviceId) {
      throw new BadRequestException('ID del servicio requerido');
    }

    const fileUrl = await this.storageService.uploadServiceImage(serviceId, file.buffer, file.mimetype);
    
    return {
      success: true,
      url: fileUrl,
      message: 'Imagen del servicio subida exitosamente'
    };
  }
}

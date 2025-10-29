import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, AuthGuard, RoleGuard],
  exports: [StorageService],
})
export class StorageModule {}

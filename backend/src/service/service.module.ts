import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { Service } from './entities/service.entity';
import { Business } from '../business/entities/business.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Business]),
    AuthModule,
  ],
  controllers: [ServiceController],
  providers: [ServiceService, AuthGuard, RoleGuard],
  exports: [ServiceService],
})
export class ServiceModule {}

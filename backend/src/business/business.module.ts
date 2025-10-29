import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Business } from './entities/business.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business]),
    AuthModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService, AuthGuard, RoleGuard],
  exports: [BusinessService],
})
export class BusinessModule {}

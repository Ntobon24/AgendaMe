import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BusinessModule } from './business/business.module';
import { ServiceModule } from './service/service.module';
import { AppointmentModule } from './appointment/appointment.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { TagModule } from './tag/tag.module';
import { SearchModule } from './search/search.module';
import { User } from './user/entities/user.entity';
import { Business } from './business/entities/business.entity';
import { Service } from './service/entities/service.entity';
import { Appointment } from './appointment/entities/appointment.entity';
import { Tag } from './tag/entities/tag.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env', 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host:'db.mhufucvjcbxrtaymidaa.supabase.co',
        port: 5432,
        username:'postgres',
        password: 'KcC2N07vZIbmiChm',
        database: 'postgres',
        entities: [User, Business, Service, Appointment, Tag],
        synchronize: true, 
        autoLoadEntities: true,
        ssl: {
          rejectUnauthorized: false
        }
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    BusinessModule,
    ServiceModule,
    AppointmentModule,
    AdminModule,
    StorageModule,
    TagModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

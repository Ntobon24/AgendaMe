import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { Service } from '../service/entities/service.entity';
import { Appointment } from '../appointment/entities/appointment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  private checkAdminRole(userRole: string) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Acceso denegado. Se requiere rol de administrador.');
    }
  }

  async getStats(userRole: string) {
    this.checkAdminRole(userRole);

    const [totalUsers, totalBusinesses, totalServices, totalAppointments] = await Promise.all([
      this.userRepository.count({ where: { is_active: true } }),
      this.businessRepository.count({ where: { is_active: true } }),
      this.serviceRepository.count({ where: { is_active: true } }),
      this.appointmentRepository.count()
    ]);

    return {
      totalUsers,
      totalBusinesses,
      totalServices,
      totalAppointments,
    };
  }

  async getAllUsers(userRole: string) {
    this.checkAdminRole(userRole);
    return this.userRepository.find({
      order: { created_at: 'DESC' }
    });
  }

  async getUserById(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, updateUserDto: any, userRole: string) {
    this.checkAdminRole(userRole);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    user.is_active = false;
    await this.userRepository.save(user);
    return { message: 'Usuario eliminado exitosamente' };
  }

  async getAllBusinesses(userRole: string) {
    this.checkAdminRole(userRole);
    return this.businessRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' }
    });
  }

  async getBusinessById(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    return this.businessRepository.findOne({
      where: { id },
      relations: ['user', 'services']
    });
  }

  async updateBusiness(id: string, updateBusinessDto: any, userRole: string) {
    this.checkAdminRole(userRole);
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new Error('Negocio no encontrado');
    }
    Object.assign(business, updateBusinessDto);
    return this.businessRepository.save(business);
  }

  async deleteBusiness(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new Error('Negocio no encontrado');
    }
    business.is_active = false;
    await this.businessRepository.save(business);
    return { message: 'Negocio eliminado exitosamente' };
  }

  async hardDeleteBusiness(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new Error('Negocio no encontrado');
    }

    await this.appointmentRepository.delete({ business_id: id });
    await this.serviceRepository.delete({ business_id: id });
    await this.businessRepository.remove(business);     
    return { message: 'Negocio eliminado permanentemente' };
  }

  async updateBusinessTags(id: string, tags: string[], userRole: string) {
    this.checkAdminRole(userRole);
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new Error('Negocio no encontrado');
    }
    business.tags = Array.isArray(tags) ? tags : [];
    return this.businessRepository.save(business);
  }

  async getAllServices(userRole: string) {
    this.checkAdminRole(userRole);
    return this.serviceRepository.find({
      relations: ['business', 'business.user'],
      order: { created_at: 'DESC' }
    });
  }

  async getServiceById(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['business', 'business.user']
    });
  }

  async updateService(id: string, updateServiceDto: any, userRole: string) {
    this.checkAdminRole(userRole);
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new Error('Servicio no encontrado');
    }
    Object.assign(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async deleteService(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new Error('Servicio no encontrado');
    }
    service.is_active = false;
    await this.serviceRepository.save(service);
    return { message: 'Servicio eliminado exitosamente' };
  }

  async getAllAppointments(userRole: string) {
    this.checkAdminRole(userRole);
    return this.appointmentRepository.find({
      relations: ['service', 'business', 'client'],
      order: { created_at: 'DESC' }
    });
  }

  async getAppointmentById(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ['service', 'business', 'client']
    });
  }

  async updateAppointment(id: string, updateAppointmentDto: any, userRole: string) {
    this.checkAdminRole(userRole);
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Cita no encontrada');
    }
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async deleteAppointment(id: string, userRole: string) {
    this.checkAdminRole(userRole);
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new Error('Cita no encontrada');
    }
    appointment.status = 'cancelled';
    await this.appointmentRepository.save(appointment);
    return { message: 'Cita cancelada exitosamente' };
  }
}

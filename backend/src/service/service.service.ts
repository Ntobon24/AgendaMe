import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';
import { Business } from '../business/entities/business.entity';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async create(createServiceDto: CreateServiceDto, businessId: string, userId: string): Promise<Service> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, user_id: userId, is_active: true }
    });

    if (!business) {
      throw new UnauthorizedException('No tienes permiso para añadir servicios a este negocio');
    }

    const service = this.serviceRepository.create({
      ...createServiceDto,
      business_id: businessId,
    });

    return this.serviceRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { is_active: true },
      relations: ['business', 'business.user']
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id, is_active: true },
      relations: ['business', 'business.user']
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    return service;
  }

  async findByBusiness(businessId: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { business_id: businessId, is_active: true },
      relations: ['business', 'business.user']
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, userId: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id, is_active: true },
      relations: ['business']
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (service.business.user_id !== userId) {
      throw new UnauthorizedException('No tienes permiso para actualizar este servicio');
    }

    Object.assign(service, updateServiceDto);
    return this.serviceRepository.save(service);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const service = await this.serviceRepository.findOne({
      where: { id, is_active: true },
      relations: ['business']
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    if (service.business.user_id !== userId) {
      throw new UnauthorizedException('No tienes permiso para eliminar este servicio');
    }

    service.is_active = false;
    await this.serviceRepository.save(service);
    return { message: 'Servicio eliminado exitosamente' };
  }
}

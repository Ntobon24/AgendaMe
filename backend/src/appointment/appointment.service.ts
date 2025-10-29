import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { Service } from '../service/entities/service.entity';
import { Business } from '../business/entities/business.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, clientId: string): Promise<Appointment> {
    const service = await this.serviceRepository.findOne({
      where: { id: createAppointmentDto.service_id, is_active: true },
      relations: ['business']
    });

    if (!service) {
      throw new BadRequestException('Servicio no encontrado o inactivo');
    }

    const business = await this.businessRepository.findOne({
      where: { id: createAppointmentDto.business_id, is_active: true }
    });

    if (!business) {
      throw new BadRequestException('Negocio no encontrado o inactivo');
    }

    if (service.business_id !== createAppointmentDto.business_id) {
      throw new BadRequestException('El servicio no pertenece al negocio especificado');
    }

    const startTimeMinutes = this.timeToMinutes(createAppointmentDto.start_time);
    const endTimeMinutes = startTimeMinutes + service.duration_minutes;
    const endTime = this.minutesToTime(endTimeMinutes);

    const appointmentDate = new Date(createAppointmentDto.appointment_date);
    
    const dateString = createAppointmentDto.appointment_date;
    
    const allAppointmentsForDate = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.business_id = :businessId', { businessId: createAppointmentDto.business_id })
      .andWhere('DATE(appointment.appointment_date) = :date', { date: dateString })
      .orderBy('appointment.start_time', 'ASC')
      .getMany();

    const conflictingAppointments = allAppointmentsForDate.filter(apt => 
      apt.status === 'pending' || apt.status === 'confirmed'
    );

    const hasConflict = conflictingAppointments.some(appointment => {
      const appointmentStartMinutes = this.timeToMinutes(appointment.start_time);
      const appointmentEndMinutes = this.timeToMinutes(appointment.end_time);
      const newStartMinutes = this.timeToMinutes(createAppointmentDto.start_time);
      const newEndMinutes = this.timeToMinutes(endTime);

      return (newStartMinutes < appointmentEndMinutes && newEndMinutes > appointmentStartMinutes);
    });

    if (hasConflict) {
      throw new BadRequestException('Ya existe una cita en ese horario. Por favor, selecciona otro horario disponible.');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      client_id: clientId,
      end_time: endTime,
      status: 'pending'
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['service', 'business', 'client'],
      order: { appointment_date: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['service', 'business', 'client']
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    return appointment;
  }

  async findMyAppointments(clientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { client_id: clientId },
      relations: ['service', 'business'],
      order: { appointment_date: 'ASC' }
    });
  }

  async findBusinessAppointments(businessId: string, userId: string): Promise<Appointment[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, user_id: userId, is_active: true }
    });

    if (!business) {
      throw new UnauthorizedException('No tienes permiso para ver las citas de este negocio');
    }

    return this.appointmentRepository.find({
      where: { business_id: businessId },
      relations: ['service', 'client'],
      order: { appointment_date: 'ASC' }
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, userId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['business']
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (appointment.client_id !== userId && appointment.business.user_id !== userId) {
      throw new UnauthorizedException('No tienes permiso para actualizar esta cita');
    }

    if (updateAppointmentDto.appointment_date || updateAppointmentDto.start_time || updateAppointmentDto.end_time) {
      const appointmentDate = updateAppointmentDto.appointment_date 
        ? new Date(updateAppointmentDto.appointment_date) 
        : appointment.appointment_date;
        
      const conflictingAppointments = await this.appointmentRepository.find({
        where: {
          business_id: appointment.business_id,
          appointment_date: appointmentDate,
          status: Between('pending', 'confirmed')
        }
      });

      const hasConflict = conflictingAppointments.some(conflictAppointment => {
        if (conflictAppointment.id === id) return false;

        const appointmentStart = conflictAppointment.start_time;
        const appointmentEnd = conflictAppointment.end_time;
        const newStart = updateAppointmentDto.start_time || appointment.start_time;
        const newEnd = updateAppointmentDto.end_time || appointment.end_time;

        return (newStart < appointmentEnd && newEnd > appointmentStart);
      });

      if (hasConflict) {
        throw new BadRequestException('Ya existe una cita en ese horario');
      }
    }

    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['business']
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (appointment.client_id !== userId) {
      throw new UnauthorizedException('No tienes permiso para cancelar esta cita');
    }

    appointment.status = 'cancelled';
    await this.appointmentRepository.save(appointment);
    return { message: 'Cita cancelada exitosamente' };
  }

  async updateStatus(id: string, status: string, userId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['business']
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (appointment.business.user_id !== userId) {
      throw new UnauthorizedException('No tienes permiso para cambiar el estado de esta cita');
    }

    appointment.status = status as any;
    return this.appointmentRepository.save(appointment);
  }

  async getBusinessAvailability(businessId: string, date: string, serviceId?: string): Promise<any> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, is_active: true }
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    const schedules = business.schedules || {};
    const daySchedule = schedules[dayName];

    if (!daySchedule || daySchedule.closed) {
      return {
        date,
        available: false,
        timeSlots: []
      };
    }

    const allAppointmentsForDate = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.business_id = :businessId', { businessId })
      .andWhere('DATE(appointment.appointment_date) = :date', { date })
      .orderBy('appointment.start_time', 'ASC')
      .getMany();

    const existingAppointments = allAppointmentsForDate.filter(apt => 
      apt.status === 'pending' || apt.status === 'confirmed'
    );

    let serviceDuration = 30;
    if (serviceId) {
      const service = await this.serviceRepository.findOne({
        where: { id: serviceId, is_active: true }
      });
      if (service) {
        serviceDuration = service.duration_minutes;
      }
    }

    const timeSlots = this.generateTimeSlotsWithDuration(daySchedule.open, daySchedule.close, existingAppointments, serviceDuration);

    return {
      date,
      available: true,
      timeSlots
    };
  }

  async getBusinessAvailabilityRange(businessId: string, startDate: string, endDate: string): Promise<any[]> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, is_active: true }
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const availability: any[] = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayAvailability = await this.getBusinessAvailability(businessId, dateStr);
      availability.push(dayAvailability);
    }

    return availability;
  }

  private generateTimeSlots(openTime: string, closeTime: string, existingAppointments: Appointment[]): any[] {
    const slots: any[] = [];
    const openHour = parseInt(openTime.split(':')[0]);
    const openMinute = parseInt(openTime.split(':')[1]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    const closeMinute = parseInt(closeTime.split(':')[1]);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = this.timeToMinutes(appointment.start_time);
        const appointmentEnd = this.timeToMinutes(appointment.end_time);
        return minutes >= appointmentStart && minutes < appointmentEnd;
      });

      slots.push({
        time: timeString,
        available: !hasConflict,
        reason: hasConflict ? 'Horario ocupado' : undefined
      });
    }

    return slots;
  }

  private generateTimeSlotsWithDuration(openTime: string, closeTime: string, existingAppointments: Appointment[], serviceDuration: number): any[] {
    const slots: any[] = [];
    const openHour = parseInt(openTime.split(':')[0]);
    const openMinute = parseInt(openTime.split(':')[1]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    const closeMinute = parseInt(closeTime.split(':')[1]);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
          
    for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      const endMinutes = minutes + serviceDuration;

      if (endMinutes > closeMinutes) {
        slots.push({
          time: timeString,
          available: false,
          reason: 'No hay tiempo suficiente para el servicio'
        });
        continue;
      }

      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = this.timeToMinutes(appointment.start_time);
        const appointmentEnd = this.timeToMinutes(appointment.end_time);
        
        return (minutes < appointmentEnd && endMinutes > appointmentStart);
      });

      slots.push({
        time: timeString,
        available: !hasConflict,
        reason: hasConflict ? 'Horario ocupado' : undefined
      });
    }
    return slots;
  }

  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  async debugAppointments(businessId: string, date: string): Promise<any> {
    const appointmentDate = new Date(date);

    const allAppointments1 = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.business_id = :businessId', { businessId })
      .andWhere('DATE(appointment.appointment_date) = :date', { date })
      .orderBy('appointment.start_time', 'ASC')
      .getMany();

    const allAppointments2 = await this.appointmentRepository.find({
      where: {
        business_id: businessId
      },
      order: { appointment_date: 'ASC', start_time: 'ASC' }
    });

    return {
      businessId,
      date,
      appointmentDate: appointmentDate.toISOString(),
      allAppointments: allAppointments1.map(apt => ({
        id: apt.id,
        startTime: apt.start_time,
        endTime: apt.end_time,
        status: apt.status,
        clientId: apt.client_id,
        appointment_date: apt.appointment_date
      })),
      allBusinessAppointments: allAppointments2.map(apt => ({
        id: apt.id,
        startTime: apt.start_time,
        endTime: apt.end_time,
        status: apt.status,
        clientId: apt.client_id,
        appointment_date: apt.appointment_date
      }))
    };
  }
}

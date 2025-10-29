import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    const userId = req.user.sub;
    return this.appointmentService.create(createAppointmentDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get('client')
  @UseGuards(AuthGuard)
  findMyAppointments(@Request() req) {
    const userId = req.user.sub;
    return this.appointmentService.findMyAppointments(userId);
  }

  @Get('business/:businessId')
  @UseGuards(AuthGuard)
  findByBusinessId(@Param('businessId') businessId: string, @Request() req) {
    const userId = req.user.sub;
    return this.appointmentService.findBusinessAppointments(businessId, userId);
  }

  @Get('availability/:businessId/:date')
  getBusinessAvailability(
    @Param('businessId') businessId: string, 
    @Param('date') date: string,
    @Query('serviceId') serviceId?: string
  ) {
    return this.appointmentService.getBusinessAvailability(businessId, date, serviceId);
  }

  @Get('availability/:businessId/range')
  getBusinessAvailabilityRange(
    @Param('businessId') businessId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.appointmentService.getBusinessAvailabilityRange(businessId, startDate, endDate);
  }

  @Get('debug/:businessId/:date')
  debugAppointments(@Param('businessId') businessId: string, @Param('date') date: string) {
    return this.appointmentService.debugAppointments(businessId, date);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req) {
    const userId = req.user.sub;
    return this.appointmentService.updateStatus(id, body.status, userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @Request() req) {
    const userId = req.user.sub;
    return this.appointmentService.update(id, updateAppointmentDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.appointmentService.remove(id, userId);
  }
}

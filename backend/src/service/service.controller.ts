import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get('business/:businessId')
  findByBusinessId(@Param('businessId') businessId: string) {
    return this.serviceService.findByBusiness(businessId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Post(':businessId')
  @UseGuards(AuthGuard)
  create(@Param('businessId') businessId: string, @Body() createServiceDto: CreateServiceDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.serviceService.create(createServiceDto, businessId, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.serviceService.update(id, updateServiceDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.serviceService.remove(id, userId);
  }
}

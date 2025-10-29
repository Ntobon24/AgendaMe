import { Controller, Get, Post, Param, UseGuards, Request, Patch, Body, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats(@Request() req) {
    return this.adminService.getStats(req.user.role);
  }

  @Get('users')
  async getAllUsers(@Request() req) {
    return this.adminService.getAllUsers(req.user.role);
  }

  @Get('businesses')
  async getAllBusinesses(@Request() req) {
    return this.adminService.getAllBusinesses(req.user.role);
  }

  @Get('appointments')
  async getAllAppointments(@Request() req) {
    return this.adminService.getAllAppointments(req.user.role);
  }

  @Post('users/:id/deactivate')
  async deactivateUser(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteUser(id, req.user.role);
  }

  @Post('businesses/:id/deactivate')
  async deactivateBusiness(@Param('id') id: string, @Request() req) {
    return this.adminService.deleteBusiness(id, req.user.role);
  }

  @Patch('businesses/:id/tags')
  async updateBusinessTags(
    @Param('id') id: string,
    @Body('tags') tags: string[],
    @Request() req,
  ) {
    return this.adminService.updateBusinessTags(id, tags, req.user.role);
  }

  @Delete('businesses/:id')
  async hardDeleteBusiness(@Param('id') id: string, @Request() req) {
    return this.adminService.hardDeleteBusiness(id, req.user.role);
  }
}

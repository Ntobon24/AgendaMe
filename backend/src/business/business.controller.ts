import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  findAll() {
    return this.businessService.findAll();
  }

  @Get('my')
  @UseGuards(AuthGuard)
  findMyBusinesses(@Request() req: any) {
    const userId = req.user.sub;
    return this.businessService.findMyBusinesses(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createBusinessDto: CreateBusinessDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.businessService.create(createBusinessDto, userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto, @Request() req: any) {
    const userId = req.user.sub;
    return this.businessService.update(id, updateBusinessDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.businessService.remove(id, userId);
  }
}

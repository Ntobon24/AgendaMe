import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BusinessService } from '../business/business.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('businesses')
  async searchBusinesses(
    @Query('q') query?: string,
    @Query('tags') tags?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.businessService.search(query, tags, location, limitNum, offsetNum);
  }

  @Get('businesses/map')
  async getBusinessesForMap() {
    const businesses = await this.businessService.findAll();
    
    return businesses.map(business => ({
      id: business.id,
      name: business.name,
      address: business.address,
      phone: business.phone,
      email: business.email,
      tags: business.tags,
      coordinates: null 
    }));
  }
}

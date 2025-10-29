import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business } from './entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto, userId: string): Promise<Business> {
    const business = this.businessRepository.create({
      ...createBusinessDto,
      user_id: userId,
    });
    return this.businessRepository.save(business);
  }

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      where: { is_active: true },
      relations: ['user', 'services']
    });
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id, is_active: true },
      relations: ['user', 'services']
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }
    return business;
  }

  async findMyBusinesses(userId: string): Promise<Business[]> {
    return this.businessRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['user', 'services']
    });
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto, userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id, is_active: true }
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    if (business.user_id !== userId) {
      throw new UnauthorizedException('No tienes permiso para actualizar este negocio');
    }

    Object.assign(business, updateBusinessDto);
    return this.businessRepository.save(business);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const business = await this.businessRepository.findOne({
      where: { id, is_active: true }
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    if (business.user_id !== userId) {
      throw new UnauthorizedException('No tienes permiso para eliminar este negocio');
    }

    business.is_active = false;
    await this.businessRepository.save(business);
    return { message: 'Negocio eliminado exitosamente' };
  }

  async search(
    query?: string,
    tagsCsv?: string,
    location?: string,
    limit = 10,
    offset = 0,
  ): Promise<{ businesses: Business[]; total: number; limit: number; offset: number }> {
    const qb = this.businessRepository.createQueryBuilder('b');
    qb.where('b.is_active = :active', { active: true });

    if (query) {
      qb.andWhere('(LOWER(b.name) LIKE :q OR LOWER(b.description) LIKE :q)', {
        q: `%${query.toLowerCase()}%`,
      });
    }

    if (location) {
      qb.andWhere('LOWER(b.address) LIKE :loc', { loc: `%${location.toLowerCase()}%` });
    }

    if (tagsCsv) {
      const tagList = tagsCsv
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (tagList.length > 0) {
        qb.andWhere('(b.tags::jsonb) @> :tagsJson', { tagsJson: JSON.stringify(tagList) });
      }
    }

    qb.skip(offset).take(limit).orderBy('b.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { businesses: items, total, limit, offset };
  }
}

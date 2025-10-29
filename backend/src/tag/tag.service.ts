import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(name: string, description?: string): Promise<Tag> {
    const tag = this.tagRepository.create({ name, description });
    return this.tagRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { is_active: true },
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id, is_active: true }
    });

    if (!tag) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    return tag;
  }

  async update(id: string, name: string, description?: string): Promise<Tag> {
    const tag = await this.findOne(id);
    tag.name = name;
    tag.description = description;
    return this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<{ message: string }> {
    const tag = await this.findOne(id);
    tag.is_active = false;
    await this.tagRepository.save(tag);
    return { message: 'Etiqueta eliminada exitosamente' };
  }
}

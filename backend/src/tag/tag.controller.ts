import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TagService } from './tag.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('tag')
@UseGuards(AuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: { name: string; description?: string }, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new Error('Solo los administradores pueden crear etiquetas');
    }
    return this.tagService.create(createTagDto.name, createTagDto.description);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: { name: string; description?: string }, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new Error('Solo los administradores pueden actualizar etiquetas');
    }
    return this.tagService.update(id, updateTagDto.name, updateTagDto.description);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new Error('Solo los administradores pueden eliminar etiquetas');
    }
    return this.tagService.remove(id);
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest() {
    return {
      message: 'Backend funcionando correctamente',
      timestamp: new Date().toISOString(),
      status: 'OK',
      endpoints: {
        businesses: {
          'GET /businesses': 'Listar todos los negocios',
          'GET /businesses/:id': 'Ver negocio específico',
          'POST /businesses': 'Crear negocio (público temporal)',
          'GET /businesses/my': 'Mis negocios (público temporal)',
          'PATCH /businesses/:id': 'Actualizar negocio (público temporal)',
          'DELETE /businesses/:id': 'Eliminar negocio (público temporal)'
        },
        services: {
          'GET /services': 'Listar todos los servicios',
          'GET /services/business/:businessId': 'Servicios de un negocio',
          'GET /services/:id': 'Ver servicio específico',
          'POST /services/:businessId': 'Crear servicio (público temporal)',
          'PATCH /services/:id': 'Actualizar servicio (público temporal)',
          'DELETE /services/:id': 'Eliminar servicio (público temporal)'
        }
      }
    };
  }
}

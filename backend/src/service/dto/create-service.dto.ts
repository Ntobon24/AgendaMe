export class CreateServiceDto {
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
}

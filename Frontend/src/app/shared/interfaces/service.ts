export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  images?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

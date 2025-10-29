import { BusinessSchedule } from './schedule';

export interface Business {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  schedules?: BusinessSchedule;
  tags?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
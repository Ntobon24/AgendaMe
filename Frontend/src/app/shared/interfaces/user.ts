export interface User {
  id?: string;
  email: string;
  username: string;
  name?: string;
  avatar_url?: string;
  phone?: string;
  biography?: string;
  role: 'client' | 'business' | 'admin';
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
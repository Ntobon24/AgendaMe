export class CreateUserDto {
  email: string;
  username: string;
  name?: string;
  phone?: string;
  role: 'client' | 'business' | 'admin';
}

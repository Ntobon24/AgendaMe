export class RegisterDto {
  email: string;
  password: string;
  username: string;
  name?: string;
  role: 'client' | 'business';
}

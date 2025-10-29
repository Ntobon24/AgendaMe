import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.password) {
      throw new NotFoundException('Usuario sin contraseña configurada');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new NotFoundException('Contraseña incorrecta');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      username: user.username, 
      name: user.name,
      role: user.role 
    };
    
    return {
      success: true,
      message: 'Login exitoso',
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      }
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, username, name, role } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: [{ email }, { username }] });
    
    if (existingUser) {
      return {
        success: false,
        message: 'El email o nombre de usuario ya está en uso'
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
      name: name || '',
      role: role || 'client'
    });

    const savedUser = await this.userRepository.save(newUser);
    
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return {
      success: true,
      message: 'Registro exitoso',
      user: userWithoutPassword
    };
  }

  async logout() {
    return {
      success: true,
      message: 'Logout exitoso'
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  biography?: string;

  @Column({ 
    type: 'enum', 
    enum: ['client', 'business', 'admin'], 
    default: 'client' 
  })
  role: 'client' | 'business' | 'admin';

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Business, business => business.user)
  businesses: Business[];

  @OneToMany(() => Appointment, appointment => appointment.client)
  appointments: Appointment[];
}

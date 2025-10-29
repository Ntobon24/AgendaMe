import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Business } from '../../business/entities/business.entity';
import { Service } from '../../service/entities/service.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  client_id: string;

  @Column()
  business_id: string;

  @Column()
  service_id: string;

  @Column('date')
  appointment_date: Date;

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
  })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.appointments)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => Business, business => business.appointments)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ManyToOne(() => Service, service => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}

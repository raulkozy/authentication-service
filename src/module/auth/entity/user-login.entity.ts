import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelEnum, VerificationStatusEnum } from '../model/enum';
import { RefreshTokenEntity } from './refresh-token.entity';

@Entity('USER_LOGIN')
export class UserLoginEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  user_id: string;

  @Column('varchar')
  user_type: string;

  @CreateDateColumn({ type: 'timestamp' })
  last_login: Date;

  @Column('varchar', { length: 4000 })
  session_id: string;

  @Column('varchar', { default: 'null' })
  stepup_auth_status: VerificationStatusEnum;

  @Column('varchar')
  channel: ChannelEnum;

  @Column('varchar')
  location: string;

  @Column('varchar', { default: null })
  last_login_location: string;

  @Column('varchar', { default: null })
  device_id: string;

  @Column({ type: 'timestamp', default: null })
  last_stepup_auth_date: Date;

  @OneToOne(() => RefreshTokenEntity)
  @JoinColumn()
  refresh_token: RefreshTokenEntity;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
  
}

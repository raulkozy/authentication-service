import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusEnum } from '../model/enum';

@Entity('REFRESH_TOKEN')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column('varchar', { length: 4000 })
  // refresh_token_code: string;

  @Column('varchar', { length: 4000 })
  session_id: string;

  @Column('varchar', { default: StatusEnum.Active })
  status: StatusEnum;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

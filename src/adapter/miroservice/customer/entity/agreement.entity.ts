import { DateEntity } from '@shared/entity/date.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { YesOrNo } from '../model/enum';
import { CustomerEntity } from './customer.entity';

@Entity('CUSTOMER_AGREEMENT')
export class CustomerAgreementEntity extends DateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: null })
  url: string;

  @Column({ default: null })
  signed: YesOrNo;

  @Column({ default: null })
  signed_by: string;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn()
  customer: CustomerEntity;
}

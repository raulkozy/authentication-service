import { DateEntity } from '@shared/entity/date.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerEntity } from './customer.entity';

@Entity('CUSTOMER_TAX_RESIDENCY')
export class CustomerTaxResidencyEntity extends DateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  country_code: string;

  @Column({ default: null })
  tax_id: string;

  @Column({ default: null })
  comment: string;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn()
  customer: CustomerEntity;
}

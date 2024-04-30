import { DateEntity } from '@shared/entity/date.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VerificationStatusEnum } from '../model/enum';

import { AddressEntity } from './address.entity';

@Entity('CUSTOMER_VERIFICATION')
export class VerificationEntity extends DateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 24, unique: true })
  cvs_id: string;

  @Column('varchar', { length: 255, default: null })
  external_verification_id: string;

  @Column('varchar', { length: 255, default: null })
  last_name_for_verification: string;

  @Column('varchar', { length: 255, default: null })
  last_name_verification_reference_id: string;

  @Column('varchar', { length: 24, default: VerificationStatusEnum.Pending })
  name_verified: VerificationStatusEnum;

  @Column('varchar', { length: 4000, default: null })
  phone_verification_token: string;

  @Column('varchar', { length: 6, default: null })
  phone_verification_otp: string;

  @Column('varchar', { length: 24, default: VerificationStatusEnum.Pending })
  phone_verified: VerificationStatusEnum;

  @Column('varchar', { length: 255, default: null })
  email_for_verification: string;

  @Column('varchar', { length: 24, default: VerificationStatusEnum.Pending })
  email_verified: VerificationStatusEnum;

  @OneToOne(() => AddressEntity)
  @JoinColumn()
  address_for_verification: AddressEntity;

  @Column('varchar', { length: 255, default: null })
  address_verification_reference_id: string;

  @Column('varchar', { length: 24, default: VerificationStatusEnum.Pending })
  address_verified: VerificationStatusEnum;

  @Column('varchar', { length: 255, default: null })
  password_change_req_code: string;

  @Column('varchar', { length: 255, default: null })
  password_change_code: string;
}

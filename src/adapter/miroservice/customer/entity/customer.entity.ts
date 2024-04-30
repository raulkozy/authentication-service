import { DateEntity } from '@adapter/miroservice/shared/entity/date.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  CustomerRoleEnum,
  CustomerStatusEnum,
  EmploymentStatus,
  OnboardingStagesEnum,
  YesOrNo,
} from '../model/enum';
import { AddressEntity } from './address.entity';
import { CustomerAgreementEntity } from './agreement.entity';
import { CustomerTaxResidencyEntity } from './tax.entity';
import { VerificationEntity } from './verification.entity';

@Entity('CUSTOMER')
export class CustomerEntity extends DateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 36 })
  customer_id: string;

  @Column('varchar', { length: 36, default: null })
  cifid: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ default: null })
  avatar_url: string;

  @Column({ default: null })
  preferred_language: string;

  @Column({ default: null })
  preferred_currency: string;

  @Column({ default: null })
  primary_account_number: string;

  @Column({ unique: true })
  email: string;

  @Column('varchar', { length: 24, default: CustomerRoleEnum.Invitee })
  role: CustomerRoleEnum;

  @Column('varchar', { length: 255, default: null })
  password: string;

  @Column({ length: 4, default: null })
  phone_country_code: string;

  @Column({ length: 12, unique: true, default: null })
  phone_number: string;

  @Column({ type: 'date', default: null })
  dob: Date;

  @Column('varchar', { length: 24, default: CustomerStatusEnum.Active })
  status: CustomerStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @Column('varchar', { nullable: true })
  invitation_code: string;

  @OneToOne(() => AddressEntity)
  @JoinColumn()
  address: AddressEntity;

  @OneToOne(() => VerificationEntity)
  @JoinColumn()
  verification: VerificationEntity;

  @Column('varchar', { nullable: true })
  country_of_residence: string;

  @Column('varchar', { nullable: true })
  wait_list_notification: YesOrNo;

  //professional profile
  @Column('varchar', { nullable: true })
  employment_status: EmploymentStatus;

  @Column('varchar', { nullable: true })
  industry: string;

  @Column('varchar', { nullable: true })
  role_position: string;

  @Column('varchar', { default: YesOrNo.N })
  politically_expossed: YesOrNo;

  @Column('varchar', { nullable: true })
  source_of_wealth: string;

  //account profile

  @Column('varchar', { nullable: true })
  purpose_of_account: string;

  @Column('varchar', { nullable: true })
  countries_doing_buss_with: string;

  @Column('varchar', { nullable: true })
  anticipated_avg_cash_bal: string;

  @Column('varchar', { nullable: true })
  expected_assets_in_portfolio: string;

  @Column('varchar', { nullable: true })
  expected_num_transection: string;

  @Column('varchar', { nullable: true })
  expected_avg_transection_size: string;

  //tax relation
  @OneToMany(() => CustomerTaxResidencyEntity, (tax) => tax.customer)
  tax_residency: CustomerTaxResidencyEntity[];

  //agreement relation
  @OneToMany(() => CustomerAgreementEntity, (aggrement) => aggrement.customer)
  agreement: CustomerAgreementEntity[];

  //integration

  @Column('varchar', { nullable: true })
  applicant_id: string;

  @Column('varchar', { nullable: true })
  application_reference_number: string;

  @Column('varchar', { default: YesOrNo.N })
  add_deposit_product: string;

  @Column('varchar', { default: YesOrNo.N })
  enrich_deposit_product: string;

  @Column('varchar', { default: YesOrNo.N })
  call_approval: string;

  //extra
  @Column('varchar', {
    default: OnboardingStagesEnum.PhoneNumberVerification,
  })
  onboarding_stage: string;
}

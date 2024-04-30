import { DateEntity } from '@adapter/miroservice/shared/entity/date.entity';
import { Column, Entity } from 'typeorm';
import { ChannelIdEnum, FundTransferTypeEnum } from '../model/enum';
import {
  PaymentDelayFlagEnum,
  PaymentStatusEnum,
} from '../model/enum/payment.enum';

@Entity({ name: 'FUNDXFER' })
export class PaymentEntity extends DateEntity {
  @Column({ nullable: false, primary: true })
  id: string;

  @Column({ nullable: true })
  reference_no?: string;

  @Column({ nullable: true })
  trn_no?: string;

  @Column({ nullable: false })
  channel: ChannelIdEnum;

  @Column()
  cifid: string;

  @Column({ nullable: false })
  trn_type: FundTransferTypeEnum;

  @Column({ nullable: false, type: 'number' })
  amount_value: number;

  @Column({ length: 3, nullable: false })
  amount_crncy: string;

  @Column({ length: 3, nullable: false })
  service_id: string;

  @Column({ length: 2, nullable: false })
  service_type: string;

  @Column({ length: 48, nullable: false })
  debitor_id: string;

  @Column({ length: 48, nullable: false })
  debitor_acct_id: string;

  @Column({ length: 48, nullable: false })
  creditor_id: string;

  @Column({ length: 48, nullable: false })
  creditor_acct_id: string;

  @Column({ enum: PaymentStatusEnum, nullable: false })
  status?: PaymentStatusEnum;

  @Column({
    enum: PaymentDelayFlagEnum,
    default: PaymentDelayFlagEnum.N,
    nullable: false,
  })
  hidden?: PaymentDelayFlagEnum;
}

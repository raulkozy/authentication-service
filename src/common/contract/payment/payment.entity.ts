import {
  ChannelIdEnum,
  FundTransferTypeEnum,
  PaymentStatusEnum,
} from './payment.enum';

export class TransactionDTO {
  reference_no?: string;
  trn_no?: string;
  channel: ChannelIdEnum;
  cifid: string;
  trn_type: FundTransferTypeEnum;
  debitor_id: string;
  debitor_acct_id: string;
  creditor_id: string;
  creditor_acct_id: string;
  status?: PaymentStatusEnum;
  created_at?: Date;
}

import { PAYMENT_REPOSITORY } from '@adapter/miroservice/constant/provider';
import { PaymentContract } from '@common/contract/payment/payment.contract';
import { TransactionDTO } from '@common/contract/payment/payment.entity';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as moment from 'moment';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { PaymentEntity } from '../entity/inter-payment.entity';

@Injectable()
export class paymentService implements PaymentContract {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly _paymentRepository: Repository<PaymentEntity>,
  ) {}

  async GetLastTransactionToAccount(
    debitor_id: string,
    debitor_acct_id: string,
    creditor_acct_id: string,
    record_age_days = 90,
  ): Promise<TransactionDTO | null> {
    try {
      const data = await this._paymentRepository.findOne({
        where: {
          debitor_id: debitor_id,
          debitor_acct_id: debitor_acct_id,
          creditor_acct_id: creditor_acct_id,
          created_at: MoreThanOrEqual(
            new Date(moment().subtract(record_age_days, 'days').format()),
          ),
        },
      });

      if (data) {
        const transactionDTO = new TransactionDTO();

        transactionDTO.reference_no = data.reference_no;
        transactionDTO.trn_no = data.trn_no;
        transactionDTO.channel = data.channel;
        transactionDTO.cifid = data.cifid;
        transactionDTO.trn_type = data.trn_type;
        transactionDTO.debitor_id = data.debitor_id;
        transactionDTO.debitor_acct_id = data.debitor_acct_id;
        transactionDTO.creditor_id = data.creditor_acct_id;
        transactionDTO.creditor_acct_id = data.creditor_acct_id;
        transactionDTO.status = data.status;
        transactionDTO.created_at = data.created_at;
      } else {
        return null;
      }
    } catch (err) {
      Logger.error('Unable to fetch last transaction details', err);
      throw new InternalServerErrorException(
        'Unable to fetch last transaction details ',
      );
    }
  }
}

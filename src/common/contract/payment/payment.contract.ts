import { TransactionDTO } from './payment.entity';

export abstract class PaymentContract {
  abstract GetLastTransactionToAccount(
    debitor_id: string,
    debitor_acct_id: string,
    creditor_acct_id: string,
    record_age_days: number,
  ): Promise<TransactionDTO>;
}

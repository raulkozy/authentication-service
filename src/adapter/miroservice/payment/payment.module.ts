import { DatabaseModule } from '@config/database/db.module';
import { Module } from '@nestjs/common';
import { paymentProviders } from './payment.provider';
import { paymentService } from './service/payment.service';

@Module({
  imports: [DatabaseModule],
  providers: [paymentService, ...paymentProviders],
  exports: [paymentService],
})
export class PaymentModule {}

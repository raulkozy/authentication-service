import { DatabaseModule } from '@config/database/db.module';
import { Module } from '@nestjs/common';
import { customerProviders } from './customer.provider';
import { customerService } from './service/customer.service';

@Module({
  imports: [DatabaseModule],
  providers: [customerService, ...customerProviders],
  exports: [customerService],
})
export class PaymentModule {}

import { CustomerContract } from '@common/contract/customer/customer.contract';
import { DeviceContract } from '@common/contract/device/device.contract';
import { PaymentContract } from '@common/contract/payment/payment.contract';
import { DatabaseModule } from '@config/database/db.module';
import { AxiosModule } from '@module/http/http.module';
import { Module } from '@nestjs/common';
import { customerProviders } from './customer/customer.provider';
import { customerService } from './customer/service/customer.service';
import { deviceService } from './device/service/device.service';
import { paymentProviders } from './payment/payment.provider';
import { paymentService } from './payment/service/payment.service';

const providers = [
  { provide: DeviceContract, useClass: deviceService },
  { provide: PaymentContract, useClass: paymentService },
  { provide: CustomerContract, useClass: customerService },
  ...paymentProviders,
  ...customerProviders,
];

@Module({
  imports: [AxiosModule, DatabaseModule],
  providers: providers,
  exports: providers,
})
export class MicroserviceModule {}

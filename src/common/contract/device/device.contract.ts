import { DeviceDTO } from './device.entity';

export abstract class DeviceContract {
  abstract CheckActiveDevice(
    customer_id: string,
    device_id: string,
  ): Promise<DeviceDTO>;
}

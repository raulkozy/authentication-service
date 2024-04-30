import { IsNotEmpty } from 'class-validator';
import {
  DevicePlatformEnum,
  DeviceStatusEnum,
  DeviceTypeEnum,
} from './device.enum';

export class DeviceDTO {
  /** Unique identification number of the device */
  device_id?: string;

  /** Name of the device */
  name?: string;

  type?: DeviceTypeEnum;

  /** Platform details of the device: { IOS, Android, Web } */
  platform?: DevicePlatformEnum;

  /** Status of the device { Active, Inactive } */
  status?: DeviceStatusEnum;
}

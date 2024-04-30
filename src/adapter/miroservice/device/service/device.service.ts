import { AxiosHttpService } from '@module/http/http.service';
import { DEVICE_STATUS_CHECK_API_URL } from '../urlBuilder';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DeviceContract } from '@common/contract/device/device.contract';
import { DeviceDTO } from '@common/contract/device/device.entity';

@Injectable()
export class deviceService implements DeviceContract {
  constructor(private readonly _http: AxiosHttpService) {}

  async CheckActiveDevice(
    customer_id: string,
    device_id: string,
  ): Promise<DeviceDTO> {
    try {
      const result = await this._http.get(
        DEVICE_STATUS_CHECK_API_URL(customer_id, device_id),
      );
      if (result.statusCode === 200) {
        return result.data;
      } else if (
        result.statusCode === 400 ||
        result?.response?.status === 400
      ) {
        throw new BadRequestException('not a registerd device');
      } else {
        Logger.error(
          'Unable to check registerd device status. error: ',
          result,
          result.statusCode,
        );

        throw new InternalServerErrorException(
          'Unable to check registerd device status',
        );
      }
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      )
        throw err;

      throw new InternalServerErrorException(
        'Unable to check registerd device status',
      );
    }
  }
}

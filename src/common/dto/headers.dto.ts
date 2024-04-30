import { ChannelEnum } from '@module/auth/model/enum';
import { ApiProperty } from '@nestjs/swagger';

export class CommonHeadersDTO {
  /** Unique Id for request */
  @ApiProperty()
  readonly REQUESTUUID: string;

  /** Global Parent Id for request */
  @ApiProperty()
  readonly GLOBALUUID: string;

  @ApiProperty()
  readonly CHANNEL?: ChannelEnum;

  @ApiProperty()
  readonly DEVICE_ID?: string;
}

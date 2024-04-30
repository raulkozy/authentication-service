import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      info: {
        auth: {
          status: 'up',
        },
      },
      error: {},
    };
  }
}

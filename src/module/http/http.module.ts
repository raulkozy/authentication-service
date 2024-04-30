import { AxiosHttpService } from './http.service';
import { HttpModule, Module } from '@nestjs/common';

@Module({
  imports: [HttpModule],
  providers: [AxiosHttpService],
  exports: [AxiosHttpService],
})
export class AxiosModule {}

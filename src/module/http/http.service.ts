import { HttpService, Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class AxiosHttpService {
  private logger: Logger = new Logger(AxiosHttpService.name);

  constructor(private readonly _httpService: HttpService) {}

  public async get<T = any>(url: string, config?: AxiosRequestConfig) {
    try {
      let headers = {
        'Content-Type': 'application/json',
      };

      if (config && config.headers) headers = { headers, ...config.headers };

      const result = await this._httpService.get(url, { headers }).toPromise();

      return result.data;
    } catch (err) {
      return err;
    }
  }

  public async post<T = any, U = any>(
    url: string,
    data: U,
    config?: AxiosRequestConfig,
  ) {
    try {
      let headers = {
        'Content-Type': 'application/json',
      };

      if (config && config.headers) headers = { headers, ...config.headers };

      const result = await this._httpService
        .post(url, data, { headers })
        .toPromise();

      return result.data;
    } catch (err) {
      return err;
    }
  }

  public async put<T = any, U = any>(
    url: string,
    data: U,
    config?: AxiosRequestConfig,
  ) {
    try {
      let headers = {
        'Content-Type': 'application/json',
      };

      if (config && config.headers) headers = { headers, ...config.headers };

      const result = await this._httpService
        .put(url, data, { headers })
        .toPromise();

      return result.data;
    } catch (err) {
      return err;
    }
  }
}

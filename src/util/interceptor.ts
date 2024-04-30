import {
  ArgumentsHost,
  CallHandler,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface IResponse<T> {
  data: T;
  statusCode: number;
  error: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    const { headers, user } = context.switchToHttp().getRequest();

    headers['GLOBALUUID'] = headers['globaluuid'];
    headers['REQUESTUUID'] = headers['requestuuid'];
    if (headers['channel']) headers['CHANNEL'] = headers['channel'];
    if (headers['device_id']) headers['DEVICE_ID'] = headers['device_id'];
    if (headers['action']) headers['ACTION'] = headers['action'];
    if (headers['session']) headers['SESSION'] = headers['session'];
    if (headers['verification_method'])
      headers['VERIFICATION_METHOD'] = headers['verification_method'];
    if (headers['veridium_session'])
      headers['VERIDIUM_SESSION'] = headers['veridium_session'];
    if (headers['otp']) headers['OTP'] = headers['otp'];
    if (user && user['aud'] === 'customer') {
      headers['CUSTOMER_ID'] = user['customer_id'];
      headers['CUSTOMER_STATUS'] = user['status'];
      headers['SESSION_ID'] = user['session_id'];
    }

    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
        error: null,
      })),
    );
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const details = exception.getResponse()['details'];
    response.status(status).send({
      statusCode: status,
      data: null,
      error: {
        code: exception.getResponse()['statusCode'] || status,
        message: exception.message,
        details: details !== exception.message ? details : undefined,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(
          new HttpException(
            {
              statusCode: err.response?.errorCode,
              message: err.message,
              details: err.response?.details || err.response?.message,
            },
            err.status || HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        ),
      ),
    );
  }
}

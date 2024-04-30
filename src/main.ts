import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import {
  ErrorsInterceptor,
  HttpExceptionFilter,
  ResponseInterceptor,
} from './util/interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Auth Service')
    .setVersion('1.0')
    .addBearerAuth(
      {
        in: 'header',
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
      },
      'Authorization', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    );

  if (process.env.NODE_ENV === 'production') {
    config.addServer('/authentication');
  }

  app.use(compression());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new ErrorsInterceptor());

  const document = SwaggerModule.createDocument(app, config.build());
  SwaggerModule.setup('/api', app, document);

  await app.listen(parseInt(process.env.SERVICE_PORT, 10) || 3000, '0.0.0.0');
}
bootstrap();

import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

/**
 * Applied by main.ts AND e2e tests so both run the exact same pipeline:
 * /api/v1 prefix, validation, serialization, error shape, security headers.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(helmet());

  const config = app.get(ConfigService);
  app.enableCors({ origin: config.getOrThrow<string>('app.corsOrigin') });
  app.enableShutdownHooks();
}

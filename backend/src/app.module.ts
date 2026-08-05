import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { LikesModule } from './modules/likes/likes.module';
import { StoriesModule } from './modules/stories/stories.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        errorMessage: 'Too many requests — please try again later',
        throttlers: [
          {
            ttl: config.getOrThrow<number>('security.throttleTtl'),
            limit: config.getOrThrow<number>('security.throttleLimit'),
          },
        ],
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StoriesModule,
    CommentsModule,
    LikesModule,
  ],
  controllers: [HealthController],
  providers: [
    // Protected-by-default: every route requires a bearer token unless @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

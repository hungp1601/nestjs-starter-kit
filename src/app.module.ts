import {
  ClassSerializerInterceptor,
  Global,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { getConfig } from './services/app-config/configuration';
import { AppCacheModule } from './app-cache/app-cache.module';
import { LoggerModule } from './logger/logger.module';
import { AsyncStorageMiddleware } from './global/middleware/async-storage/async-storage.middleware';
import { GlobalModule } from './global/global.module';
import { HealthModule } from './health/health.module';
import { IsUserEmailExists } from './user/validators/user.validator';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';

const modules = [UserModule];

@Global()
@Module({
  imports: [
    GlobalModule,
    ConfigModule.forRoot({
      cache: true,
      load: [getConfig],
      isGlobal: true,
    }),
    DbModule,
    AppCacheModule,
    ConfigModule,
    LoggerModule,
    HealthModule,
    ...modules,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      inject: [Reflector],
      useFactory: (reflector: Reflector) => {
        return new ClassSerializerInterceptor(reflector, {
          enableImplicitConversion: true,
        });
      },
    },
    IsUserEmailExists,
  ],
  exports: [...modules, IsUserEmailExists],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncStorageMiddleware).forRoutes('*');
  }
}

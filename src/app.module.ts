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
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ConversationsModule } from './conversation/conversations.module';

const modules = [
  UserModule,
  ConversationsModule,
  DbModule,
  AppCacheModule,
  ConfigModule,
  LoggerModule,
  HealthModule,
];

@Global()
@Module({
  imports: [
    GlobalModule,
    ConfigModule.forRoot({
      cache: true,
      load: [getConfig],
      isGlobal: true,
    }),
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
  ],
  exports: [...modules],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AsyncStorageMiddleware).forRoutes('*');
  }
}

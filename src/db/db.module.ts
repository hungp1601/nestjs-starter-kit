import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConfig } from '../services/app-config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const {
          database: { host, port, password, user, dbName },
          cache,
        } = getConfig();

        return {
          type: 'mysql',
          host,
          port,
          username: user,
          synchronize: true,
          password,
          database: dbName,
          autoLoadEntities: true,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          subscribers: [__dirname + '/../**/*.subscriber{.ts,.js}'],
          // cache: {
          //   type: 'redis',
          //   options: {
          //     socket: {
          //       host: cache.host,
          //       port: cache.port,
          //       duration: 60 * 1000, // 60 seconds
          //     },
          //   },
          // },
        };
      },
    }),
  ],
})
export class DbModule {}

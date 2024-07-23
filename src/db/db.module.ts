import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConfig } from '../services/app-config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const {
          database: { host, port, password, user, dbName },
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
        };
      },
    }),
  ],
})
export class DbModule {}

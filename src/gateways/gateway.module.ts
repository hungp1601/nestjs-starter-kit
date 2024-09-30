import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Module({
  imports: [],
  providers: [AppGateway],
  controllers: [],
})
export class GatewayModule {}

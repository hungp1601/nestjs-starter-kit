import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthService } from './services/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user/user.service';
import { PasswordService } from './services/password/password.service';
import { JwtService } from './services/jwt/jwt.service';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './services/auth/strategies/jwt/jwt.strategy';
import { AppCacheModule } from '../app-cache/app-cache.module';
import { RefreshTokenService } from './services/refresh-token/refresh-token.service';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { IsUserEmailExists } from './validators/user.validator';
// import { IsUserEmailExists } from './validators/user.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity]),
    ConfigModule,
    AppCacheModule,
  ],
  controllers: [UserController],
  providers: [
    AuthService,
    UserService,
    RefreshTokenService,
    PasswordService,
    JwtService,
    JwtStrategy,
    IsUserEmailExists,
  ],
  exports: [
    UserService,
    AuthService,
    AuthService,
    RefreshTokenService,
    PasswordService,
    IsUserEmailExists,
  ],
})
export class UserModule {}

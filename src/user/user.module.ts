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
import {
  IsUserEmailExists,
  IsValidPassword,
} from './validators/user.validator';
import { Profile } from './entities/profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './services/profile/profiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, Profile]),
    ConfigModule,
    AppCacheModule,
  ],
  controllers: [UserController, ProfilesController],
  providers: [
    AuthService,
    UserService,
    RefreshTokenService,
    PasswordService,
    JwtService,
    JwtStrategy,
    IsUserEmailExists,
    IsValidPassword,
    ProfilesService,
  ],
  exports: [
    UserService,
    AuthService,
    AuthService,
    RefreshTokenService,
    PasswordService,
    ProfilesService,
    JwtService,
  ],
})
export class UserModule {}

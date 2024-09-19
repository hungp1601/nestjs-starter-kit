import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto';
import { PasswordService } from '../password/password.service';
import { JwtService } from '../jwt/jwt.service';
import { BaseMysqlService } from 'src/base/services/base.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class UserService extends BaseMysqlService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => RefreshTokenService))
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    super(usersRepository);
  }

  async isUserExists(email: string): Promise<UserEntity | null> {
    return await this.findOne({
      where: {
        and: [
          {
            email: email.toLowerCase(),
          },
        ],
      },
    });
  }

  async createUser(userDto: CreateUserDto) {
    const userPayload: CreateUserDto = {
      email: userDto.email.toLowerCase(),
      name: userDto.name,
      password: await this.passwordService.generate(userDto.password),
    };

    const newUser = await this.createOne(userPayload);
    const token = this.getUserToken(newUser);
    const refreshToken = await this.getUserRefreshToken(newUser);

    return {
      ...newUser,
      token,
      refreshToken,
    };
  }

  async checkUserPassword(
    user: UserEntity,
    requestPassword: string,
  ): Promise<boolean> {
    return this.passwordService.compare(requestPassword, user.password);
  }

  public getUserToken(user: UserEntity): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.name,
    });
  }

  public async getUserRefreshToken(user: UserEntity): Promise<string> {
    return await this.refreshTokenService.createRefreshToken(user.id);
  }

  async refreshUserToken(refreshToken: string) {
    return await this.refreshTokenService.refreshNewToken(refreshToken);
  }
}

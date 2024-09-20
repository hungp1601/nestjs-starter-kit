import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto';
import { PasswordService } from '../password/password.service';
import { JwtService } from '../jwt/jwt.service';
import { BaseMysqlService } from 'src/base/services/base.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { ChangePasswordDto } from '@/user/dto/change-password.dto';

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

  async isUserExists(email: string) {
    try {
      return await this.findOne({
        where: {
          and: [
            {
              email: email.toLowerCase(),
            },
          ],
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createUser(userDto: CreateUserDto) {
    try {
      const userPayload: CreateUserDto = {
        email: userDto.email.toLowerCase(),
        name: userDto.name,
        password: await this.passwordService.generate(userDto.password),
      };

      const newUser = await this.createOne(userPayload);
      const refreshToken = await this.getUserRefreshToken(newUser);
      const token = this.getUserToken(newUser);

      return {
        user: newUser,
        token,
        refreshToken,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changePassword(
    { new_password, old_password }: ChangePasswordDto,
    user: UserEntity,
  ) {
    try {
      const isPasswordCorrect = await this.checkUserPassword(
        user,
        old_password,
      );

      if (!isPasswordCorrect) {
        throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
      }

      if (old_password === new_password) {
        throw new HttpException(
          'New password cannot be the same as the old password',
          HttpStatus.BAD_REQUEST,
        );
      }

      user.password = await this.passwordService.generate(new_password);
      await this.updateOne({
        where: {
          and: [{ id: user.id }],
        },
        entity: user,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
    try {
      return await this.refreshTokenService.createRefreshToken(user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshUserToken(refreshToken: string) {
    try {
      return await this.refreshTokenService.refreshNewToken(refreshToken);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

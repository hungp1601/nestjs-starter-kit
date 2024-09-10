import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dto/create-user.dto';
import { PasswordService } from '../password/password.service';
import { JwtService } from '../jwt/jwt.service';
import { BaseMysqlService } from 'src/base/services/base.service';

@Injectable()
export class UserService extends BaseMysqlService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
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

    return {
      ...newUser,
      token: this.getUserToken(newUser),
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
}

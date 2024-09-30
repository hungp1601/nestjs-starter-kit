import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
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

  async findUserAndMessageReadById(id: string, status: number | null) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.messages', 'messages')
      .where('messages.status = :status', { status })
      .andWhere({ id })
      .getOne();
  }

  async findAllConversation(user_id: string): Promise<UserEntity | null> {
    return await this.usersRepository
      .createQueryBuilder('users')
      .innerJoinAndSelect('users.conversations', 'conversations')
      .leftJoinAndSelect('conversations.users', 'usersInConversation')
      // .leftJoinAndSelect(
      //   'conversations.messages',
      //   'messages',
      //   'messages.conversation_id = conversations.id',
      // )
      .innerJoinAndMapOne(
        'conversations.messages',
        'conversations.messages',
        'messages',
        'messages.conversation_id = conversations.id',
      )
      .select([
        'users',
        'conversations',
        'usersInConversation',
        'userConversation.last_message_id',
        'messages',
      ])
      .innerJoinAndMapOne(
        'usersInConversation.last_message_id',
        'usersInConversation.userConversation',
        'userConversation',
        'userConversation.conversation_id = conversations.id',
      )
      .where('users.id = :id', { id: user_id })
      .orderBy('messages.id', 'DESC')
      .getOne()
      .then((entity) => {
        if (!entity) {
          return Promise.reject(new NotFoundException('Model not found'));
        }
        return Promise.resolve(entity ? entity : null);
      });
  }

  async findAllConversations(user_id: string): Promise<UserEntity | null> {
    const data = await this.findAllConversation(user_id);
    if (!data) {
      return null;
    }

    data.conversations = data.conversations
      ? data.conversations.map((conversation: any) => {
          conversation.users = conversation.users
            ? conversation.users.map((user: any) => {
                return {
                  ...user,
                  last_message_id:
                    user?.last_message_id?.last_message_id || null,
                };
              })
            : [];

          conversation.messages = conversation.messages
            ? [conversation.messages]
            : [];
          return conversation;
        })
      : [];

    return data;
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

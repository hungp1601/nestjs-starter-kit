import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseMysqlService } from 'src/base/services/base.service';
import { RefreshTokenEntity } from 'src/user/entities/refresh-token.entity';
import * as crypto from 'crypto-js';
import { UserService } from '../user/user.service';

@Injectable()
export class RefreshTokenService extends BaseMysqlService<RefreshTokenEntity> {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenEntity: Repository<RefreshTokenEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    super(refreshTokenEntity);
  }

  public async createRefreshToken(userId: number) {
    const token = crypto.SHA256(`${userId}-${new Date().getTime()}`).toString(); // generate a random token
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days from now

    await this.createOne({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  public async refreshNewToken(token: string) {
    try {
      const refreshToken = await this.findOne({
        where: {
          and: [
            {
              token,
            },
          ],
        },
      });
      const user = await this.userService.findOne({
        where: {
          and: [
            {
              id: refreshToken!.userId,
            },
          ],
        },
      });

      if (!refreshToken) {
        throw new Error('Invalid token');
      }

      if (refreshToken.expiresAt < new Date()) {
        throw new Error('Token expired');
      }

      if (refreshToken.isUsed) {
        throw new Error('Token already used');
      }

      const newRefreshToken = this.createRefreshToken(refreshToken.userId);
      const newToken = await this.userService.getUserToken(user!);

      return {
        user,
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      throw new Error('Invalid token' + e.message);
    }
  }
}

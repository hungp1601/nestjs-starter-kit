import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from '../../dto/login.dto';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(userDto: CreateUserDto) {
    // check if user exists and send custom error message
    try {
      return await this.userService.createUser(userDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(loginRequest: LoginDto) {
    try {
      const { email, password } = loginRequest;
      const user = await this.userService.isUserExists(email);

      if (!user) {
        return this.failLogin();
      }

      const isPasswordCorrect = await this.userService.checkUserPassword(
        user,
        password,
      );

      if (isPasswordCorrect) {
        const token = this.userService.getUserToken(user);
        const refreshToken = await this.userService.getUserRefreshToken(user);

        return {
          user,
          token,
          refreshToken,
        };
      }

      this.failLogin('Incorrect password');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      return await this.refreshTokenService.refreshNewToken(refreshToken);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private failLogin(message = 'Login failed') {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}

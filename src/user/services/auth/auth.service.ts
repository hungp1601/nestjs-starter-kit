import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    return await this.userService.createUser(userDto);
  }

  async login(loginRequest: LoginDto): Promise<string | void> {
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

      return token;
    }

    this.failLogin('Incorrect password');
  }

  async refreshToken(refreshToken: string) {
    return await this.refreshTokenService.refreshNewToken(refreshToken);
  }

  private failLogin(message = 'Login failed') {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}

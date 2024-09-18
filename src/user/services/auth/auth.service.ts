import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from '../../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(userDto: CreateUserDto) {
    // check if user exists and send custom error message
    if (await this.userService.isUserExists(userDto.email)) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

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

  private failLogin(message = 'Login failed') {
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }
}

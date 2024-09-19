import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './services/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from './services/user/user.service';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() user: CreateUserDto) {
    const newUser = await this.authService.register(user);

    return newUser;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() login: LoginDto) {
    const token = await this.authService.login(login);

    return {
      token,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers() {
    const users = await this.userService.findAll({});

    return {
      users,
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async refreshNewToken(@Body() body: RefreshTokenDto) {
    const users = await this.userService.findAll({});

    return {
      users,
    };
  }
}

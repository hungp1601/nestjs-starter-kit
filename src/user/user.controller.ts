import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '@/global/decorator/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import { ParamId } from '@/base/types/params-id';

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
  login(@Body() login: LoginDto) {
    return this.authService.login(login);
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

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshNewToken(@Body() body: RefreshTokenDto) {
    const response = await this.authService.refreshToken(body.token);

    return response;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@User() req: UserEntity) {
    const user = req;

    const res = await this.userService.findOne({
      where: {
        and: [{ id: user.id }],
      },
    });

    return res;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @User() user: UserEntity,
  ) {
    const response = await this.userService.changePassword(body, user);

    return response;
  }

  @ApiBearerAuth()
  @Get('messages/:id/:status')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async getByIdAndMessageStatus(@Param() params: any) {
    const user = await this.userService.findUserAndMessageReadById(
      params.id,
      params.status,
    );
    return user;
  }

  @ApiBearerAuth()
  @Get('conversation/:id')
  @UseGuards(JwtAuthGuard)
  async userConversation(@Param() params: ParamId) {
    const user = await this.userService.findOneById(params.id, {
      join: ['profile', 'conversations', 'conversations.messages'],
    });

    this.throwUserNotFound(user);
    return user;
  }

  @ApiBearerAuth()
  @Get('conversations/get')
  @UseGuards(JwtAuthGuard)
  async getAllConversation(@User() request: UserEntity) {
    const user = await this.userService.findAllConversations(request.id);
    this.throwUserNotFound(user);
    return user;
  }

  throwUserNotFound(user: UserEntity | null) {
    if (!user) {
      throw new HttpException("User don't exists", HttpStatus.NOT_FOUND);
    }
  }
}

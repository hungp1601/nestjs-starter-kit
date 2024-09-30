import {
  Get,
  Put,
  Post,
  Body,
  Delete,
  Param,
  Controller,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserConversationService } from './services/user-conversation.service';
import { ParamId } from '@/base/types/params-id';
import { UserConversation } from './entities/user-conversation.entity';
import { UpdateLastMessage } from './interfaces/user-conversation.interface';
import { ApiTags } from '@nestjs/swagger';

@Controller('user-conversation')
@ApiTags('user-conversation')
export class UserConversationController {
  constructor(
    private readonly userConversationService: UserConversationService,
  ) {}

  @Get('/')
  async index() {
    return this.userConversationService.findAll({});
  }

  @Get('/:id')
  async getById(@Param() params: ParamId) {
    const UserConversation = await this.userConversationService.findOneById(
      params.id,
    );
    return UserConversation;
  }

  @Post('/')
  async create(@Body() inputs: UserConversation) {
    return await this.userConversationService.create(inputs);
  }

  @Put('/:id')
  async update(@Param() params: ParamId, @Body() inputs: UserConversation) {
    return await this.userConversationService.updateOneById(params.id, inputs);
  }

  @Put('update/last-message')
  async updateLastMessageId(@Body() inputs: UpdateLastMessage) {
    const userConversation =
      await this.userConversationService.findDataUserConversation(
        inputs.user_id,
        inputs.conversation_id,
      );

    this.throwUserConversationNotFound(userConversation);

    const result = await this.userConversationService.updateLastMessageId(
      userConversation,
      inputs.message_id,
    );
    console.log(result);

    return result;
  }

  @Delete('/:id')
  async delete(@Param() params: ParamId) {
    return await this.userConversationService.deleteOneById(params.id);
  }

  throwUserConversationNotFound(UserConversation: UserConversation | null) {
    if (!UserConversation) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}

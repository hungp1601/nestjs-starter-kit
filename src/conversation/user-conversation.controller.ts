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

@Controller('user-conversation')
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
      parseInt(params.id, 10),
    );
    return UserConversation;
  }

  @Post('/')
  async create(@Body() inputs: UserConversation) {
    return await this.userConversationService.create(inputs);
  }

  @Put('/:id')
  async update(@Param() params: ParamId, @Body() inputs: UserConversation) {
    return await this.userConversationService.updateOneById(
      parseInt(params.id, 0),
      inputs,
    );
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
    return await this.userConversationService.deleteOneById(
      parseInt(params.id, 10),
    );
  }

  throwUserConversationNotFound(UserConversation: UserConversation | null) {
    if (!UserConversation) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}

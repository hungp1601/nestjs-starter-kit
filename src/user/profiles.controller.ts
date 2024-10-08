import { ParamId } from '@/base/types/params-id';
import { ProfilesService } from '@/user/services/profile/profiles.service';
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
import { Profile } from './entities/profile.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfilesService) {}

  @Get('/')
  async index() {
    return this.profileService.findAll({});
  }

  @Get('/:id')
  async getById(@Param() params: ParamId) {
    const Profile = await this.profileService.findOneById(params.id);
    this.throwProfileNotFound(Profile);
    return Profile;
  }

  @Post('/')
  async create(@Body() inputs: Profile) {
    return await this.profileService.create(inputs);
  }

  @Put('/:id')
  async update(@Param() params: ParamId, @Body() inputs: Profile) {
    return await this.profileService.updateOneById(params.id, inputs);
  }

  @Delete('/:id')
  async delete(@Param() params: ParamId) {
    return await this.profileService.deleteOneById(params.id);
  }

  throwProfileNotFound(Profile: Profile | null) {
    if (!Profile) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}

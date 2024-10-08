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
import { InformationService } from './services/information.service';
import { ParamId } from '@/base/types/params-id';
import { Information } from './entities/information.entity';
import { SaveInformationDto } from './dto/save.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('information')
@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Get('/')
  async index() {
    return this.informationService.findAll({});
  }

  @Get('/:id')
  async getById(@Param() params: ParamId) {
    const information = await this.informationService.findOneById(params.id);
    this.throwInformationNotFound(information);
    return information;
  }

  @Post('/')
  async create(@Body() inputs: SaveInformationDto): Promise<Information> {
    return await this.informationService.createOne(inputs as Information);
  }

  @Put('/:id')
  async update(@Param() params: ParamId, @Body() inputs: SaveInformationDto) {
    return await this.informationService.updateOneById(
      params.id,
      inputs as Information,
    );
  }

  @Delete('/:id')
  async delete(@Param() params: ParamId) {
    await this.informationService.deleteOneById(params.id);
    return { deleted: true };
  }

  throwInformationNotFound(Information: Information | null) {
    if (!Information) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}

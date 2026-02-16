import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JudulKegiatanService } from './judul_kegiatan.service';
import { UnitGuard } from '../../common/guard/unit.guard';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { JudulKegiatanResponse } from './transform/judul-kegiatan-response.transform';
import { Permissions } from '../../common/decorator/permission.decorator';
import { SearchJudulKegiatansDto } from './dto/search-judul-kegiatan.dto';
import { SearchJudulKegiatanlResponse } from './transform/search-judul-kegiatan-response.transform';
import { CreateJudulKegiatanDto } from './dto/create-judul-kegiatan.dto';
import { UpdateJudulKegiatanDto } from './dto/update-judul-kegiatan.dto';

@Controller('judul-kegiatan')
@UseGuards(UnitGuard)
export class JudulKegiatanController {
  constructor(private readonly jkService: JudulKegiatanService) {}

  @Transform(JudulKegiatanResponse)
  @Permissions('unit:read-judul-kegiatan')
  @Get()
  async findAll() {
    return await this.jkService.findAllJudulKegiatan();
  }

  @Transform(SearchJudulKegiatanlResponse)
  @Permissions('unit:search-judul-kegiatan')
  @Get('search')
  async searchJudulKegiatan(@Query() query: SearchJudulKegiatansDto) {
    return await this.jkService.searchByParams(query);
  }

  @Transform(JudulKegiatanResponse)
  @Permissions('unit:create-judul-kegiatan')
  @Post()
  async createJudulKegiatan(@Body() body: CreateJudulKegiatanDto) {
    return await this.jkService.create(body);
  }

  @Transform(JudulKegiatanResponse)
  @Permissions('unit:update-judul-kegiatan')
  @Patch('/:id')
  async updateJudulKegiatan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateJudulKegiatanDto,
  ) {
    return await this.jkService.update(id, body);
  }

  @Transform(JudulKegiatanResponse)
  @Permissions('unit:delete-judul-kegiatan')
  @Delete('/:id')
  async deleteJudulKegiatan(@Param('id', ParseIntPipe) id: number) {
    return await this.jkService.delete(id);
  }
}

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
import { UsulanKegiatanService } from './usulan_kegiatan.service';
import { UnitGuard } from '../../common/guard/unit.guard';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { UsulanKegiatanResponse } from './transform/usulan-kegiatan-response.transform';
import { Permissions } from '../../common/decorator/permission.decorator';
import { SearchUsulanKegiatanDto } from './dto/search-usulan-kegiatan.dto';
import { SearchUsulanKegiatanResponse } from './transform/search-usulan-kegiatan-response.transform';
import { CreateUsulanKegiatanDto } from './dto/create-usulan-kegiatan.dto';
import { UpdateUsulanKegiatanDto } from './dto/update-usulan-kegiatan.dto';

@Controller('usulan-kegiatan')
@UseGuards(UnitGuard)
export class UsulanKegiatanController {
  constructor(private readonly ukService: UsulanKegiatanService) {}

  @Transform(UsulanKegiatanResponse)
  @Permissions('unit:read-usulan-kegiatan')
  @Get()
  async findAllUsulanKomponenProgram() {
    return await this.ukService.findAllUsulanKegiatan();
  }

  @Transform(SearchUsulanKegiatanResponse)
  @Permissions('unit:search-usulan-kegiatan')
  @Get('search')
  async searchUsulanKegiatan(@Query() query: SearchUsulanKegiatanDto) {
    return await this.ukService.searchByParams(query);
  }

  @Transform(UsulanKegiatanResponse)
  @Permissions('unit:create-usulan-kegiatan')
  @Post()
  async createUsulanKegiatan(@Body() body: CreateUsulanKegiatanDto) {
    return await this.ukService.create(body);
  }

  @Transform(UsulanKegiatanResponse)
  @Permissions('unit:update-usulan-kegiatan')
  @Patch('/:id')
  async updateUsulanKegiatan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUsulanKegiatanDto,
  ) {
    return await this.ukService.update(id, body);
  }

  @Transform(UsulanKegiatanResponse)
  @Permissions('unit:delete-usulan-kegiatan')
  @Delete('/:id')
  async deleteUsulanKegiatan(@Param('id', ParseIntPipe) id: number) {
    return await this.ukService.delete(id);
  }
}

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
import { KategoriService } from './kategori.service';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { KategoriResponse } from './transform/kategori-response.transform';
import { AdminGuard } from '../../common/guard/admin.guard';
import { Permissions } from '../../common/decorator/permission.decorator';
import { SearchKategoriDto } from './dto/search-kategori.dto';
import { SearchKategoriResponse } from './transform/search-kategori-response.transform';

@Controller('kategori')
@UseGuards(AdminGuard)
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @Transform(KategoriResponse)
  @Permissions('admin:read-kategori')
  @Get()
  async findAll() {
    return await this.kategoriService.findAllKategori();
  }

  @Transform(SearchKategoriResponse)
  @Get('search')
  async searchKategori(@Query() query: SearchKategoriDto) {
    return await this.kategoriService.searchByParams(query);
  }

  @Transform(KategoriResponse)
  @Permissions('admin:create-kategori')
  @Post()
  async createKategori(@Body() data: CreateKategoriDto) {
    return await this.kategoriService.create(data);
  }

  @Transform(KategoriResponse)
  @Permissions('admin:update-kategori')
  @Patch('/:id')
  async updateKategori(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateKategoriDto,
  ) {
    return await this.kategoriService.update(id, data);
  }

  @Transform(KategoriResponse)
  @Permissions('admin:delete-kategori')
  @Delete('/:id')
  async deleteKategori(@Param('id', ParseIntPipe) id: number) {
    return await this.kategoriService.delete(id);
  }
}

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
import { AdminGuard } from '../../common/guard/admin.guard';
import { SatuanService } from './satuan.service';
import { Permissions } from '../../common/decorator/permission.decorator';
import { CreateSatuanDto } from './dto/create-satuan.dto';
import { SearchSatuanDto } from './dto/search-satuan-dto';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { SatuanResponse } from './transform/satuan-response.transform';
import { SearchSatuanResponse } from './transform/search-satuan-response.transformer';
import { UpdateSatuanDto } from './dto/update-satuan.dto';

@Controller('satuan')
@UseGuards(AdminGuard)
export class SatuanController {
  constructor(private readonly satuanService: SatuanService) {}

  @Transform(SatuanResponse)
  @Permissions('admin:read-satuan')
  @Get()
  async findAll() {
    return await this.satuanService.findAllSatuan();
  }

  @Transform(SearchSatuanResponse)
  @Permissions('admin:search-satuan')
  @Get('search')
  async searchSatuan(@Query() query: SearchSatuanDto) {
    return await this.satuanService.searchByParams(query);
  }

  @Transform(SatuanResponse)
  @Permissions('admin:create-satuan')
  @Post()
  async createSatuan(@Body() body: CreateSatuanDto) {
    return await this.satuanService.create(body);
  }

  @Transform(SatuanResponse)
  @Permissions('admin:update-satuan')
  @Patch('/:id')
  async updateSatuan(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSatuanDto,
  ) {
    return await this.satuanService.update(id, body);
  }

  @Transform(SatuanResponse)
  @Permissions('admin:delete-satuan')
  @Delete('/:id')
  async deleteSatuan(@Param('id', ParseIntPipe) id: number) {
    return await this.satuanService.delete(id);
  }
}

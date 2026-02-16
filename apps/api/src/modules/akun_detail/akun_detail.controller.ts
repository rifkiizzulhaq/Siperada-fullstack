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
import { AkunDetailService } from './akun_detail.service';
import { Permissions } from '../../common/decorator/permission.decorator';
import { AdminGuard } from '../../common/guard/admin.guard';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { AkunDetailResponse } from './transform/akun-detail-response.transform';
import { SearchAkunDetailsDto } from './dto/search-akun-detail.dto';
import { SearchAkunDetailResponse } from './transform/search-akun-detail-response.transform';
import { CreateAkunDetailDto } from './dto/create-akun-detail.dto';
import { UpdateAkunDetailDto } from './dto/update-akun-detail.dto';

@Controller('akun-detail')
@UseGuards(AdminGuard)
export class AkunDetailController {
  constructor(private readonly akundetailService: AkunDetailService) {}

  @Transform(AkunDetailResponse)
  @Permissions('admin:read-akun-detail')
  @Get()
  async findAll() {
    return await this.akundetailService.findAllAkunDetail();
  }

  @Transform(SearchAkunDetailResponse)
  @Permissions('admin:search-akun-detail')
  @Get('search')
  async searchAkunDetail(@Query() query: SearchAkunDetailsDto) {
    return await this.akundetailService.searchByParams(query);
  }

  @Transform(AkunDetailResponse)
  @Permissions('admin:create-akun-detail')
  @Post()
  async createAkunDetail(@Body() body: CreateAkunDetailDto) {
    return await this.akundetailService.create(body);
  }

  @Transform(AkunDetailResponse)
  @Permissions('admin:update-akun-detail')
  @Patch('/:id')
  async updateAkunDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAkunDetailDto,
  ) {
    return await this.akundetailService.update(id, body);
  }

  @Transform(AkunDetailResponse)
  @Permissions('admin:delete-akun-detail')
  @Delete('/:id')
  async deleteAkunDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.akundetailService.delete(id);
  }
}

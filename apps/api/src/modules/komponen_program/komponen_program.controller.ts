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
import { KomponenProgramService } from './komponen_program.service';
import { AdminGuard } from '../../common/guard/admin.guard';
import { UnitGuard } from '../../common/guard/unit.guard';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { KomponenProgramResponse } from './transform/komponen-program-response.transform';
import { Permissions } from '../../common/decorator/permission.decorator';
import { SearchKomponenProgramDto } from './dto/search-komponen-program.dto';
import { CreateKomponenProgramDto } from './dto/create-komponen-program.dto';
import { SearchKomponenProgramResponse } from './transform/search-komponen-program-response.transform';
import { UpdateKomponenProgramDto } from './dto/update-komponen-program.dto';

@Controller('komponen-program')
export class KomponenProgramController {
  constructor(private readonly kpService: KomponenProgramService) {}

  @UseGuards(UnitGuard)
  @Get('all')
  async findAllForUnit() {
    return await this.kpService.findAllKomponenProgram();
  }

  @UseGuards(AdminGuard)
  @Transform(KomponenProgramResponse)
  @Permissions('admin:read-komponen-program')
  @Get()
  async findAll() {
    return await this.kpService.findAllKomponenProgram();
  }

  @UseGuards(AdminGuard)
  @Transform(SearchKomponenProgramResponse)
  @Permissions('admin:search-komponen-program')
  @Get('search')
  async searchKomponenProgram(@Query() query: SearchKomponenProgramDto) {
    return await this.kpService.searchByParams(query);
  }

  @UseGuards(AdminGuard)
  @Transform(KomponenProgramResponse)
  @Permissions('admin:create-komponen-program')
  @Post()
  async createKomponenProgram(@Body() body: CreateKomponenProgramDto) {
    return await this.kpService.create(body);
  }

  @UseGuards(AdminGuard)
  @Transform(KomponenProgramResponse)
  @Permissions('admin:update-komponen-program')
  @Patch('/:id')
  async updateKomponenProgram(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateKomponenProgramDto,
  ) {
    return await this.kpService.update(id, body);
  }

  @UseGuards(AdminGuard)
  @Transform(KomponenProgramResponse)
  @Permissions('admin:delete-komponen-program')
  @Delete('/:id')
  async deleteKomponenProgram(@Param('id', ParseIntPipe) id: number) {
    return await this.kpService.delete(id);
  }
}

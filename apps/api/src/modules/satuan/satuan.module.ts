import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Satuan } from './entities/satuan.entities';
import { SatuanController } from './satuan.controller';
import { SatuanService } from './satuan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Satuan])],
  controllers: [SatuanController],
  providers: [SatuanService],
  exports: [SatuanService],
})
export class SatuanModule {}

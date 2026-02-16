import { Module } from '@nestjs/common';
import { AkunDetailService } from './akun_detail.service';
import { AkunDetailController } from './akun_detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AkunDetail } from './entities/akun-detail.entities';

@Module({
  imports: [TypeOrmModule.forFeature([AkunDetail])],
  providers: [AkunDetailService],
  controllers: [AkunDetailController],
  exports: [AkunDetailService],
})
export class AkunDetailModule {}

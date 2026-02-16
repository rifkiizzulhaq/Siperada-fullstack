import { Module } from '@nestjs/common';
import { JudulKegiatanController } from './judul_kegiatan.controller';
import { JudulKegiatanService } from './judul_kegiatan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JudulKegiatan } from './entities/judul-kegiatan.entities';
import { SatuanModule } from '../satuan/satuan.module';
import { AkunDetailModule } from '../akun_detail/akun_detail.module';
import { UsulanKegiatanModule } from '../usulan_kegiatan/usulan_kegiatan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JudulKegiatan]),
    SatuanModule,
    AkunDetailModule,
    UsulanKegiatanModule,
  ],
  controllers: [JudulKegiatanController],
  providers: [JudulKegiatanService],
})
export class JudulKegiatanModule {}

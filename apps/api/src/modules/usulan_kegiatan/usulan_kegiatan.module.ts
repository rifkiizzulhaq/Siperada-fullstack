import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsulanKegiatan } from './entities/usulan-kegiatan.entities';
import { SatuanModule } from '../satuan/satuan.module';
import { UsulanKegiatanController } from './usulan_kegiatan.controller';
import { UsulanKegiatanService } from './usulan_kegiatan.service';
import { KomponenProgramModule } from '../komponen_program/komponen_program.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsulanKegiatan]),
    SatuanModule,
    KomponenProgramModule,
  ],
  controllers: [UsulanKegiatanController],
  providers: [UsulanKegiatanService],
  exports: [UsulanKegiatanService],
})
export class UsulanKegiatanModule {}

import { Module } from '@nestjs/common';
import { KomponenProgramService } from './komponen_program.service';
import { KomponenProgramController } from './komponen_program.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KomponenProgram } from './entities/komponen-program.entities';
import { KategoriModule } from '../kategori/kategori.module';

@Module({
  imports: [TypeOrmModule.forFeature([KomponenProgram]), KategoriModule],
  providers: [KomponenProgramService],
  controllers: [KomponenProgramController],
  exports: [KomponenProgramService],
})
export class KomponenProgramModule {}

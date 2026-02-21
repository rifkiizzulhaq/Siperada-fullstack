import { Module } from '@nestjs/common';
import { sharedDatabase } from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { KategoriModule } from './modules/kategori/kategori.module';
import { KomponenProgramModule } from './modules/komponen_program/komponen_program.module';
import { SatuanModule } from './modules/satuan/satuan.module';
import { AkunDetailModule } from './modules/akun_detail/akun_detail.module';
import { UsulanKegiatanModule } from './modules/usulan_kegiatan/usulan_kegiatan.module';
import { AuthModule } from './modules/auth/auth.module';
import { envSchema } from './config/env.schema';
import { CoreModule } from './core/core.module';
import { RedisModule } from './database/redis/redis.module';
import { JudulKegiatanModule } from './modules/judul_kegiatan/judul_kegiatan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validationSchema: envSchema,
    }),
    TypeOrmModule.forRoot({
      ...sharedDatabase,
    }),
    UserModule,
    KategoriModule,
    KomponenProgramModule,
    SatuanModule,
    AkunDetailModule,
    UsulanKegiatanModule,
    AuthModule,
    CoreModule,
    RedisModule,
    JudulKegiatanModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

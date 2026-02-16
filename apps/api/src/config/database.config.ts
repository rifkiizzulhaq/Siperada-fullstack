import { config } from 'dotenv';
import { User } from '../modules/user/entities/user.entities';
import { Role } from '../modules/user/entities/role.entities';
import { Admin } from '../modules/user/entities/admin.entities';
import { Permission } from '../modules/user/entities/permission.entities';
import { Unit } from '../modules/user/entities/unit.entities';
import { Pemimpin } from '../modules/user/entities/pemimpin.entities';
import { Kategori } from '../modules/kategori/entities/kategori.entities';
import { Satuan } from '../modules/satuan/entities/satuan.entities';
import { AkunDetail } from '../modules/akun_detail/entities/akun-detail.entities';
import { KomponenProgram } from '../modules/komponen_program/entities/komponen-program.entities';
import { UsulanKegiatan } from '../modules/usulan_kegiatan/entities/usulan-kegiatan.entities';
import { JudulKegiatan } from '../modules/judul_kegiatan/entities/judul-kegiatan.entities';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const sharedDatabase = {
  type: 'mysql' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  entities: [
    User,
    Role,
    Admin,
    Unit,
    Pemimpin,
    Permission,
    Kategori,
    Satuan,
    AkunDetail,
    KomponenProgram,
    UsulanKegiatan,
    JudulKegiatan,
  ],
  synchronize: true,
  // dropSchema: true,
};

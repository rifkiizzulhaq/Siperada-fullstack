import { JudulKegiatan } from '../../../modules/judul_kegiatan/entities/judul-kegiatan.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class AkunDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  kode: string;

  @Column()
  name: string;

  @OneToMany(() => JudulKegiatan, (jk) => jk.akun_detail)
  judul_kegiatan: JudulKegiatan[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

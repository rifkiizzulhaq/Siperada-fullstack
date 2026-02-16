import { JudulKegiatan } from '../../../modules/judul_kegiatan/entities/judul-kegiatan.entities';
import { UsulanKegiatan } from '../../../modules/usulan_kegiatan/entities/usulan-kegiatan.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Satuan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => UsulanKegiatan, (usulan_kegiatan) => usulan_kegiatan.satuan)
  usulan_kegiatan: UsulanKegiatan[];

  @OneToMany(() => JudulKegiatan, (jk) => jk.satuan)
  judul_kegiatan: JudulKegiatan[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

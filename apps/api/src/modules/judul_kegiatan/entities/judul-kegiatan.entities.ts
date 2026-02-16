import { AkunDetail } from '../../../modules/akun_detail/entities/akun-detail.entities';
import { Satuan } from '../../../modules/satuan/entities/satuan.entities';
import { UsulanKegiatan } from '../../../modules/usulan_kegiatan/entities/usulan-kegiatan.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class JudulKegiatan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usulan_kegiatanId: number;

  @Column()
  akun_detailId: number;

  @Column()
  satuanId: number;

  @Column()
  judul_kegiatan: string;

  @Column()
  volume: number;

  @Column()
  harga_satuan: number;

  @Column()
  total_biaya: number;

  @ManyToOne(() => UsulanKegiatan, (uk) => uk.judul_kegiatan, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'usulan_kegiatanId' })
  usulan_kegiatan: UsulanKegiatan;

  @ManyToOne(() => AkunDetail, (ad) => ad.judul_kegiatan, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'akun_detailId' })
  akun_detail: AkunDetail;

  @ManyToOne(() => Satuan, (satuan) => satuan.judul_kegiatan, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'satuanId' })
  satuan: Satuan;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

import { JudulKegiatan } from '../../../modules/judul_kegiatan/entities/judul-kegiatan.entities';
import { KomponenProgram } from '../../../modules/komponen_program/entities/komponen-program.entities';
import { Satuan } from '../../../modules/satuan/entities/satuan.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UsulanKegiatan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsulanKegiatan, (uk) => uk.children, {
    nullable: true,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: UsulanKegiatan;

  @OneToMany(() => UsulanKegiatan, (uk) => uk.parent)
  children: UsulanKegiatan[];

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  satuanId: number;

  @Column({ nullable: true })
  komponen_programId: number;

  @Column({ default: 0 })
  volume: number;

  @Column({ default: 0 })
  harga_satuan: number;

  @Column({ type: 'date' })
  tahun_anggaran: string;

  @ManyToOne(() => KomponenProgram, (kp) => kp.uk, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'komponen_programId' })
  komponen_program: KomponenProgram;

  @ManyToOne(() => Satuan, (satuan) => satuan.usulan_kegiatan, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'satuanId' })
  satuan: Satuan;

  @OneToMany(() => JudulKegiatan, (jk) => jk.usulan_kegiatan)
  judul_kegiatan: JudulKegiatan[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

import { UsulanKegiatan } from '../../../modules/usulan_kegiatan/entities/usulan-kegiatan.entities';
import { Kategori } from '../../../modules/kategori/entities/kategori.entities';
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
export class KomponenProgram {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  kategoriId: number;

  @Column({ nullable: true })
  kode_parent: number;

  @Column({ unique: true })
  kode: string;

  @Column()
  name: string;

  @ManyToOne(() => Kategori, (kategori) => kategori.komponen_program, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'kategoriId' })
  kategori: Kategori;

  // Self-referential: parent KP
  @ManyToOne(() => KomponenProgram, (kp) => kp.children, {
    nullable: true,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'kode_parent' })
  parent: KomponenProgram;

  // Self-referential: child KPs yang merujuk ke KP ini
  @OneToMany(() => KomponenProgram, (kp) => kp.parent)
  children: KomponenProgram[];

  @OneToMany(() => UsulanKegiatan, (uk) => uk.komponen_program)
  uk: UsulanKegiatan[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

import { KomponenProgram } from '../../../modules/komponen_program/entities/komponen-program.entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Kategori {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    () => KomponenProgram,
    (komponen_program) => komponen_program.kategori,
  )
  komponen_program: KomponenProgram[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

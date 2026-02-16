import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Admin } from './admin.entities';
import { Role } from './role.entities';
import { Permission } from './permission.entities';
import { Pemimpin } from './pemimpin.entities';
import { Unit } from './unit.entities';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column()
  roleId: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @ManyToOne(() => Role, (role) => role.user, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @OneToOne(() => Admin, (admin) => admin.user, { cascade: true })
  admin: Admin;

  @OneToOne(() => Pemimpin, (pemimpin) => pemimpin.user, { cascade: true })
  pemimpin: Pemimpin;

  @OneToOne(() => Unit, (unit) => unit.user, { cascade: true })
  unit: Unit;

  @ManyToMany(() => Permission, (permission) => permission.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'userId' },
    inverseJoinColumn: { name: 'permissionId' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

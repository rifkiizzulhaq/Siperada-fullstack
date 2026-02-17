import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entities';
import { DeleteResult, In, Like, Not, Repository } from 'typeorm';
import { Role } from './entities/role.entities';
import { Admin } from './entities/admin.entities';
import { Permission } from './entities/permission.entities';
import {
  CreateUser,
  searchUsers,
  searchUsersResponse,
  UpdateUser,
} from '../../common/Interfaces/user.interface';
import * as argon2 from 'argon2';
import { Pemimpin } from './entities/pemimpin.entities';
import { Unit } from './entities/unit.entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Unit) private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Pemimpin)
    private readonly pemimpinRepository: Repository<Pemimpin>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAllUser = async (): Promise<User[]> => {
    return await this.userRepository.find({
      where: { role: { name: Not('superadmin') } },
      relations: ['role', 'permissions', 'admin', 'pemimpin', 'unit'],
    });
  };

  findUserById = async (id: number): Promise<User> => {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'permissions', 'admin', 'pemimpin', 'unit'],
    });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return user;
  };

  findUserByEmail = async (email: string): Promise<User> => {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'permissions'],
    });
    if (!user) throw new NotFoundException('Email tidak ditemukan');
    return user;
  };

  findRoleById = async (id: number): Promise<Role> => {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    return role;
  };

  findRoleByName = async (name: string): Promise<Role> => {
    const names = await this.roleRepository.findOneBy({ name });
    if (!names) {
      throw new NotFoundException('Nama tidak ditemukan');
    }
    return names;
  };

  getAllRoles = async (): Promise<Role[]> => {
    return await this.roleRepository.find({
      where: { name: Not('superadmin') },
    });
  };

  findPermissionById = async (id: number[]): Promise<Permission[]> => {
    const permission = await this.permissionRepository.findBy({ id: In(id) });
    if (!permission) {
      throw new NotFoundException('Permission tidak ditemukan');
    }
    return permission;
  };

  getAllPermission = async (): Promise<Permission[]> => {
    return await this.permissionRepository.find({
      where: { name: Not(Like('%superadmin:%')) },
    });
  };

  create = async (data: CreateUser): Promise<User> => {
    const role = await this.findRoleById(data.roleId);
    const permissions = await this.findPermissionById(data.permissionsId);

    const hashPassword = await argon2.hash(data.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 4,
      parallelism: 1,
      raw: false,
    });

    const createUser: Partial<User> = {
      name: data.name,
      email: data.email,
      password: hashPassword,
      role,
      permissions,
    };

    if (role.name === 'unit') {
      if (!data.bidang || !data.nama_unit || !data.kode_unit) {
        throw new BadRequestException(
          'Bidang, nama_unit, dan kode_unit wajib diisi untuk role unit',
        );
      }
      const unit = this.unitRepository.create({
        nama_unit: data.nama_unit,
        kode_unit: data.kode_unit,
        bidang: data.bidang,
        nip: data.nip,
      });
      createUser.unit = unit;
    }

    if (role.name === 'admin') {
      if (!data.nip || !data.nidn) {
        throw new BadRequestException(
          'NIP dan NIDN wajib diisi untuk role admin',
        );
      }
      const admin = this.adminRepository.create({
        nip: data.nip,
        nidn: data.nidn,
      });
      createUser.admin = admin;
    }

    if (role.name === 'pemimpin') {
      if (!data.bidang || !data.nip || !data.nidn) {
        throw new BadRequestException(
          'Bidang, NIP, dan NIDN wajib diisi untuk role pemimpin',
        );
      }
      const pemimpin = this.pemimpinRepository.create({
        bidang: data.bidang,
        nip: data.nip,
        nidn: data.nidn,
      });
      createUser.pemimpin = pemimpin;
    }

    const user = this.userRepository.create(createUser);
    await this.userRepository.save(user);
    return user;
  };

  update = async (id: number, data: UpdateUser): Promise<User> => {
    const user = await this.findUserById(id);

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.password) {
      user.password = await argon2.hash(data.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 4,
        parallelism: 1,
        raw: false,
      });
    }

    if (data.roleId) {
      const role = await this.findRoleById(data.roleId);

      const oldRole = user.role?.name;
      user.role = role;

      if (oldRole !== 'unit' && role.name === 'unit') {
        if (!data.bidang || !data.nama_unit || !data.kode_unit) {
          throw new BadRequestException(
            'Bidang, nama_unit, dan kode_unit wajib diisi untuk role unit',
          );
        }
        user.unit = {
          nama_unit: data.nama_unit,
          kode_unit: data.kode_unit,
          bidang: data.bidang,
          nip: data.nip,
        } as Unit;
      }

      if (oldRole === 'unit' && role.name !== 'unit') {
        await this.unitRepository.delete({ userId: id });
        user.unit = null as unknown as Unit;
      }

      if (oldRole !== 'admin' && role.name === 'admin') {
        if (!data.nip || !data.nidn) {
          throw new BadRequestException(
            'NIP dan NIDN wajib diisi untuk role admin',
          );
        }
        user.admin = { nip: data.nip, nidn: data.nidn } as Admin;
      }

      if (oldRole === 'admin' && role.name !== 'admin') {
        await this.adminRepository.delete({ userId: id });
        user.admin = null as unknown as Admin;
      }

      if (oldRole !== 'pemimpin' && role.name === 'pemimpin') {
        if (!data.bidang || !data.nip || !data.nidn) {
          throw new BadRequestException(
            'Bidang, NIP, dan NIDN wajib diisi untuk role pemimpin',
          );
        }
        user.pemimpin = {
          bidang: data.bidang,
          nidn: data.nidn,
          nip: data.nip,
        } as Pemimpin;
      }

      if (oldRole === 'pemimpin' && role.name !== 'pemimpin') {
        await this.pemimpinRepository.delete({ userId: id });
        user.pemimpin = null as unknown as Pemimpin;
      }
    }

    if (data.permissionsId) {
      const permission = await this.findPermissionById(data.permissionsId);

      if (permission.length !== data.permissionsId.length) {
        throw new NotFoundException('Permission not found');
      }
      if (!data.permissionsId || data.permissionsId.length === 0) {
        throw new BadRequestException('Minimal ada 1 permission');
      }
      user.permissions = permission;
    }

    await this.userRepository.save(user);
    return user;
  };

  delete = async (id: number): Promise<DeleteResult> => {
    const user = await this.findUserById(id);

    if (user.role.name === 'unit') {
      await this.unitRepository.delete({ userId: id });
    }
    if (user.role.name === 'admin') {
      await this.adminRepository.delete({ userId: id });
    }
    if (user.role.name === 'pemimpin') {
      await this.pemimpinRepository.delete({ userId: id });
    }

    return await this.userRepository.delete(id);
  };

  searchByParams = async (
    query: searchUsers,
  ): Promise<searchUsersResponse<User>> => {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.permissions', 'permission')
      .leftJoinAndSelect('user.admin', 'admin')
      .leftJoinAndSelect('user.unit', 'unit');
    // .leftJoinAndSelect('user.pemimpin', 'pemimpin');

    qb.where('role.name != :superadmin', { superadmin: 'superadmin' });

    if (query.search) {
      qb.andWhere('(user.name LIKE :search OR user.email LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    // filter
    if (query.role) {
      qb.andWhere('role.name = :role', { role: query.role });
    }

    if (query.permission) {
      const permissions = Array.isArray(query.permission)
        ? query.permission
        : [query.permission];
      qb.andWhere('permission.name IN (:...permissions)', {
        permissions,
      });
    }

    // sort
    const sortBy = query.sortBy || 'id';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`user.${sortBy}`, sortOrder);

    // pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  };
}

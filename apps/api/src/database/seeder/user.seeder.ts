import { DataSource, Like } from 'typeorm';
import { User } from '../../modules/user/entities/user.entities';
import { Role } from '../../modules/user/entities/role.entities';
import { Permission } from '../../modules/user/entities/permission.entities';
import { Admin } from '../../modules/user/entities/admin.entities';
import * as argon2 from 'argon2';
import { Unit } from '../../modules/user/entities/unit.entities';

export const seedPermissions = async (dataSource: DataSource) => {
  const permissionRepository = dataSource.getRepository(Permission);

  const superadminPermissions = [
    {
      name: 'superadmin:create-user',
      description: 'Super Admin Dapat membuat user',
    },
    {
      name: 'superadmin:read-user',
      description: 'Super Admin Dapat melihat user',
    },
    {
      name: 'superadmin:update-user',
      description: 'Super Admin Dapat update user',
    },
    {
      name: 'superadmin:delete-user',
      description: 'Super Admin Dapat delete user',
    },
    {
      name: 'superadmin:search-user',
      description: 'Super Admin Dapat mencari user',
    },
  ];

  const unitPermissions = [
    {
      name: 'unit:create-usulan-kegiatan',
      description: 'Unit Dapat membuat usulan-kegiatan',
    },
    {
      name: 'unit:read-usulan-kegiatan',
      description: 'Unit Dapat melihat usulan-kegiatan',
    },
    {
      name: 'unit:update-usulan-kegiatan',
      description: 'Unit Dapat update usulan-kegiatan',
    },
    {
      name: 'unit:delete-usulan-kegiatan',
      description: 'Unit Dapat delete usulan-kegiatan',
    },
    {
      name: 'unit:search-usulan-kegiatan',
      description: 'Unit Dapat mencari usulan-kegiatan',
    },
    {
      name: 'unit:create-judul-kegiatan',
      description: 'Unit Dapat membuat judul-kegiatan',
    },
    {
      name: 'unit:read-judul-kegiatan',
      description: 'Unit Dapat melihat judul-kegiatan',
    },
    {
      name: 'unit:update-judul-kegiatan',
      description: 'Unit Dapat update judul-kegiatan',
    },
    {
      name: 'unit:delete-judul-kegiatan',
      description: 'Unit Dapat hapus judul-kegiatan',
    },
    {
      name: 'unit:search-judul-kegiatan',
      description: 'Unit Dapat mencari judul-kegiatan',
    },
    { name: 'unit:read-history', description: 'Unit Dapat melihat history' },
    {
      name: 'unit:read-monitoring',
      description: 'Unit Dapat melihat monitoring',
    },
  ];

  const adminPermissions = [
    {
      name: 'admin:create-kategori',
      description: 'Admin Dapat membuat kategori',
    },
    {
      name: 'admin:read-kategori',
      description: 'Admin Dapat melihat kategori',
    },
    {
      name: 'admin:update-kategori',
      description: 'Admin Dapat mengubah kategori',
    },
    {
      name: 'admin:delete-kategori',
      description: 'Admin Dapat menghapus kategori',
    },
    {
      name: 'admin:search-kategori',
      description: 'Admin Dapat mencari kategori',
    },
    {
      name: 'admin:create-komponen-program',
      description: 'Admin Dapat membuat komponen program',
    },
    {
      name: 'admin:read-komponen-program',
      description: 'Admin Dapat melihat komponen program',
    },
    {
      name: 'admin:update-komponen-program',
      description: 'Admin Dapat mengubah komponen program',
    },
    {
      name: 'admin:delete-komponen-program',
      description: 'Admin Dapat menghapus komponen program',
    },
    {
      name: 'admin:search-komponen-program',
      description: 'Admin Dapat mencari komponen program',
    },
    { name: 'admin:create-satuan', description: 'Admin Dapat membuat satuan' },
    { name: 'admin:read-satuan', description: 'Admin Dapat melihat satuan' },
    { name: 'admin:update-satuan', description: 'Admin Dapat update satuan' },
    { name: 'admin:delete-satuan', description: 'Admin Dapat hapus satuan' },
    { name: 'admin:search-satuan', description: 'Admin Dapat mencari satuan' },
    {
      name: 'admin:create-akun-detail',
      description: 'Admin Dapat membuat akun detail',
    },
    {
      name: 'admin:read-akun-detail',
      description: 'Admin Dapat melihat akun detail',
    },
    {
      name: 'admin:update-akun-detail',
      description: 'Admin Dapat update akun detail',
    },
    {
      name: 'admin:delete-akun-detail',
      description: 'Admin Dapat menghapus akun detail',
    },
    {
      name: 'admin:search-akun-detail',
      description: 'Admin Dapat mencari akun detail',
    },
    {
      name: 'admin:usulan-unit',
      description: 'Admin Dapat melihat usulan unit',
    },
    { name: 'admin:realisasi', description: 'Admin Dapat realisasi' },
  ];

  const allPermissions = [
    ...superadminPermissions,
    ...unitPermissions,
    ...adminPermissions,
  ];

  for (const permData of allPermissions) {
    const existing = await permissionRepository.findOneBy({
      name: permData.name,
    });
    if (!existing) {
      const permission = permissionRepository.create(permData);
      await permissionRepository.save(permission);
      console.log(`Permission '${permData.name}' seeded!`);
    }
  }
};

export const seedRoles = async (dataSource: DataSource) => {
  const roleRepository = dataSource.getRepository(Role);

  const roles = [
    { id: 1, name: 'superadmin' },
    { id: 2, name: 'admin' },
    { id: 3, name: 'unit' },
    { id: 4, name: 'pemimpin' },
  ];

  for (const roleData of roles) {
    const existing = await roleRepository.findOneBy({ id: roleData.id });
    if (!existing) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`Role '${roleData.name}' seeded!`);
    }
  }
};

export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const adminRepository = dataSource.getRepository(Admin);
  const permissionRepository = dataSource.getRepository(Permission);
  const unitRepository = dataSource.getRepository(Unit);

  const superadminRole = await roleRepository.findOneBy({ id: 1 });
  const adminRole = await roleRepository.findOneBy({ id: 2 });
  const unitRole = await roleRepository.findOneBy({ id: 3 });
  const pemimpinRole = await roleRepository.findOneBy({ id: 4 });

  if (!superadminRole || !adminRole || !unitRole || !pemimpinRole) {
    console.log('Roles not found, run seedRoles first!');
    return;
  }

  const superadminPermissions = await permissionRepository.find({
    where: {
      name: Like('superadmin:%'),
    },
  });
  const adminPermissions = await permissionRepository.find({
    where: {
      name: Like('admin:%'),
    },
  });
  const adminPermissions1 = await permissionRepository.find({
    where: {
      name: Like('admin:read-kategori'),
    },
  });
  const unitPermissions = await permissionRepository.find({
    where: {
      name: Like('unit:%'),
    },
  });
  const unitPermissions1 = await permissionRepository.find({
    where: {
      name: Like('unit:read-usulan-kegiatan'),
    },
  });

  const hashPassword = async (password: string) =>
    argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

  const existingSuperadmin = await userRepository.findOneBy({
    email: 'superadmin@polindra.id',
  });
  if (!existingSuperadmin) {
    const superadminUser = userRepository.create({
      name: 'Super Admin',
      email: 'superadmin@polindra.id',
      password: await hashPassword('superadmin123'),
      role: superadminRole,
      permissions: superadminPermissions,
    });
    await userRepository.save(superadminUser);
  }

  const existingAdmin = await userRepository.findOneBy({
    email: 'admin@polindra.id',
  });
  if (!existingAdmin) {
    const adminUser = userRepository.create({
      name: 'Admin',
      email: 'admin@polindra.id',
      password: await hashPassword('admin123'),
      role: adminRole,
      permissions: adminPermissions,
    });
    await userRepository.save(adminUser);

    const adminProfile = adminRepository.create({
      userId: adminUser.id,
      nip: '199005102023031002',
      nidn: '0015088503',
    });
    await adminRepository.save(adminProfile);
  }

  const adminUser1 = userRepository.create({
      name: 'Admin 1',
      email: 'admin1@polindra.id',
      password: await hashPassword('admin123'),
      role: adminRole,
      permissions: adminPermissions1,
    });
    await userRepository.save(adminUser1);

    const adminProfile1 = adminRepository.create({
      userId: adminUser1.id,
      nip: '199005102023031003',
      nidn: '0015088504',
    });
    await adminRepository.save(adminProfile1);

  const existingUnit = await userRepository.findOneBy({
    email: 'unit@polindra.id',
  });
  if (!existingUnit) {
    const unitUser = userRepository.create({
      name: 'Unit',
      email: 'unit@polindra.id',
      password: await hashPassword('unit123'),
      role: unitRole,
      permissions: unitPermissions,
    });
    await userRepository.save(unitUser);

    const unitProfile = unitRepository.create({
      userId: unitUser.id,
      bidang: 'Teknik Informatika',
      kode_unit: '001',
      nama_unit: 'Unit Teknik Informatika',
      nip: '199005102023031003',
    });
    await unitRepository.save(unitProfile);
  }

  const unitUser1 = userRepository.create({
      name: 'Unit 1',
      email: 'unit1@polindra.id',
      password: await hashPassword('unit123'),
      role: unitRole,
      permissions: unitPermissions1,
    });
    await userRepository.save(unitUser1);

    const unitProfile1 = unitRepository.create({
      userId: unitUser1.id,
      bidang: 'Teknik Elektro',
      kode_unit: '002',
      nama_unit: 'Unit Teknik Elektro',
      nip: '199005102023031004',
    });
    await unitRepository.save(unitProfile1);
};

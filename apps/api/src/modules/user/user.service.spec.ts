import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entities';
import { Role } from './entities/role.entities';
import { Admin } from './entities/admin.entities';
import { Unit } from './entities/unit.entities';
import { Pemimpin } from './entities/pemimpin.entities';
import { Permission } from './entities/permission.entities';
import { NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Not } from 'typeorm';

jest.mock('argon2');

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockRoleRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockAdminRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUnitRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPemimpinRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPermissionRepository = {
    find: jest.fn(),
    findBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
        { provide: getRepositoryToken(Admin), useValue: mockAdminRepository },
        { provide: getRepositoryToken(Unit), useValue: mockUnitRepository },
        {
          provide: getRepositoryToken(Pemimpin),
          useValue: mockPemimpinRepository,
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllUser', () => {
    it('should return all users with relations', async () => {
      const mockUsers = [
        { id: 1, name: 'Admin', email: 'admin@test.com' },
        { id: 2, name: 'User', email: 'user@test.com' },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers as User[]);

      const result = await service.findAllUser();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ['role', 'permissions', 'admin', 'pemimpin', 'unit'],
      });
    });
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@test.com' };
      mockUserRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['role', 'permissions', 'admin', 'pemimpin', 'unit'],
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles except superadmin', async () => {
      const mockRoles = [
        { id: 2, name: 'admin' },
        { id: 3, name: 'unit' },
      ];

      mockRoleRepository.find.mockResolvedValue(mockRoles as Role[]);

      const result = await service.getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.find).toHaveBeenCalledWith({
        where: { name: Not('superadmin') },
      });
    });
  });

  describe('getAllPermission', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { id: 1, name: 'read', description: 'Read permission' },
        { id: 2, name: 'write', description: 'Write permission' },
      ];

      mockPermissionRepository.find.mockResolvedValue(
        mockPermissions as Permission[],
      );

      const result = await service.getAllPermission();

      expect(result).toEqual(mockPermissions);
      expect(mockPermissionRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    beforeEach(() => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
    });

    it('should create user with admin profile', async () => {
      const createUserDto = {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'Password@123',
        roleId: 2,
        permissionsId: [1, 2],
        nip: '199005102023031002',
        nidn: '0015088503',
      };

      const mockRole = { id: 2, name: 'admin' } as Role;
      const mockPermissions = [{ id: 1 }, { id: 2 }] as Permission[];
      const mockAdmin = { nip: '199005102023031002', nidn: '0015088503' };
      const mockUser = { id: 1, ...createUserDto, password: 'hashed_password' };

      mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
      mockPermissionRepository.findBy.mockResolvedValue(mockPermissions);
      mockAdminRepository.create.mockReturnValue(mockAdmin as any);
      mockUserRepository.create.mockReturnValue(mockUser as any);
      mockUserRepository.save.mockResolvedValue(mockUser as any);

      const result = await service.create(createUserDto);

      expect(argon2.hash).toHaveBeenCalledWith(
        'Password@123',
        expect.any(Object),
      );
      expect(mockAdminRepository.create).toHaveBeenCalledWith({
        nip: '199005102023031002',
        nidn: '0015088503',
      });
      expect(result).toEqual(mockUser);
    });

    it('should create user with unit profile', async () => {
      const createUserDto = {
        name: 'Unit User',
        email: 'unit@test.com',
        password: 'Password@123',
        roleId: 3,
        permissionsId: [1],
        nip: '199005102023031003',
        bidang: 'Teknik Informatika',
        kode_unit: '001',
        nama_unit: 'Unit TI',
      };

      const mockRole = { id: 3, name: 'unit' } as Role;
      const mockPermissions = [{ id: 1 }] as Permission[];
      const mockUnit = { nip: '199005102023031003' };
      const mockUser = { id: 1, ...createUserDto };

      mockRoleRepository.findOneBy.mockResolvedValue(mockRole);
      mockPermissionRepository.findBy.mockResolvedValue(mockPermissions);
      mockUnitRepository.create.mockReturnValue(mockUnit as Unit);
      mockUserRepository.create.mockReturnValue(mockUser as any);
      mockUserRepository.save.mockResolvedValue(mockUser as any);

      const result = await service.create(createUserDto);

      expect(mockUnitRepository.create).toHaveBeenCalledWith({
        nama_unit: 'Unit TI',
        kode_unit: '001',
        bidang: 'Teknik Informatika',
        nip: '199005102023031003',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user basic info', async () => {
      const mockUser = {
        id: 1,
        name: 'Old Name',
        email: 'old@test.com',
        role: { name: 'user' },
      } as User;

      const updateData = {
        name: 'New Name',
        email: 'new@test.com',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...updateData,
      } as User);

      const result = await service.update(1, updateData);

      expect(result.name).toBe('New Name');
      expect(result.email).toBe('new@test.com');
    });

    it('should create admin profile when role changes to admin', async () => {
      const mockUser = {
        id: 1,
        name: 'User',
        role: { name: 'user' },
      } as User;

      const mockAdminRole = { id: 2, name: 'admin' } as Role;

      const updateData = {
        roleId: 2,
        nip: '199005102023031002',
        nidn: '0015088503',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoleRepository.findOneBy.mockResolvedValue(mockAdminRole);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.update(1, updateData);

      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should delete admin profile when role changes from admin', async () => {
      const mockUser = {
        id: 1,
        name: 'Admin',
        role: { name: 'admin' },
      } as User;

      const mockUserRole = { id: 3, name: 'user' } as Role;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoleRepository.findOneBy.mockResolvedValue(mockUserRole);
      mockAdminRepository.delete.mockResolvedValue({
        affected: 1,
        raw: {},
      } as any);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.update(1, { roleId: 3 });

      expect(mockAdminRepository.delete).toHaveBeenCalledWith({ userId: 1 });
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const mockUser = { id: 1, name: 'Test' } as User;
      const mockDeleteResult = { affected: 1, raw: {} };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(mockDeleteResult as any);

      const result = await service.delete(1);

      expect(result).toEqual(mockDeleteResult);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('searchByParams', () => {
    it('should search users with pagination', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([[{ id: 1, name: 'User1' }], 1]),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const query = {
        search: 'test',
        page: 1,
        limit: 10,
      };

      const result = await service.searchByParams(query);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
    });
  });
});

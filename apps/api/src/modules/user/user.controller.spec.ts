import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUserService = {
    findAllUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    searchByParams: jest.fn(),
    getAllRoles: jest.fn(),
    getAllPermission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUser', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@test.com' },
        { id: 2, name: 'User 2', email: 'user2@test.com' },
      ];

      mockUserService.findAllUser.mockResolvedValue(mockUsers as any);

      const result = await controller.findUser();

      expect(result).toEqual(mockUsers);
      expect(service.findAllUser).toHaveBeenCalled();
    });
  });

  describe('GetAllRoles', () => {
    it('should return all roles except superadmin', async () => {
      const mockRoles = [
        { id: 2, name: 'admin' },
        { id: 3, name: 'unit' },
      ];

      mockUserService.getAllRoles.mockResolvedValue(mockRoles as any);

      const result = await controller.GetAllRoles();

      expect(result).toEqual(mockRoles);
      expect(service.getAllRoles).toHaveBeenCalled();
    });
  });

  describe('GetAllPermission', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [
        { id: 1, name: 'read', description: 'Read permission' },
        { id: 2, name: 'write', description: 'Write permission' },
      ];

      mockUserService.getAllPermission.mockResolvedValue(
        mockPermissions as any,
      );

      const result = await controller.GetAllPermission();

      expect(result).toEqual(mockPermissions);
      expect(service.getAllPermission).toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    it('should return paginated search results', async () => {
      const query: SearchUsersDto = {
        search: 'test',
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'ASC',
      };

      const mockResult = {
        data: [{ id: 1, name: 'Test User', email: 'test@test.com' }],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockUserService.searchByParams.mockResolvedValue(mockResult as any);

      const result = await controller.searchUsers(query);

      expect(result).toEqual(mockResult);
      expect(service.searchByParams).toHaveBeenCalledWith(query);
    });

    it('should handle search with role filter', async () => {
      const query: SearchUsersDto = {
        role: 'admin',
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [
          {
            id: 1,
            name: 'Admin User',
            email: 'admin@test.com',
            role: { name: 'admin' },
          },
        ],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      mockUserService.searchByParams.mockResolvedValue(mockResult as any);

      const result = await controller.searchUsers(query);

      expect(result.data).toHaveLength(1);
      expect(service.searchByParams).toHaveBeenCalledWith(query);
    });
  });

  describe('CreateUser', () => {
    it('should create a new user', async () => {
      const createDto: CreateUserDto = {
        name: 'New User',
        email: 'new@test.com',
        password: 'Password@123',
        roleId: 3,
        permissionsId: [1, 2],
      };

      const mockCreatedUser = {
        id: 1,
        ...createDto,
        password: 'hashed_password',
      };

      mockUserService.create.mockResolvedValue(mockCreatedUser as any);

      const result = await controller.CreateUser(createDto);

      expect(result).toEqual(mockCreatedUser);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should create admin user with profile', async () => {
      const createDto: CreateUserDto = {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'Password@123',
        roleId: 2,
        permissionsId: [1, 2],
        nip: '199005102023031002',
        nidn: '0015088503',
      };

      const mockCreatedUser = {
        id: 1,
        ...createDto,
        admin: { nip: '199005102023031002', nidn: '0015088503' },
      };

      mockUserService.create.mockResolvedValue(mockCreatedUser as any);

      const result = await controller.CreateUser(createDto);

      expect(result.admin).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('UpdateUser', () => {
    it('should update user', async () => {
      const id = 1;
      const updateDto = {
        name: 'Updated Name',
        email: 'updated@test.com',
      } as UpdateUserDto;

      const mockUpdatedUser = {
        id,
        ...updateDto,
      };

      mockUserService.update.mockResolvedValue(mockUpdatedUser as any);

      const result = await controller.UpdateUser(id, updateDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('should update user password', async () => {
      const id = 1;
      const updateDto = {
        password: 'NewPassword@123',
      } as UpdateUserDto;

      const mockUpdatedUser = {
        id,
        password: 'new_hashed_password',
      };

      mockUserService.update.mockResolvedValue(mockUpdatedUser as any);

      await controller.UpdateUser(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('should update user role', async () => {
      const id = 1;
      const updateDto = {
        roleId: 2,
        nip: '199005102023031002',
        nidn: '0015088503',
      } as UpdateUserDto;

      const mockUpdatedUser = {
        id,
        role: { id: 2, name: 'admin' },
        admin: { nip: '199005102023031002', nidn: '0015088503' },
      };

      mockUserService.update.mockResolvedValue(mockUpdatedUser as any);

      const result = await controller.UpdateUser(id, updateDto);

      expect(result.admin).toBeDefined();
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('DeleteUser', () => {
    it('should delete user successfully', async () => {
      const id = 1;
      const mockDeleteResult = {
        affected: 1,
        raw: {},
      };

      mockUserService.delete.mockResolvedValue(mockDeleteResult as any);

      const result = await controller.DeleteUser(id);

      expect(result).toEqual(mockDeleteResult);
      expect(service.delete).toHaveBeenCalledWith(id);
    });

    it('should handle delete of non-existent user', async () => {
      const id = 999;

      mockUserService.delete.mockRejectedValue(
        new Error('User tidak ditemukan'),
      );

      await expect(controller.DeleteUser(id)).rejects.toThrow(
        'User tidak ditemukan',
      );
      expect(service.delete).toHaveBeenCalledWith(id);
    });
  });
});

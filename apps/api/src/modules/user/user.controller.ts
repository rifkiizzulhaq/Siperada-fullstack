import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Transform } from '../../common/interceptor/transform.interceptor';
import { UserResponse } from './transform/user-response.transform';
import { SearchUsersDto } from './dto/search-user.dto';
import { SearchUserResponse } from './transform/search-user-response.transform';
import { PermissionsGuard } from '../../common/guard/permission.guard';
import { Permissions } from '../../common/decorator/permission.decorator';
import { SuperAdminGuard } from '../../common/guard/superadmin.guard';

@Controller('user')
@UseGuards(SuperAdminGuard)
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Permissions('superadmin:read-user')
  @Transform(UserResponse)
  @Get()
  async findUser() {
    return await this.userService.findAllUser();
  }

  @Permissions('superadmin:read-user')
  @Transform(UserResponse)
  @Get('roles')
  async GetAllRoles() {
    return await this.userService.getAllRoles();
  }

  @Permissions('superadmin:read-user')
  @Transform(UserResponse)
  @Get('permission')
  async GetAllPermission() {
    return await this.userService.getAllPermission();
  }

  @Permissions('superadmin:search-user')
  @Transform(SearchUserResponse)
  @Get('search')
  searchUsers(@Query() query: SearchUsersDto) {
    return this.userService.searchByParams(query);
  }

  @Permissions('superadmin:create-user')
  @Transform(UserResponse)
  @Post()
  async CreateUser(@Body() body: CreateUserDto) {
    return await this.userService.create(body);
  }

  @Permissions('superadmin:update-user')
  @Transform(UserResponse)
  @Patch('/:id')
  async UpdateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.update(id, body);
  }

  @Permissions('superadmin:delete-user')
  @Transform(UserResponse)
  @Delete('/:id')
  async DeleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}

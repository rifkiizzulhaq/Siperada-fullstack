import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entities';
import { Role } from './entities/role.entities';
import { Admin } from './entities/admin.entities';
import { Permission } from './entities/permission.entities';
import { Unit } from './entities/unit.entities';
import { Pemimpin } from './entities/pemimpin.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Admin, Unit, Pemimpin, Permission]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Role } from 'src/entity/role.entity';
import { Permission } from 'src/entity/permission.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Role, Permission])

  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

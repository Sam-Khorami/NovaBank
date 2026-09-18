import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Documents } from 'src/entity/documents.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Documents]),
    AdminModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

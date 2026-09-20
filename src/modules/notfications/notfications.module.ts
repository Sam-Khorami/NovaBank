import { Module } from '@nestjs/common';
import { NotficationsService } from './notfications.service';
import { NotficationsController } from './notfications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Notfications } from 'src/entity/notfication.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Notfications])

  ],
  controllers: [NotficationsController],
  providers: [NotficationsService],
  exports: [NotficationsService]
})
export class NotficationsModule {}

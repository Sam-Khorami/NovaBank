import { Module } from '@nestjs/common';
import { NotficationsService } from './notfications.service';
import { NotficationsController } from './notfications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { Notfications } from 'src/entity/notfication.entity';
import { BullModule } from '@nestjs/bull';
import { MailModule } from '../mail/mail.module';
import { NotficationProcessor } from './notfication.processor';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Notfications]),
    BullModule.registerQueue({ name: "notfications" }),
    MailModule

  ],
  controllers: [NotficationsController],
  providers: [NotficationsService, NotficationProcessor],
  exports: [NotficationsService]
})
export class NotficationsModule {}

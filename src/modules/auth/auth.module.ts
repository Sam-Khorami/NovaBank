import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VitalRecordsModule } from '../vital-records/vital-records.module';
import { Wallet } from 'src/entity/wallet.entity';
import { WalletTransaction } from 'src/entity/walletTransaction.entity';
import { MailModule } from '../mail/mail.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [

    TypeOrmModule.forFeature([User, Wallet, WalletTransaction]),
    JwtModule.registerAsync({

      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({

        secret: configService.get<string>("JWT_SECRET_KEY"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRATION") }

      })

    }),
    VitalRecordsModule,
    MailModule,
    RedisModule

  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

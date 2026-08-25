import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [

    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({

      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({

        secret: configService.get<string>("JWT_SECRET_KEY"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRATION") }

      })

    })

  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

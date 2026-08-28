import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { IpModule } from './modules/ip/ip.module';
import { AuthModule } from './modules/auth/auth.module';
import { IpTrackerMiddleware } from './common/middlewares/ipTracker.middleware';
import { LoggerModule } from './common/logger/logger.module';
import { MailModule } from './modules/mail/mail.module';
import { VitalRecordsModule } from './modules/vital-records/vital-records.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisModule } from './modules/redis/redis.module';
import KeyvRedis from '@keyv/redis';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    CacheModule.registerAsync({

      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({

        stores: [ new KeyvRedis(`redis://${configService.get("REDIS_HOST")}:${configService.get("REDIS_PORT")}`) ]

      })

    }),
    IpModule,
    AuthModule,
    LoggerModule,
    MailModule,
    VitalRecordsModule,
    RedisModule,
    AdminModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {

  configure (consumer: MiddlewareConsumer) {

    consumer.apply(IpTrackerMiddleware).forRoutes("*")

  }

}

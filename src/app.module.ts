import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { IpModule } from './ip/ip.module';
import { IpTrackerMiddleware } from './middlewares/ipTracker.middleware';

@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    IpModule


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {

  configure (consumer: MiddlewareConsumer) {

    consumer.apply(IpTrackerMiddleware).forRoutes("*")

  }

}

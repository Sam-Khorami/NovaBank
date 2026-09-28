import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";


export const databaseConfig: TypeOrmModuleAsyncOptions = {

    inject: [ConfigService],

    useFactory: (config: ConfigService) => {

        return {

            applicationName: "NovaBank",
            type: "postgres",
            database: config.get<string>("DB_NAME"),
            port: Number(config.get<number>("DB_PORT")),
            host: config.get<string>("DB_HOST"),
            password: config.get<string>("DB_PASS"),
            username: config.get<string>("DB_USER"),

            autoLoadEntities: true,
            retryAttempts: 5,
            extra: { max: 10 },

            synchronize: config.get<string>("NODE_ENV") === "development"

        }

    }

}
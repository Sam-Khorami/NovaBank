import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import { tap } from "rxjs";


@Injectable()
export class DbPerformanceInterceptor implements NestInterceptor {

    constructor (
        
        private readonly logger: AppLogger
    
    ) {}

    intercept(context: ExecutionContext, next: CallHandler) {

        const request: Request = context.switchToHttp().getRequest();

        const startTime = Date.now();

        return next.handle().pipe(

            tap(() => {

                const duration = Date.now() - startTime;

                if (duration > 500) this.logger.warn(`Slow: ${request.method} ${request.url} - ${duration}ms`);
                else this.logger.log(`Fast: ${request.method} ${request.url} - ${duration}ms`);

            })

        )

    }

}
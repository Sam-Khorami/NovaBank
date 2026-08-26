import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { tap } from 'rxjs';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {

    constructor (
        
        private readonly logger: AppLogger,
    
    ) {}

    intercept(context: ExecutionContext, next: CallHandler) {

        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const startTime = Date.now();

        return next.handle().pipe(

            tap((responseBody) => {

                const duration = Date.now() - startTime;

                this.logger.log(
                {
                    method: request.method,
                    url: request.originalUrl ?? request.url,
                    statusCode: response.statusCode,
                    duration: `${duration}ms`,
                    ip: request.ip,
                    userAgent: request.headers['user-agent'],
                    response: responseBody,
                },
                'LoggerInterceptor',
                );

            }),

        );

    }

}
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { AppLogger } from "../logger/logger.service";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  
    constructor (
  
        private readonly logger: AppLogger
  
    ) {}

    catch(exception: unknown, host: ArgumentsHost) {

        const context = host.switchToHttp();

        const response = context.getResponse<Response>();
        const request = context.getRequest<Request>();

        let statusCode = 500;
        let message = 'خطای داخلی سرور';

        if (exception instanceof HttpException) {

            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') message = exceptionResponse;
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {

                const body = exceptionResponse as { message?: string };

                message = body.message ?? message;

            }

        }

        if (statusCode >= 500) this.logger.error(message, exception instanceof Error? exception.stack: undefined, 'GlobalExceptionFilter');
        else this.logger.warn(`${request.method} ${request.url} -> ${statusCode}`,'GlobalExceptionFilter');

        response.status(statusCode).json({
            success: false,
            statusCode: statusCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });

    }

}
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {

        const context = host.switchToHttp();

        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'خطای داخلی سرور';
        let error: string | undefined;

        if (exception instanceof HttpException) {

            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') message = exceptionResponse;
        
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {

                const body = exceptionResponse as { message: string; error?: string };

                message = body.message ?? message;
                error = body.error;

            }

        } 
        
        else this.logger.error(exception instanceof Error? exception.stack: String(exception));

        const responseBody = {
            success: false,
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };

        response.status(status).json(responseBody);
    }

}
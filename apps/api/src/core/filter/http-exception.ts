import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponseObject {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status: number = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    let message: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      const responseObj = exceptionResponse as ExceptionResponseObject;
      message = responseObj.message || 'Internal server error';
    }

    this.logger.error(
      `HTTP ${status} Error: ${JSON.stringify(message)} - ${request.method} ${request.url}`,
    );

    const isProduction = process.env.NODE_ENV === 'production';
    let sanitizedMessage = message;

    if (
      isProduction &&
      status === (HttpStatus.INTERNAL_SERVER_ERROR as number)
    ) {
      sanitizedMessage = 'An unexpected error occurred';
    }

    response.status(status).json({
      statusCode: status,
      message: Array.isArray(sanitizedMessage)
        ? sanitizedMessage
        : [sanitizedMessage],
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

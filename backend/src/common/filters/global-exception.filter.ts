import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}

/**
 * Single source of truth for error bodies (rule 20-rest-api): every error is
 * { statusCode, message, error }. Known Prisma errors map to proper HTTP codes
 * centrally so services never pattern-match error strings (rule 30-prisma).
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(
        exception instanceof Error
          ? (exception.stack ?? exception.message)
          : String(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return {
          statusCode: status,
          message: res,
          error: this.reasonPhrase(status),
        };
      }
      const obj = res as Partial<ErrorBody>;
      return {
        statusCode: status,
        message: obj.message ?? exception.message,
        // Never leak exception class names ("UnauthorizedException") —
        // the contract's `error` field is the HTTP reason phrase.
        error: obj.error ?? this.reasonPhrase(status),
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A resource with this unique value already exists',
          error: 'Conflict',
        };
      }
      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'Not Found',
        };
      }
      // FK violation: the referenced parent vanished (e.g. story deleted
      // between an existence check and the dependent insert).
      if (exception.code === 'P2003') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Related resource not found',
          error: 'Not Found',
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  /** 401 → "Unauthorized", 429 → "Too Many Requests", ... */
  private reasonPhrase(status: number): string {
    const key = HttpStatus[status] as string | undefined;
    if (!key) {
      return 'Error';
    }
    return key
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

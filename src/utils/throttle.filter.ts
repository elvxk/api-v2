import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottleExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
      code: HttpStatus.TOO_MANY_REQUESTS,
      status: 'error',
      message: 'Too many requests. Please try again later.',
      error: "Too Many Requests",
    });
  }
}

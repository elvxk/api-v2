import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

export function handleError(error: any, res: Response): Response {
  if (error.code === 'P2025') {
    return res.status(HttpStatus.NOT_FOUND).send({
      code: HttpStatus.NOT_FOUND,
      status: 'error',
      message: 'Data not found',
      error: error.message || 'The requested resource could not be found.',
    });
  }

  if (error instanceof NotFoundException || error instanceof HttpException) {
    return res.status(error.getStatus()).send({
      code: error.getStatus(),
      status: 'error',
      message: error.message,
      error: error.getResponse(),
    });
  }

  // ACME / Let's Encrypt invalid domain
  if (typeof error.message === 'string' && error.message.includes('Invalid identifiers requested')) {
    return res.status(HttpStatus.BAD_REQUEST).send({
      code: HttpStatus.BAD_REQUEST,
      status: 'error',
      message: 'Invalid domain(s) provided. Domain must end with a valid public suffix (TLD).',
      error: `Invalid input query.`,
    });
  }

  if (typeof error.message === 'string' && error.message.includes('DNS TXT not propagated')) {
    return res.status(HttpStatus.CONFLICT).json({
      code: HttpStatus.CONFLICT,
      status: 'error',
      message: error.message,
      error: 'Valid request but conflict',
    });
  }

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    code: HttpStatus.INTERNAL_SERVER_ERROR,
    status: 'error',
    message: 'Internal server error',
    error: error.message || 'Unknown error occurred',
  });
}

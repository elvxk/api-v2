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

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
    code: HttpStatus.INTERNAL_SERVER_ERROR,
    status: 'error',
    message: 'Internal server error',
    error: error.message || 'Unknown error occurred',
  });
}

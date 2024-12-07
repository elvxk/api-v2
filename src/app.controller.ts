import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello(@Res() res: Response) {
    res.status(HttpStatus.OK).send({
      code: HttpStatus.OK,
      status: 'success',
      message: 'Sandri API v2 is ready',
    });
  }
}

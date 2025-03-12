import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { CheckSmtpDto } from './smtp.dto';
import { Response } from 'express';
import { handleError } from 'src/utils/handleError';

@Controller('smtp')
export class SmtpController {
  constructor(private readonly emailService: SmtpService) {}

  @Post()
  async sendEmail(
    @Body() body: CheckSmtpDto,
    @Res() res: Response,
  ): Promise<Response> {
    const { senderEmail, password, targetEmail, hostname, port, encryption } =
      body;

    try {
      const result = await this.emailService.sendTestEmail(
        senderEmail,
        password,
        targetEmail,
        hostname,
        Number(port),
        encryption,
      );

      return res.status(HttpStatus.OK).send({
        code: HttpStatus.OK,
        status: 'success',
        message: result,
      });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

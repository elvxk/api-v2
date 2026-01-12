import { Body, Controller, HttpStatus, Param, Post, Res, UseFilters, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { SslService } from './ssl.service'
import { handleError } from 'src/utils/handleError'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottleExceptionFilter } from 'src/utils/throttle.filter';

@Controller('ssl')
export class SslController {
  constructor(private readonly sslService: SslService) { }

  // =========================
  // 1️⃣ Create challenge
  // =========================
  @Post('challenge')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 1000 * 60, limit: 5 } })
  @UseFilters(ThrottleExceptionFilter)
  async createChallenge(@Body('domains') domains: string[], @Res() res: Response) {
    try {
      if (!domains || !Array.isArray(domains) || domains.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          code: HttpStatus.BAD_REQUEST,
          status: 'error',
          message: 'Domains must be a non-empty array',
          error: 'Invalid input query.',
        })
      }

      const result = await this.sslService.createChallenge(domains)
      return res.status(HttpStatus.OK).send({
        code: HttpStatus.OK,
        status: 'success',
        message: 'Challenge success',
        data: result,
      })
    } catch (error) {
      return handleError(error, res)
    }
  }

  // =========================
  // 2️⃣ Issue certificate
  // =========================
  @Post('issue/:id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 1000 * 60, limit: 5 } })
  @UseFilters(ThrottleExceptionFilter)
  async issueCertificate(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.sslService.issueById(id)
      return res.status(HttpStatus.OK).send({
        code: HttpStatus.OK,
        status: 'success',
        message: 'Certificate issued',
        data: result,
      })

    } catch (error) {
      return handleError(error, res)
    }
  }
}

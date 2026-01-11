import { Body, Controller, Param, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { SslService } from './ssl.service'
import { handleError } from 'src/utils/handleError'

@Controller('ssl')
export class SslController {
  constructor(private readonly sslService: SslService) { }

  // =========================
  // 1️⃣ Create challenge
  // =========================
  @Post('challenge')
  async createChallenge(@Body('domains') domains: string[], @Res() res: Response) {
    try {
      if (!domains || !Array.isArray(domains) || domains.length === 0) {
        return res.status(400).send({
          code: 400,
          status: 'error',
          message: 'Domains must be a non-empty array',
        })
      }

      const result = await this.sslService.createChallenge(domains)
      return res.status(200).send(result)
    } catch (error) {
      return handleError(error, res)
    }
  }

  // =========================
  // 2️⃣ Issue certificate
  // =========================
  @Post('issue/:id')
  async issueCertificate(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.sslService.issueById(id)
      return res.status(200).send(result)
    } catch (error) {
      return handleError(error, res)
    }
  }
}

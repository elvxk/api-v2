import { Injectable, Logger } from '@nestjs/common'
import * as acme from 'acme-client'
import * as dns from 'dns/promises'
import { Prisma, PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

@Injectable()
export class SslService {
  private log = new Logger('SSL')
  private prisma = new PrismaClient()

  private directory() {
    return process.env.SSL_ENV === 'production'
      ? acme.directory.letsencrypt.production
      : acme.directory.letsencrypt.staging
  }

  // =========================
  // STEP 1 — CREATE CHALLENGE
  // =========================
  async createChallenge(domains: string[]) {
    const id = randomUUID()
    this.log.log(`Creating DNS challenge for ${domains.join(', ')}`)

    const accountKey = await acme.crypto.createPrivateKey()
    const client = new acme.Client({
      directoryUrl: this.directory(),
      accountKey,
    })

    await client.createAccount({
      termsOfServiceAgreed: true,
      contact: [`mailto:${process.env.SSL_EMAIL}`],
    })

    const accountUrl = client.getAccountUrl()

    const order = await client.createOrder({
      identifiers: domains.map(d => ({ type: 'dns', value: d })),
    })

    const authzs = await client.getAuthorizations(order)

    const challenges = []

    for (const authz of authzs) {
      const challenge = authz.challenges.find(c => c.type === 'dns-01')
      if (!challenge) throw new Error('dns-01 challenge not found')

      const value = await client.getChallengeKeyAuthorization(challenge)
      const domain = authz.identifier.value
      const record = domain.startsWith('*.')
        ? `_acme-challenge.${domain.slice(2)}`
        : `_acme-challenge.${domain}`

      challenges.push({
        authz,
        challenge,
        record,
        value,
      })
    }

    // simpan ke database
    await this.prisma.sSLRequests.create({
      data: {
        id,
        domains,
        accountKey: accountKey.toString(),
        accountUrl,
        orderJson: JSON.stringify(order),
        challenges,
        status: 'pending',
      },
    })

    this.log.log(`DNS TXT records generated`)

    return {
      id,
      env: process.env.SSL_ENV || 'staging',
      dns: challenges.map(c => ({ type: 'TXT', record: c.record, value: c.value })),
    }
  }

  // =========================
  // WAIT DNS
  // =========================
  private async waitForDns(record: string, expected: string) {
    this.log.log(`Waiting DNS TXT ${record}`)

    const maxAttempts = 6
    const delayMs = 10000

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const records = await dns.resolveTxt(record)
        const flat = records.flat().map(v => v.trim())
        this.log.log(`DNS check #${i + 1}: ${flat.join(', ')}`)
        if (flat.includes(expected)) {
          this.log.log(`DNS propagated`)
          return
        }
      } catch (e) {
        this.log.warn(`DNS lookup failed : ${e.message}`)
      }

      await new Promise(r => setTimeout(r, delayMs))
    }

    throw new Error(`DNS TXT not propagated within ${maxAttempts * delayMs / 1000} seconds`)
  }

  // =========================
  // STEP 2 — ISSUE CERT
  // =========================
  async issueById(id: string) {
    this.log.log(`Issuing certificate for ID=${id}`)

    try {
      const data = await this.prisma.sSLRequests.findUnique({ where: { id } })

      if (!data) {
        throw new Error('Invalid or expired ID')
      }

      // jika sudah issued
      if (data.status === 'issued' && data.certificate && data.privateKey) {
        this.log.log(`Certificate already issued for ${data.domains.join(', ')}`)
        return {
          domains: data.domains,
          certificate: data.certificate,
          privateKey: data.privateKey,
        }
      }

      const client = new acme.Client({
        directoryUrl: this.directory(),
        accountKey: data.accountKey,
        accountUrl: data.accountUrl,
      })

      // tunggu semua DNS
      for (const item of data.challenges as any[]) {
        await this.waitForDns(item.record, item.value)
      }

      // verify semua challenge
      for (const item of data.challenges as any[]) {
        await client.verifyChallenge(item.authz, item.challenge)
        await client.completeChallenge(item.challenge)
        await client.waitForValidStatus(item.authz)
      }

      const [key, csr] = await acme.crypto.createCsr({
        altNames: data.domains,
      })

      const order: acme.Order = JSON.parse(data.orderJson as string)
      await client.finalizeOrder(order, csr)
      const cert = await client.getCertificate(order)

      // update status issued & simpan certificate + private key
      await this.prisma.sSLRequests.update({
        where: { id },
        data: {
          status: 'issued',
          certificate: cert,
          privateKey: key.toString(),
        },
      })

      this.log.log(`Certificate issued for ${data.domains.join(', ')}`)

      return {
        domains: data.domains,
        certificate: cert,
        privateKey: key.toString(),
      }

    } catch (err: any) {
      // === Handle Prisma / database errors ===
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // misal invalid UUID, duplicate key, constraint error, dll
        throw new Error('Invalid or expired ID')
      }

      // Jika UUID invalid (format salah)
      if (err.message.includes('invalid group length')) {
        throw new Error('Invalid ID format')
      }

      // error lainnya diteruskan
      throw err
    }
  }
}

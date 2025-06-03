import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Resolver } from 'dns/promises';

@Injectable()
export class LookupService {
  private resolver = new Resolver();

  cleanDomain(input: string): string {
    try {
      const url = new URL(input.startsWith('http') ? input : `http://${input}`);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return input.replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
    }
  }

  private validateDomain(domain: string) {
    if (!domain || domain.trim() === '') {
      throw new BadRequestException('Domain is required.');
    }

    // Basic domain regex: only letters, numbers, hyphens, dots
    const domainRegex = /^[a-zA-Z0-9.-]+$/;
    if (!domainRegex.test(domain)) {
      throw new BadRequestException('Invalid domain format.');
    }
  }

  async lookup(domain: string) {
    // Bersihkan domain dulu
    const cleanDomain = this.cleanDomain(domain);

    // Validasi domain setelah dibersihkan
    this.validateDomain(cleanDomain);

    const result: Record<string, any> = { domain: cleanDomain };

    const recordChecks = {
      ns: await this.resolver.resolveNs(cleanDomain).catch(() => null),
      a: await this.resolver.resolve4(cleanDomain).catch(() => null),
      cname: await this.resolver.resolveCname(cleanDomain).catch(() => null),
      soa: await this.resolver.resolveSoa(cleanDomain).catch(() => null),
      txt: await this.resolver.resolveTxt(cleanDomain).catch(() => null),
      mx: await this.resolver.resolveMx(cleanDomain).catch(() => null),
    };

    let hasAnyRecord = false;

    if (recordChecks.ns?.length) {
      result.ns = recordChecks.ns;
      hasAnyRecord = true;
    }

    if (recordChecks.a?.length) {
      result.a = recordChecks.a;
      hasAnyRecord = true;
    }

    if (recordChecks.cname?.length) {
      result.cname = recordChecks.cname;
      hasAnyRecord = true;
    }

    if (recordChecks.soa) {
      result.soa = Object.entries(recordChecks.soa).map(
        ([key, value]) => `${key}: ${value}`
      );
      hasAnyRecord = true;
    }

    if (recordChecks.mx?.length) {
      result.mx = recordChecks.mx.map(mx => `${mx.priority} ${mx.exchange}`);
      hasAnyRecord = true;
    }

    if (recordChecks.txt?.length) {
      const flatTxt = recordChecks.txt.map(entry => entry.join(''));
      result.txt = flatTxt;
      hasAnyRecord = true;

      const spfIp = this.extractSpfIp(flatTxt);
      if (spfIp) {
        result.spfIp = spfIp;
        result.ptr = await this.resolvePtr(spfIp);
      }
    }

    if (!hasAnyRecord) {
      throw new NotFoundException('No DNS records found for the given domain.');
    }

    return result;
  }

  extractSpfIp(txtRecords: string[]): string | null {
    for (const txt of txtRecords) {
      if (txt.startsWith('v=spf1')) {
        const match = txt.match(/ip4:([0-9.]+)/);
        if (match) {
          return match[1];
        }
      }
    }
    return null;
  }

  async resolvePtr(ip: string): Promise<string | null> {
    try {
      const ptrs = await this.resolver.reverse(ip);
      return ptrs[0] || null;
    } catch {
      return null;
    }
  }
}

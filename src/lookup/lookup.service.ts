import { Injectable, NotFoundException } from '@nestjs/common';
import { Resolver } from 'dns/promises';

@Injectable()
export class LookupService {
  private resolver = new Resolver();

  cleanDomain(input: string): string {
    try {
      const url = new URL(input.startsWith('http') ? input : `http://${input}`);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return input.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
    }
  }

  async lookup(domain: string) {
    const result: any = { domain };
    const recordChecks = {
      ns: await this.resolver.resolveNs(domain).catch(() => null),
      a: await this.resolver.resolve4(domain).catch(() => null),
      txt: await this.resolver.resolveTxt(domain).catch(() => null),
      mx: await this.resolver.resolveMx(domain).catch(() => null),
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

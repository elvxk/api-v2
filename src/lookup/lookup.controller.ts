import { Controller, Post, Body } from '@nestjs/common';
import { LookupService } from './lookup.service';

@Controller('lookup')
export class LookupController {
  constructor(private readonly lookupService: LookupService) { }

  @Post()
  async dnsLookup(@Body('domain') domain: string) {
    const cleanedDomain = this.lookupService.cleanDomain(domain);
    return this.lookupService.lookup(cleanedDomain);
  }
}

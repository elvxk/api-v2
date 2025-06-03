
import { Module } from '@nestjs/common';
import { LookupService } from './lookup.service';
import { LookupController } from './lookup.controller';

@Module({
  providers: [LookupService],
  controllers: [LookupController]
})
export class LookupModule { }

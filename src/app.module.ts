import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { PrismaModule } from './prisma/prisma.module';
import { SmtpModule } from './smtp/smtp.module';
import { LookupModule } from './lookup/lookup.module';

@Module({
  imports: [PrismaModule, ProjectsModule, SmtpModule, LookupModule],
  controllers: [AppController],
})
export class AppModule { }

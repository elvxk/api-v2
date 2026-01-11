import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { PrismaModule } from './prisma/prisma.module';
import { SmtpModule } from './smtp/smtp.module';
import { LookupModule } from './lookup/lookup.module';
import { SslModule } from './ssl/ssl.module';

@Module({
  imports: [PrismaModule, ProjectsModule, SmtpModule, LookupModule, SslModule],
  controllers: [AppController],
})
export class AppModule { }

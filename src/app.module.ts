import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { PrismaModule } from './prisma/prisma.module';
import { SmtpModule } from './smtp/smtp.module';
import { LookupModule } from './lookup/lookup.module';
import { SslModule } from './ssl/ssl.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 5000,
          limit: 2,
        },
      ],
    }),
    PrismaModule,
    ProjectsModule,
    SmtpModule,
    LookupModule,
    SslModule,
  ],
  controllers: [AppController],
})
export class AppModule { }

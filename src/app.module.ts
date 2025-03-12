import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { SmtpModule } from './smtp/smtp.module';

@Module({
  imports: [PrismaModule, ProjectsModule, UserModule, ProductsModule, SmtpModule],
  controllers: [AppController],
})
export class AppModule {}

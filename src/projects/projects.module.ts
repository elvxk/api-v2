import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [PrismaModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}

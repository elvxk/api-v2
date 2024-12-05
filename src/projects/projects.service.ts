import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(limit: number) {
    return await this.prisma.projects.findMany({
      orderBy: {
        created_at: 'desc',
      },
      take: limit as number,
    });
  }
}

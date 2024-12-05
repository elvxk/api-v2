import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Project } from './interfaces/projects.interface';

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

  async create(data: Prisma.ProjectsCreateInput): Promise<Project> {
    return this.prisma.projects.create({ data });
  }
}

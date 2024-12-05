import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-projects.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Query('limit') limit: number, @Res() res: Response) {
    try {
      const limitNumber = limit ? Number(limit) : undefined;
      if (isNaN(limitNumber) && limitNumber != undefined) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          code: HttpStatus.BAD_REQUEST,
          status: 'error',
          message: 'Invalid input query.',
          error: "The 'limit' must be a number.",
        });
      }

      if (limit < 1) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          code: HttpStatus.BAD_REQUEST,
          status: 'error',
          message: 'Invalid input query.',
          error: "The 'limit' must be above or equal to 1.",
        });
      }

      const projects = await this.projectsService.findAll(limitNumber);

      if (!projects || projects.length === 0) {
        throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
      }

      return res.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        message: limit
          ? `Success get ${projects.length} projects (limited to ${limit})`
          : 'Success get all projects',
        data: projects,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).send(error.getResponse());
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message || 'Unknown error occurred',
      });
    }
  }
  
  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Res() res: Response,
  ) {
    try {
      const newProject = await this.projectsService.create(createProjectDto);

      return res.status(HttpStatus.CREATED).send({
        code: HttpStatus.CREATED,
        status: 'success',
        message: 'Success create new project',
        data: newProject,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).send(error.getResponse());
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message || 'Unknown error occurred',
      });
    }
  }
}

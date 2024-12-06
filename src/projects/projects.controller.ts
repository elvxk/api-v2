import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { DeleteProjectDto } from './dto/delete-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { handleError } from 'src/utils/handleError';

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
        code: HttpStatus.OK,
        status: 'success',
        message: limit
          ? `Success get ${projects.length} projects (limited to ${limit})`
          : 'Success get all projects',
        data: projects,
      });
    } catch (error) {
      return handleError(error, res);
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
      return handleError(error, res);
    }
  }

  @Delete()
  async deleteById(
    @Body() deleteProjectDto: DeleteProjectDto,
    @Res() res: Response,
  ) {
    try {
      const deleteProject = await this.projectsService.deleteById(
        deleteProjectDto.id,
      );
      return res.status(HttpStatus.OK).send({
        code: HttpStatus.OK,
        status: 'success',
        message: `Project with ID ${deleteProjectDto.id} successfully deleted`,
        data: deleteProject,
      });
    } catch (error) {
      return handleError(error, res);
    }
  }

  @Put()
  async updateById(
    @Body() updateProjectDto: UpdateProjectDto,
    @Res() res: Response,
  ) {
    try {
      const { id, ...updateData } = updateProjectDto;

      const updatedProject = await this.projectsService.updateById(
        id,
        updateData,
      );

      return res.status(HttpStatus.OK).send({
        code: HttpStatus.OK,
        status: 'success',
        message: `Project with ID ${id} successfully updated`,
        data: updatedProject,
      });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

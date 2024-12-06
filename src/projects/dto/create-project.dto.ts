import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  desc: string;

  @IsString()
  @IsNotEmpty()
  stack: string;

  @IsNotEmpty()
  @IsUrl()
  demo: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;
}

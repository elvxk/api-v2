import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class UpdateProjectDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  stack?: string;

  @IsOptional()
  @IsUrl()
  demo?: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}

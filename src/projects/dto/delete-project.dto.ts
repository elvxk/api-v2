import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeleteProjectDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

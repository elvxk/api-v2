import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CheckSmtpDto {
  @IsEmail()
  @IsNotEmpty()
  senderEmail: string;

  @IsEmail()
  @IsNotEmpty()
  targetEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  hostname: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsIn(['ssl', 'tls', 'none'])
  encryption: 'ssl' | 'tls' | 'none';
}

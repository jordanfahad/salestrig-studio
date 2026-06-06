import { IsString, MinLength } from 'class-validator';

export class RepurposeDto {
  @IsString()
  @MinLength(20)
  content: string;
}

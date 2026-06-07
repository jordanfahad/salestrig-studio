import { IsOptional, IsString, MinLength } from 'class-validator';

export class ContentScoreDto {
  @IsString()
  @MinLength(5)
  content: string;

  @IsOptional()
  @IsString()
  platform?: string;
}

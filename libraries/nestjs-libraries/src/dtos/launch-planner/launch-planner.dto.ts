import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class LaunchPlanDto {
  @IsString()
  @MinLength(5)
  offer: string;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsInt()
  @IsIn([7, 14, 30])
  durationDays: number;
}

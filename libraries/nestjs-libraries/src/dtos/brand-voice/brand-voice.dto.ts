import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class BrandVoiceDto {
  @IsOptional()
  @IsString()
  tone?: string;

  @IsOptional()
  @IsString()
  audience?: string;

  @IsOptional()
  @IsString()
  offers?: string;

  @IsOptional()
  @IsIn(['none', 'minimal', 'expressive'])
  emojiPolicy?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bannedPhrases?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCtas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pillars?: string[];

  @IsOptional()
  @IsString()
  extraNotes?: string;
}

import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Admin-created team login.
 *
 * Self-hosted instances usually have no email provider, which makes the
 * invite-link flow impractical and self-service password resets impossible.
 * This lets an admin mint the credentials directly and hand them over.
 */
export class CreateTeamMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  // SUPERADMIN is deliberately not accepted - that role belongs to the
  // workspace creator and must not be grantable through this route.
  @IsIn(['USER', 'ADMIN'])
  role: 'USER' | 'ADMIN';

  /** Clients this member may work on. Empty means access to every client. */
  @IsArray()
  @IsOptional()
  customerIds?: string[];
}

export class SetTeamMemberPasswordDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}

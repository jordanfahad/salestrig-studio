import { IsIn, IsString } from 'class-validator';

export class ApprovalDto {
  @IsString()
  @IsIn(['IDEA', 'DRAFT', 'NEEDS_REVIEW', 'APPROVED'])
  approvalStatus: string;
}

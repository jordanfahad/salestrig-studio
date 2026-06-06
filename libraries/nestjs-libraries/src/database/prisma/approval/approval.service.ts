import { Injectable } from '@nestjs/common';
import { ApprovalRepository } from '@gitroom/nestjs-libraries/database/prisma/approval/approval.repository';

@Injectable()
export class ApprovalService {
  constructor(private _approvalRepository: ApprovalRepository) {}

  getReviewQueue(orgId: string) {
    return this._approvalRepository.getReviewQueue(orgId);
  }

  setApprovalStatus(orgId: string, postId: string, approvalStatus: string) {
    return this._approvalRepository.setApprovalStatus(
      orgId,
      postId,
      approvalStatus
    );
  }
}

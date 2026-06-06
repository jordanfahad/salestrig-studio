import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class ApprovalRepository {
  constructor(private _post: PrismaRepository<'post'>) {}

  // The review queue = posts not yet approved (Idea / Draft / Needs Review).
  getReviewQueue(orgId: string) {
    return this._post.model.post.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        parentPostId: null,
        approvalStatus: {
          in: [
            ApprovalStatus.IDEA,
            ApprovalStatus.DRAFT,
            ApprovalStatus.NEEDS_REVIEW,
          ],
        },
      },
      orderBy: { publishDate: 'asc' },
      select: {
        id: true,
        title: true,
        content: true,
        approvalStatus: true,
        publishDate: true,
        state: true,
      },
      take: 100,
    });
  }

  setApprovalStatus(orgId: string, postId: string, approvalStatus: string) {
    // updateMany lets us scope by organizationId (cross-tenant safety).
    return this._post.model.post.updateMany({
      where: { id: postId, organizationId: orgId },
      data: { approvalStatus: approvalStatus as ApprovalStatus },
    });
  }
}

import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ApprovalStatus } from '@prisma/client';

@Injectable()
export class ApprovalRepository {
  constructor(private _post: PrismaRepository<'post'>) {}

  // The review queue = posts not yet approved (Idea / Draft / Needs Review).
  // `scope` is channelScopeWhere(): omitted entirely when the member is
  // unrestricted, so the owner's queue query is unchanged. A delegated member
  // must not see other clients' posts here - the ids resolve through the
  // unauthenticated /public/posts/:id preview, which exposes their creatives.
  getReviewQueue(orgId: string, scope?: any) {
    return this._post.model.post.findMany({
      where: {
        organizationId: orgId,
        ...(scope && Object.keys(scope).length ? { integration: scope } : {}),
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

  setApprovalStatus(
    orgId: string,
    postId: string,
    approvalStatus: string,
    scope?: any
  ) {
    // updateMany lets us scope by organizationId (cross-tenant safety) and,
    // for a delegated member, by the channels they may act on. Unrestricted
    // members pass `{}` and the clause is dropped, so nothing changes for them.
    return this._post.model.post.updateMany({
      where: {
        id: postId,
        organizationId: orgId,
        ...(scope && Object.keys(scope).length ? { integration: scope } : {}),
      },
      data: { approvalStatus: approvalStatus as ApprovalStatus },
    });
  }
}

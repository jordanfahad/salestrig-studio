import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ApprovalService } from '@gitroom/nestjs-libraries/database/prisma/approval/approval.service';
import { ApprovalDto } from '@gitroom/nestjs-libraries/dtos/approval/approval.dto';
import { channelScopeWhere } from '@gitroom/nestjs-libraries/database/prisma/organizations/customer.scope';

@ApiTags('Approvals')
@Controller('/approvals')
export class ApprovalController {
  constructor(private _approvalService: ApprovalService) {}

  @Get('/')
  async queue(@GetOrgFromRequest() org: Organization) {
    return this._approvalService.getReviewQueue(org.id, channelScopeWhere(org));
  }

  @Put('/:postId')
  async setStatus(
    @Param('postId') postId: string,
    @GetOrgFromRequest() org: Organization,
    @Body() body: ApprovalDto
  ) {
    return this._approvalService.setApprovalStatus(
      org.id,
      postId,
      body.approvalStatus,
      channelScopeWhere(org)
    );
  }
}

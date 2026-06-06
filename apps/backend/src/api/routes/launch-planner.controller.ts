import { Body, Controller, Post } from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { BrandVoiceService } from '@gitroom/nestjs-libraries/database/prisma/brand-voice/brand-voice.service';
import { LaunchPlanDto } from '@gitroom/nestjs-libraries/dtos/launch-planner/launch-planner.dto';

@ApiTags('LaunchPlanner')
@Controller('/launch-planner')
export class LaunchPlannerController {
  constructor(
    private _openaiService: OpenaiService,
    private _brandVoiceService: BrandVoiceService
  ) {}

  @Post('/')
  async plan(
    @GetOrgFromRequest() org: Organization,
    @Body() body: LaunchPlanDto
  ) {
    const brandVoice = await this._brandVoiceService.getSystemPrompt(org.id);
    return this._openaiService.planLaunch(
      body.offer,
      body.audience,
      body.durationDays,
      brandVoice
    );
  }
}

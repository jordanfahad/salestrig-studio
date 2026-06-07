import { Body, Controller, Post } from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { BrandVoiceService } from '@gitroom/nestjs-libraries/database/prisma/brand-voice/brand-voice.service';
import { ContentScoreDto } from '@gitroom/nestjs-libraries/dtos/content-score/content-score.dto';

@ApiTags('ContentScore')
@Controller('/content-score')
export class ContentScoreController {
  constructor(
    private _openaiService: OpenaiService,
    private _brandVoiceService: BrandVoiceService
  ) {}

  @Post('/')
  async score(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ContentScoreDto
  ) {
    const brandVoice = await this._brandVoiceService.getSystemPrompt(org.id);
    return this._openaiService.scoreContent(
      body.content,
      body.platform,
      brandVoice
    );
  }
}

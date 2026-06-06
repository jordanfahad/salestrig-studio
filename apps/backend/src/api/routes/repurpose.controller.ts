import { Body, Controller, Post } from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { BrandVoiceService } from '@gitroom/nestjs-libraries/database/prisma/brand-voice/brand-voice.service';
import { RepurposeDto } from '@gitroom/nestjs-libraries/dtos/repurpose/repurpose.dto';

@ApiTags('Repurpose')
@Controller('/repurpose')
export class RepurposeController {
  constructor(
    private _openaiService: OpenaiService,
    private _brandVoiceService: BrandVoiceService
  ) {}

  @Post('/')
  async repurpose(
    @GetOrgFromRequest() org: Organization,
    @Body() body: RepurposeDto
  ) {
    const brandVoice = await this._brandVoiceService.getSystemPrompt(org.id);
    return this._openaiService.repurposeContent(body.content, brandVoice);
  }
}

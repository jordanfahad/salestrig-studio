import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { BrandVoiceService } from '@gitroom/nestjs-libraries/database/prisma/brand-voice/brand-voice.service';
import { BrandVoiceDto } from '@gitroom/nestjs-libraries/dtos/brand-voice/brand-voice.dto';

@ApiTags('BrandVoice')
@Controller('/brand-voice')
export class BrandVoiceController {
  constructor(private _brandVoiceService: BrandVoiceService) {}

  @Get('/')
  async get(@GetOrgFromRequest() org: Organization) {
    return (await this._brandVoiceService.getByOrgId(org.id)) || {};
  }

  @Post('/')
  async save(
    @GetOrgFromRequest() org: Organization,
    @Body() body: BrandVoiceDto
  ) {
    return this._brandVoiceService.upsert(org.id, body);
  }
}

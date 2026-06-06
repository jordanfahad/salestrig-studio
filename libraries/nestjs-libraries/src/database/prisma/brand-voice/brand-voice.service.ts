import { Injectable } from '@nestjs/common';
import { BrandVoiceRepository } from '@gitroom/nestjs-libraries/database/prisma/brand-voice/brand-voice.repository';
import { BrandVoiceDto } from '@gitroom/nestjs-libraries/dtos/brand-voice/brand-voice.dto';
import { brandVoiceSystemPrompt } from '@gitroom/nestjs-libraries/database/prisma/brand-voice/brand-voice.prompt';

@Injectable()
export class BrandVoiceService {
  constructor(private _brandVoiceRepository: BrandVoiceRepository) {}

  getByOrgId(orgId: string) {
    return this._brandVoiceRepository.getByOrgId(orgId);
  }

  upsert(orgId: string, dto: BrandVoiceDto) {
    return this._brandVoiceRepository.upsert(orgId, dto);
  }

  /** The brand-voice system-prompt fragment for an org (empty string if unset). */
  async getSystemPrompt(orgId: string): Promise<string> {
    return brandVoiceSystemPrompt(await this._brandVoiceRepository.getByOrgId(orgId));
  }
}

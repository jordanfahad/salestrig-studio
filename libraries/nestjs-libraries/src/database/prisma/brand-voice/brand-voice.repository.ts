import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BrandVoiceDto } from '@gitroom/nestjs-libraries/dtos/brand-voice/brand-voice.dto';

@Injectable()
export class BrandVoiceRepository {
  constructor(private _brandVoice: PrismaRepository<'brandVoice'>) {}

  getByOrgId(orgId: string) {
    return this._brandVoice.model.brandVoice.findUnique({
      where: { organizationId: orgId },
    });
  }

  upsert(orgId: string, dto: BrandVoiceDto) {
    const values = {
      tone: dto.tone ?? null,
      audience: dto.audience ?? null,
      offers: dto.offers ?? null,
      emojiPolicy: dto.emojiPolicy ?? 'minimal',
      bannedPhrases: dto.bannedPhrases ?? [],
      preferredCtas: dto.preferredCtas ?? [],
      pillars: dto.pillars ?? [],
      extraNotes: dto.extraNotes ?? null,
    };
    return this._brandVoice.model.brandVoice.upsert({
      where: { organizationId: orgId },
      update: values,
      create: { organizationId: orgId, ...values },
    });
  }
}

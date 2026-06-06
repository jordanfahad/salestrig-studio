import { Injectable } from '@nestjs/common';
import { ContentPillarRepository } from '@gitroom/nestjs-libraries/database/prisma/content-pillar/content-pillar.repository';
import { ContentPillarDto } from '@gitroom/nestjs-libraries/dtos/content-pillar/content-pillar.dto';

@Injectable()
export class ContentPillarService {
  constructor(private _contentPillarRepository: ContentPillarRepository) {}

  getByOrgId(orgId: string) {
    return this._contentPillarRepository.getByOrgId(orgId);
  }

  createOrUpdate(orgId: string, dto: ContentPillarDto, id?: string) {
    return this._contentPillarRepository.createOrUpdate(orgId, dto, id);
  }

  delete(orgId: string, id: string) {
    return this._contentPillarRepository.delete(orgId, id);
  }
}

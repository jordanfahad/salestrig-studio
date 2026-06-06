import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ContentPillarDto } from '@gitroom/nestjs-libraries/dtos/content-pillar/content-pillar.dto';

@Injectable()
export class ContentPillarRepository {
  constructor(private _pillar: PrismaRepository<'contentPillar'>) {}

  getByOrgId(orgId: string) {
    return this._pillar.model.contentPillar.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { order: 'asc' },
    });
  }

  createOrUpdate(orgId: string, dto: ContentPillarDto, id?: string) {
    const values = {
      organizationId: orgId,
      name: dto.name,
      color: dto.color ?? '#6E4488',
      description: dto.description ?? null,
      order: dto.order ?? 0,
    };
    return this._pillar.model.contentPillar.upsert({
      where: { id: id || uuidv4(), organizationId: orgId },
      update: values,
      create: values,
    });
  }

  delete(orgId: string, id: string) {
    return this._pillar.model.contentPillar.update({
      where: { id, organizationId: orgId },
      data: { deletedAt: new Date() },
    });
  }
}

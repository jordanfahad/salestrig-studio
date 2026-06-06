import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ContentPillarService } from '@gitroom/nestjs-libraries/database/prisma/content-pillar/content-pillar.service';
import { ContentPillarDto } from '@gitroom/nestjs-libraries/dtos/content-pillar/content-pillar.dto';

@ApiTags('ContentPillars')
@Controller('/content-pillars')
export class ContentPillarController {
  constructor(private _contentPillarService: ContentPillarService) {}

  @Get('/')
  async get(@GetOrgFromRequest() org: Organization) {
    return this._contentPillarService.getByOrgId(org.id);
  }

  @Post('/')
  async create(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ContentPillarDto
  ) {
    return this._contentPillarService.createOrUpdate(org.id, body);
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @GetOrgFromRequest() org: Organization,
    @Body() body: ContentPillarDto
  ) {
    return this._contentPillarService.createOrUpdate(org.id, body, id);
  }

  @Delete('/:id')
  async remove(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._contentPillarService.delete(org.id, id);
  }
}

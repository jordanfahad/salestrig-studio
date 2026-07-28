import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SaveMediaInformationDto } from '@gitroom/nestjs-libraries/dtos/media/save.media.information.dto';

/**
 * Wraps the visibility fragment so it can be added to a where-UNIQUE clause
 * without widening `id`. Returns nothing at all when the member is
 * unrestricted, so their query is exactly the one that ran before this feature.
 */
const andScope = (scope?: Prisma.MediaWhereInput) =>
  scope && Object.keys(scope).length ? { AND: [scope] } : {};

@Injectable()
export class MediaRepository {
  constructor(private _media: PrismaRepository<'media'>) {}

  saveFile(
    org: string,
    fileName: string,
    filePath: string,
    originalName?: string,
    uploadedById?: string
  ) {
    return this._media.model.media.create({
      data: {
        organization: {
          connect: {
            id: org,
          },
        },
        name: fileName,
        path: filePath,
        originalName: originalName || null,
        // Left unset when there is no user behind the request (org-level API
        // key, MCP token, background job) - never guess an uploader.
        ...(uploadedById
          ? {
              uploadedBy: {
                connect: {
                  id: uploadedById,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        path: true,
        thumbnail: true,
        alt: true,
      },
    });
  }

  // Resolves the images already attached to a post (posts.service.updateMedia).
  // Deliberately NOT filtered by uploader: an existing post must keep opening
  // and publishing for a delegated member even when it uses a creative that is
  // no longer in their library. `orgId` is optional so the orchestrator's
  // publish path, which has no member context, stays exactly as it was; the
  // in-app read paths pass it to keep the lookup inside the workspace.
  getMediaById(id: string, orgId?: string) {
    return this._media.model.media.findFirst({
      where: {
        id,
        ...(orgId ? { organizationId: orgId } : {}),
      },
    });
  }

  // `scope` is mediaScopeWhere() - `{}` for an unrestricted member, so the query
  // is byte-for-byte what it is today. For a restricted member it makes the
  // update match nothing (prisma then throws), so they cannot delete a creative
  // they are not allowed to see. It goes in `AND` rather than being spread at
  // the top level: a where-UNIQUE needs `id` to stay a plain string, and
  // spreading a where-INPUT over it widens `id` to a filter.
  deleteMedia(org: string, id: string, scope?: Prisma.MediaWhereInput) {
    return this._media.model.media.update({
      where: {
        id,
        organizationId: org,
        ...andScope(scope),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  saveMediaInformation(
    org: string,
    data: SaveMediaInformationDto,
    scope?: Prisma.MediaWhereInput
  ) {
    return this._media.model.media.update({
      where: {
        id: data.id,
        organizationId: org,
        ...andScope(scope),
      },
      data: {
        alt: data.alt,
        thumbnail: data.thumbnail,
        thumbnailTimestamp: data.thumbnailTimestamp,
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        alt: true,
        thumbnail: true,
        path: true,
        thumbnailTimestamp: true,
      },
    });
  }

  async getMedia(
    org: string,
    page: number,
    search?: string,
    scope?: Prisma.MediaWhereInput
  ) {
    const pageNum = (page || 1) - 1;
    const trimmedSearch = search?.trim();
    const searchFilter = trimmedSearch
      ? {
          originalName: {
            contains: trimmedSearch,
            mode: 'insensitive' as const,
          },
        }
      : {};
    // `scope` is mediaScopeWhere(): `{}` for an unrestricted member (identical
    // query and cost as before), an uploader filter for a delegated one. ONE
    // where object, shared by the count and the rows - when they were written
    // out twice, a filter added to only one of them produced phantom pages.
    const where: Prisma.MediaWhereInput = {
      organizationId: org,
      deletedAt: null,
      ...searchFilter,
      ...(scope || {}),
    };
    const pages = Math.ceil(
      (await this._media.model.media.count({ where })) / 18
    );
    const results = await this._media.model.media.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        path: true,
        thumbnail: true,
        alt: true,
        thumbnailTimestamp: true,
      },
      skip: pageNum * 18,
      take: 18,
    });

    return {
      pages,
      results,
    };
  }
}

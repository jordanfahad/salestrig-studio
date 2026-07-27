import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Role, ShortLinkPreference, SubscriptionTier } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';

@Injectable()
export class OrganizationRepository {
  constructor(
    private _organization: PrismaRepository<'organization'>,
    private _userOrg: PrismaRepository<'userOrganization'>,
    private _user: PrismaRepository<'user'>,
    private _customer: PrismaRepository<'customer'>,
    private _userOrgCustomer: PrismaRepository<'userOrganizationCustomer'>
  ) {}

  createMaxUser(id: string, name: string, saasName: string, email: string) {
    return this._organization.model.organization.create({
      select: {
        id: true,
        apiKey: true,
      },
      data: {
        name: name ? `${name}###${id}` : `Unnamed User###${id}`,
        apiKey: AuthService.fixedEncryption(makeId(20)),
        isTrailing: false,
        subscription: {
          create: {
            totalChannels: 1000000,
            subscriptionTier: 'ULTIMATE',
            isLifetime: true,
            period: 'YEARLY',
          },
        },
        users: {
          create: {
            role: Role.SUPERADMIN,
            user: {
              create: {
                activated: true,
                email: email
                  ? email.split('@').join(`+${saasName}@`)
                  : `${saasName}+` + makeId(10) + '@postiz.com',
                name: name ? `${name}###${id}` : `Unnamed User###${id}`,
                providerName: 'LOCAL',
                password: AuthService.hashPassword(makeId(500)),
                timezone: 0,
              },
            },
          },
        },
      },
    });
  }

  getOrgByApiKey(api: string) {
    return this._organization.model.organization.findFirst({
      where: {
        apiKey: api,
      },
      include: {
        subscription: {
          select: {
            subscriptionTier: true,
            totalChannels: true,
            isLifetime: true,
          },
        },
      },
    });
  }

  getCount() {
    return this._organization.model.organization.count();
  }

  getUserOrg(id: string) {
    return this._userOrg.model.userOrganization.findFirst({
      where: {
        id,
      },
      select: {
        user: true,
        organization: {
          include: {
            users: {
              select: {
                id: true,
                disabled: true,
                role: true,
                userId: true,
              },
            },
            subscription: {
              select: {
                subscriptionTier: true,
                totalChannels: true,
                isLifetime: true,
              },
            },
          },
        },
      },
    });
  }

  getImpersonateUser(name: string) {
    return this._userOrg.model.userOrganization.findMany({
      where: {
        OR: [
          {
            organizationId: {
              contains: name,
            },
          },
          {
            user: {
              OR: [
                {
                  name: {
                    contains: name,
                  },
                },
                {
                  email: {
                    contains: name,
                  },
                },
                {
                  id: {
                    contains: name,
                  },
                },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        organization: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  updateApiKey(orgId: string) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        apiKey: AuthService.fixedEncryption(makeId(20)),
      },
    });
  }

  async getOrgsByUserId(userId: string) {
    return this._organization.model.organization.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          where: {
            userId,
          },
          select: {
            id: true,
            disabled: true,
            role: true,
            // Per-client delegation: empty means unrestricted (see customer.scope.ts)
            customers: {
              select: {
                customerId: true,
              },
            },
          },
        },
        subscription: {
          select: {
            subscriptionTier: true,
            totalChannels: true,
            isLifetime: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getOrgById(id: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id,
      },
    });
  }

  async addUserToOrg(
    userId: string,
    id: string,
    orgId: string,
    role: 'USER' | 'ADMIN'
  ) {
    const checkIfInviteExists = await this._user.model.user.findFirst({
      where: {
        inviteId: id,
      },
    });

    if (checkIfInviteExists) {
      return false;
    }

    const checkForSubscription =
      await this._organization.model.organization.findFirst({
        where: {
          id: orgId,
        },
        select: {
          subscription: true,
        },
      });

    if (
      process.env.STRIPE_PUBLISHABLE_KEY &&
      checkForSubscription?.subscription?.subscriptionTier ===
        SubscriptionTier.STANDARD
    ) {
      return false;
    }

    const create = await this._userOrg.model.userOrganization.create({
      data: {
        role,
        userId,
        organizationId: orgId,
      },
    });

    await this._user.model.user.update({
      where: {
        id: userId,
      },
      data: {
        inviteId: id,
      },
    });

    return create;
  }

  async createOrgAndUser(
    body: Omit<CreateOrgUserDto, 'providerToken'> & { providerId?: string },
    hasEmail: boolean,
    ip: string,
    userAgent: string
  ) {
    return this._organization.model.organization.create({
      data: {
        name: body.company,
        apiKey: AuthService.fixedEncryption(makeId(20)),
        allowTrial: true,
        isTrailing: true,
        users: {
          create: {
            role: Role.SUPERADMIN,
            user: {
              create: {
                activated: body.provider !== 'LOCAL' || !hasEmail,
                email: body.email,
                password: body.password
                  ? AuthService.hashPassword(body.password)
                  : '',
                providerName: body.provider,
                providerId: body.providerId || '',
                timezone: 0,
                ip,
                agent: userAgent,
              },
            },
          },
        },
      },
      select: {
        id: true,
        users: {
          select: {
            user: true,
          },
        },
      },
    });
  }

  getOrgByCustomerId(customerId: string) {
    return this._organization.model.organization.findFirst({
      where: {
        paymentId: customerId,
      },
    });
  }

  async setStreak(organizationId: string, type: 'start' | 'end') {
    try {
      await this._organization.model.organization.update({
        where: {
          id: organizationId,
          ...(type === 'start'
            ? {
                streakSince: null,
              }
            : {}),
        },
        data: {
          ...(type === 'end' ? { streakSince: null } : {}),
          ...(type === 'start' ? { streakSince: new Date() } : {}),
        },
      });
    } catch (err) {}
  }

  async getTeam(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        users: {
          select: {
            // membership id - the handle used to assign clients to this member
            id: true,
            role: true,
            customers: {
              select: {
                customer: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            user: {
              select: {
                email: true,
                id: true,
                sendSuccessEmails: true,
                sendFailureEmails: true,
                sendStreakEmails: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a login directly and place it in this organization.
   *
   * Used instead of the invite-link flow on instances with no email provider.
   * The caller is already gated to ADMIN/SUPERADMIN by the controller policy;
   * SUPERADMIN cannot be granted here (see the DTO).
   */
  async createTeamMemberDirect(
    orgId: string,
    email: string,
    hashedPassword: string,
    role: 'USER' | 'ADMIN',
    customerIds: string[]
  ) {
    const normalizedEmail = email.toLowerCase().trim();

    // Login lookups are provider-scoped and case sensitive, so store lowercase
    // and refuse duplicates rather than silently shadowing an existing login.
    const existing = await this._user.model.user.findFirst({
      where: { email: normalizedEmail, providerName: 'LOCAL' },
    });

    if (existing) {
      throw new Error(
        'A login with this email already exists. Use the invite link to add them instead.'
      );
    }

    const user = await this._user.model.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        providerName: 'LOCAL',
        providerId: '',
        timezone: 0,
        // No email provider means no activation mail could ever arrive.
        activated: true,
      },
    });

    const membership = await this._userOrg.model.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: orgId,
        role,
      },
    });

    if (customerIds?.length) {
      await this.setTeamMemberCustomers(orgId, membership.id, customerIds);
    }

    return { id: membership.id, email: user.email };
  }

  /**
   * Admin-set password for a member of this organization. Scoped by orgId so
   * an admin can never reset a password for someone outside their workspace.
   */
  async setTeamMemberPassword(
    orgId: string,
    userOrganizationId: string,
    hashedPassword: string
  ) {
    const membership = await this._userOrg.model.userOrganization.findFirst({
      where: { id: userOrganizationId, organizationId: orgId },
    });

    if (!membership) {
      throw new Error('Member is not part of this organization');
    }

    await this._user.model.user.update({
      where: { id: membership.userId },
      data: { password: hashedPassword },
    });

    return { ok: true };
  }

  /**
   * Replace a member's client assignments. An empty list restores full access.
   * Both the membership and every client id are re-checked against this
   * organization, so an admin of one workspace can never reference another's.
   */
  async setTeamMemberCustomers(
    orgId: string,
    userOrganizationId: string,
    customerIds: string[]
  ) {
    const membership = await this._userOrg.model.userOrganization.findFirst({
      where: { id: userOrganizationId, organizationId: orgId },
    });

    if (!membership) {
      throw new Error('Member is not part of this organization');
    }

    const validCustomers = customerIds.length
      ? await this._customer.model.customer.findMany({
          where: { id: { in: customerIds }, orgId, deletedAt: null },
          select: { id: true },
        })
      : [];

    await this._userOrgCustomer.model.userOrganizationCustomer.deleteMany({
      where: { userOrganizationId },
    });

    if (validCustomers.length) {
      await this._userOrgCustomer.model.userOrganizationCustomer.createMany({
        data: validCustomers.map((c: { id: string }) => ({
          userOrganizationId,
          customerId: c.id,
        })),
      });
    }

    return { assigned: validCustomers.length };
  }

  getAllUsersOrgs(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        users: {
          select: {
            user: {
              select: {
                email: true,
                id: true,
                sendSuccessEmails: true,
                sendFailureEmails: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteTeamMember(orgId: string, userId: string) {
    return this._userOrg.model.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
  }

  disableOrEnableNonSuperAdminUsers(orgId: string, disable: boolean) {
    return this._userOrg.model.userOrganization.updateMany({
      where: {
        organizationId: orgId,
        role: {
          not: Role.SUPERADMIN,
        },
      },
      data: {
        disabled: disable,
      },
    });
  }

  getShortlinkPreference(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        shortlink: true,
      },
    });
  }

  updateShortlinkPreference(orgId: string, shortlink: ShortLinkPreference) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        shortlink,
      },
    });
  }
}

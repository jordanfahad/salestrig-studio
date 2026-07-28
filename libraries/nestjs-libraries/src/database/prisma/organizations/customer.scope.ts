import { Prisma, Role } from '@prisma/client';

/**
 * Per-client (Customer) delegation for agency workspaces.
 *
 * Postiz isolates data only at the organization level, which forces an agency
 * to create a separate workspace per client and reconnect the same channel in
 * each one. This adds a second, finer boundary INSIDE a workspace: a team
 * member can be assigned to one or more clients and then only ever sees and
 * acts on that client's channels.
 *
 * The rule, deliberately fail-open for the owner and fail-closed for members:
 *   - a member with NO client assignments has full access (owner, admins, and
 *     every pre-existing member stay exactly as they were)
 *   - a member WITH assignments is limited to those clients, and channels that
 *     belong to no client at all are invisible to them
 */

/** Shape of the organization object the auth middleware attaches to requests. */
export interface OrgWithScope {
  id: string;
  users?: Array<{
    id?: string;
    role?: string;
    customers?: Array<{ customerId: string }>;
    channels?: Array<{ integrationId: string }>;
  }>;
}

/**
 * The client ids the current member is limited to, or `null` when the member
 * is unrestricted. `null` (not an empty array) means "no filtering" - callers
 * must treat the two differently, because an empty array would legitimately
 * mean "can see nothing".
 */
/** Channel ids ticked directly for this member, or null when unrestricted. */
export function allowedIntegrationIds(org: OrgWithScope | any): string[] | null {
  const assigned: string[] = (org?.users?.[0]?.channels || [])
    .map((c: any) => c?.integrationId)
    .filter(Boolean);

  return assigned.length ? assigned : null;
}

/**
 * True when the member has ANY assignment (channel or client). Members with
 * none are unrestricted, which keeps the owner and every pre-existing member
 * working exactly as before.
 */
export function hasChannelRestriction(org: OrgWithScope | any): boolean {
  return (
    allowedIntegrationIds(org) !== null || allowedCustomerIds(org) !== null
  );
}

/**
 * Prisma `where` fragment selecting only the channels a member may reach:
 * ticked directly, or belonging to a client assigned to them. Yields `{}` for
 * unrestricted members.
 */
export function channelScopeWhere(org: OrgWithScope | any) {
  const channels = allowedIntegrationIds(org);
  const customers = allowedCustomerIds(org);
  if (!channels && !customers) {
    return {};
  }
  const or: any[] = [];
  if (channels) or.push({ id: { in: channels } });
  if (customers) or.push({ customerId: { in: customers } });
  return { OR: or };
}

/**
 * Same restriction expressed for the `integration` relation inside post
 * queries, combined with the client the caller asked to filter by.
 */
export function postScopeWhere(
  org: OrgWithScope | any,
  requestedCustomer?: string | null
) {
  const scope = channelScopeWhere(org);
  if (!Object.keys(scope).length) {
    return requestedCustomer ? { customerId: requestedCustomer } : {};
  }
  // A scoped member may still narrow by client, but never outside their set.
  return requestedCustomer
    ? { AND: [scope, { customerId: requestedCustomer }] }
    : scope;
}

/**
 * Prisma `where` fragment restricting the media library for a delegated member.
 *
 * Creatives are stored per organization only, so without this a member added to
 * work on one client would browse every other client's assets in the workspace.
 * The rule mirrors the channel rule - fail-open for the owner, fail-closed for
 * members: a restricted member sees a creative only when they uploaded it, or
 * when whoever uploaded it is an ADMIN/SUPERADMIN of THIS organization (shared
 * brand assets, logos, templates).
 *
 * `Media.uploadedById` is nullable, and NULL deliberately reads as "not mine":
 * everything uploaded before this column existed, plus anything created by an
 * org-level API key, stays out of a restricted member's library. That backlog is
 * exactly what an agency does not want a newly added client's staff to browse.
 *
 * The uploader's role is expressed as a relation filter so this stays one query.
 * Yields `{}` for unrestricted members - the owner and admins keep the identical
 * query, and cost, they have today.
 */
export function mediaScopeWhere(
  org: OrgWithScope | any,
  userId?: string
): Prisma.MediaWhereInput {
  if (!hasChannelRestriction(org)) {
    return {};
  }

  return {
    OR: [
      // Own uploads. Skipped rather than matched against `undefined` when the
      // caller has no user context, so we never widen the scope by accident.
      ...(userId ? [{ uploadedById: userId }] : []),
      {
        uploadedBy: {
          organizations: {
            some: {
              organizationId: org?.id,
              role: { in: [Role.ADMIN, Role.SUPERADMIN] },
            },
          },
        },
      },
    ],
  };
}

export function allowedCustomerIds(org: OrgWithScope | any): string[] | null {
  const assigned: string[] = (org?.users?.[0]?.customers || [])
    .map((c: any) => c?.customerId)
    .filter(Boolean);

  return assigned.length ? assigned : null;
}

/** True when the member is limited to a subset of the workspace's clients. */
export function isScopedMember(org: OrgWithScope | any): boolean {
  return allowedCustomerIds(org) !== null;
}

/**
 * Prisma `where` fragment restricting a query on Integration to the member's
 * clients. Spread into an existing where clause; yields `{}` when unrestricted.
 */
export function integrationScopeWhere(org: OrgWithScope | any) {
  const allowed = allowedCustomerIds(org);
  return allowed ? { customerId: { in: allowed } } : {};
}

/**
 * Prisma `where` fragment for the Integration relation inside post queries.
 *
 * Combines the client the CALLER asked to filter by (the calendar's client
 * dropdown) with the clients the member is actually allowed to see. A scoped
 * member may narrow to one of their own clients, but asking for someone
 * else's silently falls back to their permitted set, never leaking.
 */
export function customerScopeWhere(
  requestedCustomer: string | undefined | null,
  allowed: string[] | null | undefined
) {
  if (allowed && allowed.length) {
    return requestedCustomer && allowed.includes(requestedCustomer)
      ? { customerId: requestedCustomer }
      : { customerId: { in: allowed } };
  }
  return requestedCustomer ? { customerId: requestedCustomer } : {};
}

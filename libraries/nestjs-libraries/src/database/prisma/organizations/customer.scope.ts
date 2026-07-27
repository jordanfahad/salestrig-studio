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
  }>;
}

/**
 * The client ids the current member is limited to, or `null` when the member
 * is unrestricted. `null` (not an empty array) means "no filtering" - callers
 * must treat the two differently, because an empty array would legitimately
 * mean "can see nothing".
 */
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

import { mediaScopeWhere } from './customer.scope';

/**
 * The media library must not leak one client's creatives to a member delegated
 * to another client - while the owner and admins keep the exact query they had
 * before the feature existed.
 */
describe('mediaScopeWhere', () => {
  const org = 'org-1';

  const unrestrictedOwner = {
    id: org,
    users: [{ role: 'SUPERADMIN', channels: [], customers: [] }],
  };

  const restrictedByChannel = {
    id: org,
    users: [
      { role: 'USER', channels: [{ integrationId: 'int-1' }], customers: [] },
    ],
  };

  const restrictedByCustomer = {
    id: org,
    users: [
      { role: 'USER', channels: [], customers: [{ customerId: 'cust-1' }] },
    ],
  };

  it('does not filter anything for a member with no assignments', () => {
    expect(mediaScopeWhere(unrestrictedOwner, 'user-1')).toEqual({});
    // No users array at all (impersonation / API-key requests) is unrestricted too.
    expect(mediaScopeWhere({ id: org }, 'user-1')).toEqual({});
  });

  it('limits a channel-delegated member to their own and admin uploads', () => {
    expect(mediaScopeWhere(restrictedByChannel, 'user-1')).toEqual({
      OR: [
        { uploadedById: 'user-1' },
        {
          uploadedBy: {
            organizations: {
              some: {
                organizationId: org,
                role: { in: ['ADMIN', 'SUPERADMIN'] },
              },
            },
          },
        },
      ],
    });
  });

  it('limits a client-delegated member the same way', () => {
    expect(mediaScopeWhere(restrictedByCustomer, 'user-1')).toEqual(
      mediaScopeWhere(restrictedByChannel, 'user-1')
    );
  });

  it('never matches on an undefined uploader when the caller has no user', () => {
    const scope: any = mediaScopeWhere(restrictedByChannel, undefined);
    expect(scope.OR).toHaveLength(1);
    expect(JSON.stringify(scope)).not.toContain('uploadedById');
  });

  it('scopes the admin check to this organization only', () => {
    const scope: any = mediaScopeWhere(restrictedByChannel, 'user-1');
    expect(
      scope.OR[1].uploadedBy.organizations.some.organizationId
    ).toBe(org);
  });
});

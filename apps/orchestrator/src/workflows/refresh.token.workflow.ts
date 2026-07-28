import { continueAsNew, proxyActivities, sleep } from '@temporalio/workflow';
import { IntegrationsActivity } from '@gitroom/orchestrator/activities/integrations.activity';

const { getIntegrationsById, refreshIntegrationToken } =
  proxyActivities<IntegrationsActivity>({
    startToCloseTimeout: '10 minute',
    retry: {
      maximumAttempts: 3,
      backoffCoefficient: 1,
      initialInterval: '2 minutes',
    },
  });

// Wake up this long before the token actually expires. TikTok tokens only live 23
// hours, so refreshing exactly at the expiration leaves no room for a retry or for
// the orchestrator being restarted at the wrong moment.
const REFRESH_BEFORE_EXPIRY = 2 * 60 * 60 * 1000;

// Slowest safe cadence: a provider that returns a token without an expiresIn leaves
// tokenExpiration in the past, and this is what stops that from spinning the loop.
const MIN_TIME_BETWEEN_REFRESHES = 60 * 60 * 1000;

export async function refreshTokenWorkflow({
  organizationId,
  integrationId,
  // Only continueAsNew below sets this: a run that just refreshed must wait, while a
  // freshly started one must not - its token may already have lapsed.
  justRefreshed = false,
}: {
  integrationId: string;
  organizationId: string;
  justRefreshed?: boolean;
}) {
  let integration = await getIntegrationsById(integrationId, organizationId);
  if (
    !integration ||
    integration.deletedAt ||
    integration.inBetweenSteps ||
    integration.refreshNeeded
  ) {
    return false;
  }

  // tokenExpiration is nullable, and Math.max() propagates NaN rather than ignoring
  // it - an unreadable expiration must fall back to "due now", never to NaN, or the
  // floor below would stop applying and the workflow would refresh in a tight loop.
  const endDate = new Date(integration.tokenExpiration).getTime();
  const dueIn = Number.isFinite(endDate)
    ? endDate - Date.now() - REFRESH_BEFORE_EXPIRY
    : 0;

  // An already-expired token still gets an attempt instead of ending the workflow:
  // the refresh grant does not need a live access token, so a channel that lapsed
  // while nothing was watching can heal itself rather than dying silently.
  const waitFor = Math.max(justRefreshed ? MIN_TIME_BETWEEN_REFRESHES : 0, dueIn);

  if (waitFor > 0) {
    await sleep(waitFor);

    // while we were sleeping, the integration might have been deleted
    integration = await getIntegrationsById(integrationId, organizationId);
    if (
      !integration ||
      integration.deletedAt ||
      integration.inBetweenSteps ||
      integration.refreshNeeded
    ) {
      return false;
    }
  }

  // A permanent failure (revoked app, refresh_token past its own lifetime) flags the
  // channel refreshNeeded, which the guards above turn into a clean exit on the next
  // run - the owner is prompted to reconnect instead of the loop retrying forever.
  await refreshIntegrationToken(integration);

  return await continueAsNew<typeof refreshTokenWorkflow>({
    organizationId,
    integrationId,
    justRefreshed: true,
  });
}

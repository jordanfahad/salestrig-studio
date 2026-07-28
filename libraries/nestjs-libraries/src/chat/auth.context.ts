import { getAuth } from '@gitroom/nestjs-libraries/chat/async.storage';

/**
 * The member behind an in-app chat request, when there is one. Set by the
 * copilot controller from the authenticated session; absent for MCP and API-key
 * callers, which authenticate an organization rather than a person - media they
 * create stays unattributed on purpose.
 */
export const getRequestUserId = (context: any): string | undefined =>
  ((context?.requestContext as any)?.get('user') as string) || undefined;

export const checkAuth = (
  inputData: any,
  context: any
) => {
  const auth = getAuth();
  const authInfo = context?.mcp?.extra?.authInfo || auth;
  if (authInfo && context?.requestContext) {
    (context.requestContext as any).set(
      'organization',
      JSON.stringify(authInfo)
    );
    (context.requestContext as any).set('ui', 'false');
  }
};

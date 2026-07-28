import { Global, Injectable, Module, OnModuleInit } from '@nestjs/common';
import { TemporalService } from 'nestjs-temporal-core';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';

@Injectable()
export class InfiniteWorkflowRegister implements OnModuleInit {
  constructor(
    private _temporalService: TemporalService,
    private _integrationService: IntegrationService,
    private _integrationManager: IntegrationManager,
    private _refreshIntegrationService: RefreshIntegrationService
  ) {}

  async onModuleInit(): Promise<void> {
    if (!!process.env.RUN_CRON) {
      try {
        await this._temporalService.client
          ?.getRawClient()
          ?.workflow?.start('missingPostWorkflow', {
            workflowId: 'missing-post-workflow',
            taskQueue: 'main',
          });
      } catch (err) {}

      await this.registerRefreshWorkflows();
    }
  }

  // Refresh workflows are otherwise only started by the OAuth callback, so a channel
  // connected before its provider opted into refreshing - or one whose workflow ended
  // - would never refresh again. Re-arming them on boot is what keeps a short-lived
  // token (TikTok's lasts 23 hours) alive without asking the owner to reconnect.
  private async registerRefreshWorkflows() {
    try {
      const integrations =
        await this._integrationService.getIntegrationsToKeepRefreshed();

      for (const integration of integrations) {
        const provider = this._integrationManager.getSocialIntegration(
          integration.providerIdentifier
        );

        if (!provider?.refreshCron) {
          continue;
        }

        await this._refreshIntegrationService
          .startRefreshWorkflow(
            integration.organizationId,
            integration.id,
            provider
          )
          .catch((err) => {
            console.log(err);
          });
      }
    } catch (err) {
      console.log(err);
    }
  }
}

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [InfiniteWorkflowRegister],
  get exports() {
    return this.providers;
  },
})
export class InfiniteWorkflowRegisterModule {}

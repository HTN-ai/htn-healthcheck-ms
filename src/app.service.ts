import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import got from 'got/dist/source';
import { services } from './services.list';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly discordUrl: string;

  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {
    this.discordUrl = this.configService.get<string>('discord.url');
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  @HealthCheck()
  healthcheck() {
    services.forEach(async (service) => {
      try {
        const healthResult = await this.health.check([
          () => this.http.pingCheck(service.name, service.adress),
        ]);
        this.logger.log(`${service.name} status: ${healthResult.status}`);
      } catch (error) {
        this.logger.error(`${service.name} healthcheck failed.`);
        await got.post(this.discordUrl, {
          json: {
            content: `❌ ${service.name} [${service.adress}] healthcheck failed. ${error}`,
          },
        });
      }
    });
  }
}

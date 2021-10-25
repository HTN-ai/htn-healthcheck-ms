import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import * as Joi from 'joi';
import { AppService } from './app.service';
import mainConfig from './main.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DISCORD_URL: Joi.string().uri().required(),
      }),
      load: [mainConfig],
    }),
    ScheduleModule.forRoot(),
    TerminusModule,
    HttpModule,
  ],
  providers: [AppService],
})
export class AppModule {}

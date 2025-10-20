import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProcessEventUseCase } from '@application/use-cases/process-event.use-case';
import { ThreeUserDeletionsChecker } from '@application/limit-checkers/three-user-deletions.checker';
import { TopSecretReadChecker } from '@application/limit-checkers/top-secret-read.checker';
import { TwoUserUpdatedIn1MinuteChecker } from '@application/limit-checkers/two-user-updated-in-1minute.checker';
import { MongoNotificationRepository } from '@infrastructure/database/repositories/mongo-notification.repository';
import { EventConsumerController } from '@infrastructure/messaging/event-consumer.controller';
import { NotificationSchema } from '@infrastructure/database/schemas/notification.schema';
import { EventCacheService } from '@infrastructure/cache/event-cache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'event-tracker',
              brokers: configService
                .get<string>('KAFKA_BROKERS')
                ?.split(',') || ['localhost:9092'],
            },
            consumer: {
              groupId: 'event-tracker-consumer',
              allowAutoTopicCreation: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EventConsumerController],
  providers: [
    EventCacheService,
    ProcessEventUseCase,
    ThreeUserDeletionsChecker,
    TopSecretReadChecker,
    TwoUserUpdatedIn1MinuteChecker,
    {
      provide: 'NotificationRepository',
      useClass: MongoNotificationRepository,
    },
    {
      provide: 'LimitCheckers',
      useFactory: (
        threeUserDeletions: ThreeUserDeletionsChecker,
        topSecretRead: TopSecretReadChecker,
        twoUserUpdated: TwoUserUpdatedIn1MinuteChecker,
      ) => [threeUserDeletions, topSecretRead, twoUserUpdated],
      inject: [
        ThreeUserDeletionsChecker,
        TopSecretReadChecker,
        TwoUserUpdatedIn1MinuteChecker,
      ],
    },
  ],
})
export class AppModule {}

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Kafka, Producer } from 'kafkajs';
import { NotificationRepository } from '../src/domain/notifications/notification.repository.interface';

describe('Event Tracker E2E Tests', () => {
  let app: INestApplication;
  let kafkaProducer: Producer;
  let notificationRepository: NotificationRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    notificationRepository = app.get<NotificationRepository>(
      'NotificationRepository',
    );

    const kafka = new Kafka({
      clientId: 'e2e-test-producer',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });
    kafkaProducer = kafka.producer();
    await kafkaProducer.connect();
  });

  afterAll(async () => {
    await kafkaProducer.disconnect();
    await app.close();
  });

  describe('TOP_SECRET_READ Limit', () => {
    it('should create notification when user reads top-secret', async () => {
      const userId = Math.floor(Math.random() * 1000000);
      
      await kafkaProducer.send({
        topic: 'test.events.system',
        messages: [
          {
            value: JSON.stringify({
              userId,
              scope: 'top-secret.read',
              date: new Date().toISOString(),
            }),
          },
        ],
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await notificationRepository.findByUserAndType(
        userId,
        'TOP_SECRET_READ',
      );

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].userId).toBe(userId);
      expect(notifications[0].limitType).toBe('TOP_SECRET_READ');
    });
  });

  describe('3_USER_DELETIONS Limit', () => {
    it('should create notification after 3 consecutive user deletions', async () => {
      const userId = Math.floor(Math.random() * 1000000);

      for (let i = 0; i < 3; i++) {
        await kafkaProducer.send({
          topic: 'test.events.system',
          messages: [
            {
              value: JSON.stringify({
                userId,
                scope: 'user.delete',
                date: new Date().toISOString(),
              }),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await notificationRepository.findByUserAndType(
        userId,
        '3_USER_DELETIONS',
      );

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].userId).toBe(userId);
      expect(notifications[0].limitType).toBe('3_USER_DELETIONS');
    });
  });

  describe('2_USER_UPDATED_IN_1MINUTE Limit', () => {
    it('should create notification when user updates 2 users in 1 minute', async () => {
      const userId = Math.floor(Math.random() * 1000000);

      for (let i = 0; i < 2; i++) {
        await kafkaProducer.send({
          topic: 'test.events.system',
          messages: [
            {
              value: JSON.stringify({
                userId,
                scope: 'user.update',
                date: new Date().toISOString(),
              }),
            },
          ],
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const notifications = await notificationRepository.findByUserAndType(
        userId,
        '2_USER_UPDATED_IN_1MINUTE',
      );

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].userId).toBe(userId);
      expect(notifications[0].limitType).toBe('2_USER_UPDATED_IN_1MINUTE');
    });
  });
});

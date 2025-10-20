import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const kafkaBrokers =
    process.env['KAFKA_BROKERS']?.split(',') || ['localhost:9092'];

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'event-tracker',
          brokers: kafkaBrokers,
        },
        consumer: {
          groupId: 'event-tracker-consumer',
          allowAutoTopicCreation: false,
        },
      },
    },
  );

  await app.listen();
  console.log('Event Tracker Microservice is running');
  console.log(`Kafka Brokers: ${kafkaBrokers.join(', ')}`);
  console.log(`MongoDB URI: ${process.env['MONGODB_URI']}`);
}

bootstrap();

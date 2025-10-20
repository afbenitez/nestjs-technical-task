import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProcessEventUseCase } from '@application/use-cases/process-event.use-case';
import { SystemEvent } from '@domain/events/system-event.entity';

interface KafkaMessage {
  userId: number;
  scope: string;
  date: string;
}

@Controller()
export class EventConsumerController {
  constructor(private readonly processEventUseCase: ProcessEventUseCase) {}

  @MessagePattern('test.events.system')
  async handleEvent(@Payload() message: KafkaMessage): Promise<void> {
    try {
      const event = new SystemEvent(
        message.userId,
        message.scope,
        new Date(message.date),
      );

      await this.processEventUseCase.execute(event);
    } catch (error) {
      console.error('Error processing event:', error);
      throw error;
    }
  }
}

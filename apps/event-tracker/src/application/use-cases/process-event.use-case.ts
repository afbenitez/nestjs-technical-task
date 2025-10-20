import { Injectable, Inject } from '@nestjs/common';
import { SystemEvent } from '@domain/events/system-event.entity';
import { NotificationRepository } from '@domain/notifications/notification.repository.interface';
import { LimitChecker } from '@domain/limits/limit-checker.interface';
import { Notification, LimitType } from '@domain/notifications/notification.entity';
import { EventCacheService } from '@infrastructure/cache/event-cache.service';

@Injectable()
export class ProcessEventUseCase {
  constructor(
    private readonly eventCache: EventCacheService,

    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository,

    @Inject('LimitCheckers')
    private readonly limitCheckers: LimitChecker[],
  ) {}

  async execute(event: SystemEvent): Promise<void> {
    this.eventCache.addEvent(event);

    for (const checker of this.limitCheckers) {
      const limitExceeded = await checker.check(event);
      
      if (limitExceeded) {
        const notification = new Notification(
          event.userId,
          checker.getLimitType() as LimitType,
          event.date,
        );
        
        await this.notificationRepository.save(notification);
        console.log(
          `Limit exceeded: ${checker.getLimitType()} for user ${event.userId}`,
        );
      }
    }
  }
}

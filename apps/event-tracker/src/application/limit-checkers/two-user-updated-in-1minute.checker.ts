import { Injectable } from '@nestjs/common';
import { LimitChecker } from '@domain/limits/limit-checker.interface';
import { SystemEvent } from '@domain/events/system-event.entity';
import { LimitType } from '@domain/notifications/notification.entity';
import { EventCacheService } from '@infrastructure/cache/event-cache.service';

@Injectable()
export class TwoUserUpdatedIn1MinuteChecker implements LimitChecker {
  constructor(private readonly eventCache: EventCacheService) {}

  async check(event: SystemEvent): Promise<boolean> {
    if (!event.isUserUpdate()) {
      return false;
    }

    const oneMinuteAgo = new Date(event.date.getTime() - 60 * 1000);
    
    const eventsInLastMinute = this.eventCache.getEventsByUserInTimeRange(
      event.userId,
      oneMinuteAgo,
      event.date,
    );

    const userUpdateEvents = eventsInLastMinute.filter((e) => e.isUserUpdate());

    return userUpdateEvents.length >= 2;
  }

  getLimitType(): string {
    return LimitType.TWO_USER_UPDATED_IN_1MINUTE;
  }
}

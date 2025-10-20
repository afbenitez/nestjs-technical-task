import { Injectable } from '@nestjs/common';
import { LimitChecker } from '@domain/limits/limit-checker.interface';
import { SystemEvent } from '@domain/events/system-event.entity';
import { LimitType } from '@domain/notifications/notification.entity';
import { EventCacheService } from '@infrastructure/cache/event-cache.service';

@Injectable()
export class ThreeUserDeletionsChecker implements LimitChecker {
  constructor(private readonly eventCache: EventCacheService) {}

  async check(event: SystemEvent): Promise<boolean> {
    if (!event.isUserDelete()) {
      return false;
    }

    const recentEvents = this.eventCache.getRecentEventsByUser(event.userId, 3);

    if (recentEvents.length === 3) {
      return recentEvents.every((e) => e.isUserDelete());
    }

    return false;
  }

  getLimitType(): string {
    return LimitType.THREE_USER_DELETIONS;
  }
}

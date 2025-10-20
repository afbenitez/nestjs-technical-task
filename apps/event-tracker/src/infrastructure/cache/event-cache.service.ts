import { Injectable } from '@nestjs/common';
import { SystemEvent } from '@domain/events/system-event.entity';

@Injectable()
export class EventCacheService {
  private events: SystemEvent[] = [];
  private readonly MAX_EVENTS = 1000;

  addEvent(event: SystemEvent): void {
    this.events.push(event);
    
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
  }

  getRecentEventsByUser(userId: number, limit: number): SystemEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .slice(-limit);
  }

  getEventsByUserInTimeRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): SystemEvent[] {
    return this.events.filter(
      e =>
        e.userId === userId &&
        e.date >= startDate &&
        e.date <= endDate,
    );
  }
}

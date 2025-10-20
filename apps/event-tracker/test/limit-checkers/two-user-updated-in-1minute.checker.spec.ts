import { TwoUserUpdatedIn1MinuteChecker } from '../../src/application/limit-checkers/two-user-updated-in-1minute.checker';
import { SystemEvent } from '../../src/domain/events/system-event.entity';
import { EventCacheService } from '../../src/infrastructure/cache/event-cache.service';

describe('TwoUserUpdatedIn1MinuteChecker', () => {
  let checker: TwoUserUpdatedIn1MinuteChecker;
  let eventCache: EventCacheService;

  beforeEach(() => {
    eventCache = new EventCacheService();
    checker = new TwoUserUpdatedIn1MinuteChecker(eventCache);
  });

  it('should return true when user updated 2 users in 1 minute', async () => {
    const userId = 1;
    const now = new Date();
    const event = new SystemEvent(userId, 'user.update', now);

    eventCache.addEvent(new SystemEvent(userId, 'user.update', new Date(now.getTime() - 30000)));
    eventCache.addEvent(new SystemEvent(userId, 'user.update', now));

    const result = await checker.check(event);

    expect(result).toBe(true);
  });

  it('should return false when user has only 1 update in the last minute', async () => {
    const userId = 1;
    const now = new Date();
    const event = new SystemEvent(userId, 'user.update', now);

    eventCache.addEvent(new SystemEvent(userId, 'user.update', now));

    const result = await checker.check(event);

    expect(result).toBe(false);
  });

  it('should return false when event is not a user update', async () => {
    const userId = 1;
    const event = new SystemEvent(userId, 'user.delete', new Date());

    const result = await checker.check(event);

    expect(result).toBe(false);
  });

  it('should not count non-update events', async () => {
    const userId = 1;
    const now = new Date();
    const event = new SystemEvent(userId, 'user.update', now);

    eventCache.addEvent(new SystemEvent(userId, 'user.update', new Date(now.getTime() - 30000)));
    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date(now.getTime() - 20000)));
    eventCache.addEvent(new SystemEvent(userId, 'user.create', now));

    const result = await checker.check(event);

    expect(result).toBe(false);
  });
});

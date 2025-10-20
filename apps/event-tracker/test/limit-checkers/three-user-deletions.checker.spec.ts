import { ThreeUserDeletionsChecker } from '../../src/application/limit-checkers/three-user-deletions.checker';
import { SystemEvent } from '../../src/domain/events/system-event.entity';
import { EventCacheService } from '../../src/infrastructure/cache/event-cache.service';

describe('ThreeUserDeletionsChecker', () => {
  let checker: ThreeUserDeletionsChecker;
  let eventCache: EventCacheService;

  beforeEach(() => {
    eventCache = new EventCacheService();
    checker = new ThreeUserDeletionsChecker(eventCache);
  });

  it('should return true when user has 3 consecutive deletions', async () => {
    const userId = 1;
    const event = new SystemEvent(userId, 'user.delete', new Date());

    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date()));
    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date()));
    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date()));

    const result = await checker.check(event);

    expect(result).toBe(true);
  });

  it('should return false when user has less than 3 deletions', async () => {
    const userId = 1;
    const event = new SystemEvent(userId, 'user.delete', new Date());

    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date()));
    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date()));

    const result = await checker.check(event);

    expect(result).toBe(false);
  });

  it('should return false when event is not a user deletion', async () => {
    const userId = 1;
    const event = new SystemEvent(userId, 'user.create', new Date());

    const result = await checker.check(event);

    expect(result).toBe(false);
  });

  it('should return false when user has 3 events but not all are deletions', async () => {
    const userId = 1;
    const event = new SystemEvent(userId, 'user.delete', new Date());

    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date()));
    eventCache.addEvent(new SystemEvent(userId, 'user.update', new Date()));
    eventCache.addEvent(new SystemEvent(userId, 'user.delete', new Date()));

    const result = await checker.check(event);

    expect(result).toBe(false);
  });
});

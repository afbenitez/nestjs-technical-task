import { TopSecretReadChecker } from '../../src/application/limit-checkers/top-secret-read.checker';
import { SystemEvent } from '../../src/domain/events/system-event.entity';

describe('TopSecretReadChecker', () => {
  let checker: TopSecretReadChecker;

  beforeEach(() => {
    checker = new TopSecretReadChecker();
  });

  it('should return true when event is a top-secret read', async () => {
    const event = new SystemEvent(1, 'top-secret.read', new Date());

    const result = await checker.check(event);

    expect(result).toBe(true);
  });

  it('should return false when event is not a top-secret read', async () => {
    const event = new SystemEvent(1, 'user.read', new Date());

    const result = await checker.check(event);

    expect(result).toBe(false);
  });

  it('should return false for top-secret but different action', async () => {
    const event = new SystemEvent(1, 'top-secret.create', new Date());

    const result = await checker.check(event);

    expect(result).toBe(false);
  });
});

# Testing Guide

## Running Tests

```powershell
cd apps/event-tracker

# Run all tests
npm test

# Watch mode (re-runs when you save)
npm run test:watch

# With coverage report
npm run test:cov
```

## E2E Tests

```powershell
# 1. Start infrastructure
docker-compose up -d kafka mongodb

# 2. Run E2E tests
npm run test:e2e
```

## What Gets Tested?

### Unit Tests

**Limit Checkers** (`test/limit-checkers/*.spec.ts`)
- ✅ Detects 3 consecutive `user.delete` events
- ✅ Detects any `top-secret.read`
- ✅ Detects 2 `user.update` within 1 minute
- ✅ Ignores events that don't match rules

**Use Case** (`src/application/use-cases/*.spec.ts`)
- ✅ Adds events to cache
- ✅ Runs all checkers
- ✅ Saves notifications when limits are exceeded

### E2E Tests

**Full Flow** (`test/*.e2e-spec.ts`)
1. Sends event to Kafka
2. Waits for processing
3. Verifies notification in MongoDB

## Check Coverage

```powershell
npm run test:cov
start coverage/lcov-report/index.html
```

## Test Structure

```typescript
it('should detect limit exceeded', async () => {
  // Arrange: Setup
  const event = new SystemEvent(1, 'user.delete', new Date());
  
  // Act: Execute
  const result = await checker.check(event);
  
  // Assert: Verify
  expect(result).toBe(true);
});
```

## Adding a New Test

1. Create `*.spec.ts` next to your code
2. Use AAA pattern (Arrange, Act, Assert)
3. Run `npm test`

That's it. 🎯

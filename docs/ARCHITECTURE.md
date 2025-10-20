# Event Tracker Architecture

## What Does It Do?

Reads events from Kafka → Checks 3 rules → Saves notifications to MongoDB when a rule is broken.

## DDD Structure (Domain-Driven Design)

The code is split into 3 layers:

### 1. Domain (Business Rules)

**What matters for the business, no technical dependencies.**

```
domain/
├── events/system-event.entity.ts          # What a system event is
├── limits/limit-checker.interface.ts      # What a limit checker looks like
└── notifications/
    ├── notification.entity.ts             # What a notification is
    └── notification.repository.interface.ts  # Contract for saving notifications
```

**Example:**
- `SystemEvent` knows if it's a `user.delete`, `user.update`, or `top-secret.read`
- `Notification` represents an alert when a rule is broken

### 2. Application (Use Cases)

**What the system does with the domain.**

```
application/
├── use-cases/
│   └── process-event.use-case.ts    # Process event and check limits
└── limit-checkers/
    ├── three-user-deletions.checker.ts        # Rule 1
    ├── top-secret-read.checker.ts             # Rule 2
    └── two-user-updated-in-1minute.checker.ts # Rule 3
```

**Flow:**
1. Event arrives
2. Added to cache (memory)
3. Run the 3 checkers
4. If one fails → Save notification

### 3. Infrastructure (Technology)

**How we connect to the outside world.**

```
infrastructure/
├── cache/
│   └── event-cache.service.ts           # Stores events in RAM (last 1000)
├── database/
│   ├── repositories/
│   │   └── mongo-notification.repository.ts  # Saves to MongoDB
│   └── schemas/
│       └── notification.schema.ts            # MongoDB structure
└── messaging/
    └── event-consumer.controller.ts          # Reads from Kafka
```

## Design Patterns

### Strategy Pattern (Limit Checkers)

Each rule is a class that implements `LimitChecker`:

```typescript
interface LimitChecker {
  check(event: SystemEvent): Promise<boolean>;
  getLimitType(): string;                      
}
```

**Advantage:** Adding a new rule means creating a new class, without touching the others.

### Repository Pattern

We separate business logic from how we save:

```typescript
interface NotificationRepository {
  save(notification: Notification): Promise<void>;
}
```

The domain doesn't know we use MongoDB. Could be PostgreSQL, files, whatever.

### Dependency Injection (NestJS)

Services are injected automatically:

```typescript
constructor(
  private readonly eventCache: EventCacheService,
  @Inject('NotificationRepository') 
  private readonly notificationRepo: NotificationRepository,
) {}
```

## Why In-Memory Cache?

The README only asks to save **notifications** to MongoDB.

To check the rules we need past events, but:
- ✅ Checking in RAM is **instant**
- ✅ We don't fill MongoDB with millions of events
- ✅ Good enough for 3 simple rules

**EventCacheService:**
- Stores last 1000 events
- Search by user
- Search by time range

## The 3 Rules

### Rule 1: 3 consecutive user.delete
```
user 83: delete → delete → delete 🚨
```

### Rule 2: Any top-secret.read
```
user 83: top-secret.read 🚨
```

### Rule 3: 2 user.update within 1 minute
```
user 83: update (10:00) → update (10:00:30) 🚨
```

## Full Flow

```
1. Kafka produces event
       ↓
2. EventConsumerController receives it
       ↓
3. ProcessEventUseCase processes it:
   a) Saves to EventCacheService (RAM)
   b) Runs the 3 checkers
   c) If one fails → save(notification)
       ↓
4. MongoNotificationRepository saves to MongoDB
       ↓
5. You can see the notification in Mongo Express
```

## Architecture Benefits

✅ **Testable**: Domain has no dependencies, easy to test  
✅ **Flexible**: Changing MongoDB to another DB only touches Infrastructure  
✅ **Scalable**: Adding rules means adding classes  
✅ **Clear**: Each layer has a purpose  

## Visual Summary

```
┌─────────────────────────────────────────┐
│           Domain (Rules)                │
│  SystemEvent, Notification, Interfaces  │
└─────────────────────────────────────────┘
              ↑
┌─────────────────────────────────────────┐
│        Application (Logic)              │
│  ProcessEventUseCase, Limit Checkers    │
└─────────────────────────────────────────┘
              ↑
┌─────────────────────────────────────────┐
│      Infrastructure (Tech)              │
│  Kafka, MongoDB, EventCache (RAM)       │
└─────────────────────────────────────────┘
```

Simple, practical, and meets the README requirements.

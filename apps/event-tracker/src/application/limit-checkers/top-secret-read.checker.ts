import { Injectable } from '@nestjs/common';
import { LimitChecker } from '@domain/limits/limit-checker.interface';
import { SystemEvent } from '@domain/events/system-event.entity';
import { LimitType } from '@domain/notifications/notification.entity';

@Injectable()
export class TopSecretReadChecker implements LimitChecker {
  async check(event: SystemEvent): Promise<boolean> {
    return event.isTopSecretRead();
  }

  getLimitType(): string {
    return LimitType.TOP_SECRET_READ;
  }
}

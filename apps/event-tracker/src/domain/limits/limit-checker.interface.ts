import { SystemEvent } from '../events/system-event.entity';

export interface LimitChecker {

  check(event: SystemEvent): Promise<boolean>;

  getLimitType(): string;
  
}

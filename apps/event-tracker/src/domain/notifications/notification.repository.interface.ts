import { Notification } from './notification.entity';

export interface NotificationRepository {

  save(notification: Notification): Promise<Notification>;

  findByUserAndType(userId: number, limitType: string): Promise<Notification[]>;
  
  findAll(): Promise<Notification[]>;
}

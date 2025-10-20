import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationRepository } from '@domain/notifications/notification.repository.interface';
import { Notification } from '@domain/notifications/notification.entity';
import { NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class MongoNotificationRepository implements NotificationRepository {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async save(notification: Notification): Promise<Notification> {
    const document = new this.notificationModel({
      userId: notification.userId,
      limitType: notification.limitType,
      date: notification.date,
    });

    const saved = await document.save();

    return new Notification(
      saved.userId,
      saved.limitType as any,
      saved.date,
      saved.id.toString(),
    );
  }

  async findByUserAndType(
    userId: number,
    limitType: string,
  ): Promise<Notification[]> {
    const documents = await this.notificationModel
      .find({ userId, limitType })
      .exec();

    return documents.map(
      (doc) =>
        new Notification(doc.userId, doc.limitType as any, doc.date, doc.id.toString()),
    );
  }

  async findAll(): Promise<Notification[]> {
    const documents = await this.notificationModel.find().exec();

    return documents.map(
      (doc) =>
        new Notification(doc.userId, doc.limitType as any, doc.date, doc.id.toString()),
    );
  }
}

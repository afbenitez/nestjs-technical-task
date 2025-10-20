import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'notifications', timestamps: true })
export class NotificationDocument extends Document {
  @Prop({ required: true, index: true })
  userId: number;

  @Prop({ required: true, index: true })
  limitType: string;

  @Prop({ required: true })
  date: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationDocument);

NotificationSchema.index({ userId: 1, limitType: 1 });

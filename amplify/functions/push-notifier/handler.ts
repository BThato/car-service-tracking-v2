import type { AppSyncResolverHandler } from 'aws-lambda';
import https from 'https';

export const handler: AppSyncResolverHandler<
  { userId: string; title: string; message: string; serviceOrderId?: string },
  any
> = async (event) => {
  const { userId, title, message, serviceOrderId } = event.arguments;

  // In production: look up user's push token from DynamoDB
  // Then send via Expo push API

  const notification = {
    id: `notif_${Date.now()}`,
    userId,
    serviceOrderId: serviceOrderId || null,
    type: 'stage_update',
    title,
    message,
    channel: 'push',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  return notification;
};

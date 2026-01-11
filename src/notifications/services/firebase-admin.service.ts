import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: admin.app.App;

  onModuleInit() {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      );

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn(
          'Firebase credentials not found. Push notifications will be disabled.',
        );
        return;
      }

      try {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log('Firebase Admin initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin', error);
      }
    } else {
      this.app = admin.app();
    }
  }

  isInitialized(): boolean {
    return !!this.app;
  }

  async sendToDevice(
    token: string,
    notification: NotificationPayload,
  ): Promise<string | null> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized, skipping push notification');
      return null;
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'ef_policia_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.app.messaging().send(message);
      this.logger.debug(`Push notification sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      // Return error code if token is invalid
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return 'INVALID_TOKEN';
      }
      return null;
    }
  }

  async sendToMultipleDevices(
    tokens: string[],
    notification: NotificationPayload,
  ): Promise<admin.messaging.BatchResponse | null> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized, skipping push notification');
      return null;
    }

    if (tokens.length === 0) {
      this.logger.warn('No tokens provided for multicast');
      return null;
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'ef_policia_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.app.messaging().sendEachForMulticast(message);
      this.logger.debug(
        `Multicast sent: ${response.successCount} success, ${response.failureCount} failed`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send multicast notification: ${error.message}`,
      );
      return null;
    }
  }

  getFailedTokensFromBatchResponse(
    tokens: string[],
    response: admin.messaging.BatchResponse,
  ): string[] {
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          failedTokens.push(tokens[idx]);
        }
      }
    });
    return failedTokens;
  }
}

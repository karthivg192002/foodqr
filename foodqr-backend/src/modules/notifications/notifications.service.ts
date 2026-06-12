import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseInitialized = false;
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
  ) {
    this.initFirebase();
    this.initEmail();
  }

  private initFirebase() {
    const projectId = this.configService.get('FIREBASE_PROJECT_ID');
    if (!projectId || admin.apps.length) return;
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
          clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        }),
      });
      this.firebaseInitialized = true;
    } catch (e) {
      this.logger.warn('Firebase not configured: ' + e.message);
    }
  }

  private initEmail() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.firebaseInitialized) return;
    try {
      await admin.messaging().send({ token, notification: { title, body }, data });
    } catch (e) {
      this.logger.error('Push notification failed: ' + e.message);
    }
  }

  async sendOrderNotification(userId: string, orderSerial: string, status: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    const title = 'Order Update';
    const body = `Your order #${orderSerial} is now ${status}`;

    if (user.deviceToken) {
      await this.sendPushNotification(user.deviceToken, title, body, { orderId: orderSerial, status });
    }
    if (user.webToken) {
      await this.sendPushNotification(user.webToken, title, body, { orderId: orderSerial, status });
    }
    if (user.email) {
      await this.sendEmail(user.email, title, `<p>${body}</p>`);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM', 'noreply@foodqr.com'),
        to,
        subject,
        html,
      });
    } catch (e) {
      this.logger.error('Email failed: ' + e.message);
    }
  }

  async broadcastToAll(title: string, body: string) {
    const users = await this.userRepo.find({ where: { status: 'active' as any } });
    const tokens = users.map((u) => u.deviceToken || u.webToken).filter(Boolean);
    if (!tokens.length || !this.firebaseInitialized) return { sent: 0 };

    const batches = [];
    for (let i = 0; i < tokens.length; i += 500) {
      batches.push(tokens.slice(i, i + 500));
    }
    let sent = 0;
    for (const batch of batches) {
      try {
        const response = await admin.messaging().sendEachForMulticast({ tokens: batch, notification: { title, body } });
        sent += response.successCount;
      } catch (e) {
        this.logger.error('Broadcast failed: ' + e.message);
      }
    }
    return { sent };
  }
}

import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('notification_alerts')
export class NotificationAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  language: string;

  @Column({ nullable: true })
  mailMessage: string;

  @Column({ nullable: true })
  smsMessage: string;

  @Column({ nullable: true })
  pushNotificationMessage: string;

  @Column({ default: true })
  mail: boolean;

  @Column({ default: false })
  sms: boolean;

  @Column({ default: false })
  pushNotification: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

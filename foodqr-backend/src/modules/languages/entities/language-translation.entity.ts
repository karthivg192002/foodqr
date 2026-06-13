import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('language_translations')
@Index(['languageId', 'key'], { unique: true })
export class LanguageTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  languageId: string;

  @Column()
  @Index()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ nullable: true })
  group: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

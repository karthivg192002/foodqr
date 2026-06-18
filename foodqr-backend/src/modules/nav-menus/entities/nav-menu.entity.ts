import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nav_menus')
export class NavMenu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  group: string;

  @Column({ default: 0 })
  groupOrder: number;

  @Column()
  name: string;

  @Column({ default: '' })
  iconKey: string;

  @Column({ default: '' })
  route: string;

  @Column({ default: false })
  external: boolean;

  @Column('simple-array', { nullable: true })
  roles: string[];

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

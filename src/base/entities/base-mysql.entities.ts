import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseMysqlEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @CreateDateColumn()
  created_at: Date | null;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date | null;

  @Exclude()
  @DeleteDateColumn({ nullable: true, default: null })
  deleted_at: Date | null;
}

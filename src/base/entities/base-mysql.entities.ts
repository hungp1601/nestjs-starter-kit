import { Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseMysqlEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

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

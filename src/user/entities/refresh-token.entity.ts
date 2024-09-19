import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseMysqlEntity } from 'src/base/entities/base-mysql.entities';

@Entity({
  name: 'refresh_tokens',
})
export class RefreshTokenEntity extends BaseMysqlEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;
}

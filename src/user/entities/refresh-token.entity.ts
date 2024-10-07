import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseMysqlEntity } from 'src/base/entities/base-mysql.entities';

@Entity({
  name: 'refresh_tokens',
})
export class RefreshTokenEntity extends BaseMysqlEntity {
  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserEntity;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;
}

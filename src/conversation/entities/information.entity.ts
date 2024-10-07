import { BaseMysqlEntity } from '@/base/entities/base-mysql.entities';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '@/user/entities/user.entity';
import { TypeInformation } from '../interfaces/information.interface';

@Entity({ name: 'information' })
export class Information extends BaseMysqlEntity {
  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @Column({ name: 'status', default: false })
  status: boolean;

  @Column({ name: 'type' })
  type: TypeInformation;

  @Column({ name: 'value', length: 255 })
  value: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: UserEntity;
}

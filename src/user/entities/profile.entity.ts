import { BaseMysqlEntity } from '@/base/entities/base-mysql.entities';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '@/user/entities/user.entity';
import {
  Gender,
  Position,
} from '../../conversation/interfaces/profile.interface';

@Entity({ name: 'profiles' })
export class Profile extends BaseMysqlEntity {
  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @Column({ name: 'avatar', nullable: true })
  avatar: string;

  @Column({ name: 'address', nullable: true })
  address: string;

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'gender', nullable: true })
  gender: Gender;

  @Column({ name: 'position', nullable: true })
  position: Position;

  @Column({
    name: 'birthday',
    default: null,
    nullable: true,
  })
  birthday: Date;

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;
}

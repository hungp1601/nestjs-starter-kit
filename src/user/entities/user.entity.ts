import { Exclude } from 'class-transformer';
import { BaseMysqlEntity } from 'src/base/entities/base-mysql.entities';
import { Entity, Column } from 'typeorm';

@Entity({
  name: 'users',
})
export class UserEntity extends BaseMysqlEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;
}

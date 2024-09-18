import { UserEntity } from '../user.entity';

export const mockUserEntity: UserEntity = {
  id: 0,
  email: 'email',
  name: 'fName',
  password: 'password',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

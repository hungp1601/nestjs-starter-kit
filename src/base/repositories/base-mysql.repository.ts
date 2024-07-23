import { ObjectLiteral, Repository } from 'typeorm';

export class BaseMysqlRepository<
  E extends ObjectLiteral,
> extends Repository<E> {}

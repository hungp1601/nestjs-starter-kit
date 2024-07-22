import { BadRequestException } from '@nestjs/common';
import {
  Between,
  DeepPartial,
  Equal,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  Raw,
  Repository,
} from 'typeorm';
import { CompareOperators } from '../types';

export class BaseMysqlService<E extends ObjectLiteral> {
  constructor(protected repository: Repository<E>) {}

  findOneById(id: string) {
    return this.repository.findOne({
      where: { id: id as any },
    });
  }

  // findOne({ where, join, select }: FindOneOperators<E>) {
  //   // const whereType = this.convertToWhereTypeORM(where);
  // }

  async createOne(entity: DeepPartial<E>): Promise<E> {
    try {
      const e = this.repository.create(entity);
      const result = await this.repository.save(e);
      if (!result) {
        throw new BadRequestException('Failed to create entity');
      }
      return result;
    } catch {
      console.error('Error creating entity');
      throw new BadRequestException('Failed to create entity');
    }
  }

  async updateOneById(id: string, entity: E): Promise<E | undefined> {
    try {
      const update = await this.repository.update(
        { id: id as any },
        entity as any,
      );

      if (update.affected === 0) {
        throw new BadRequestException('Failed to update entity');
      }

      return this.repository.save(entity);
    } catch {
      console.error('Error updating entity');
    }
  }

  // convertToWhereTypeORM(where: WhereOperators<E>) {
  //   const dataFilter = {};
  //   // TODO: Implement this method, which converts the where object to a format that is compatible with TypeORM
  //   // Iterate over each item in the filter array
  //   // where.map(item => {
  //   //   // Destructure the field, operator, and value from the item
  //   //   const { field, operator, value }: QueryFilter = item;
  //   //   // Split the field string into an array of fields
  //   //   const fields = field.split('.');
  //   //   // Initialize the currentField to the dataFilter object
  //   //   let currentField = dataFilter;
  //   //   // Iterate over the fields array, excluding the last field
  //   //   // This loop is used to create nested objects in the dataFilter object for each field
  //   //   for (let i = 0; i < fields.length - 1; i++) {
  //   //     // If the current field does not exist in the currentField object, initialize it as an empty object
  //   //     currentField[fields[i]] = currentField[fields[i]] || {};
  //   //     // Update the currentField to point to the newly created nested object
  //   //     currentField = currentField[fields[i]];
  //   //   }
  //   //   // For the last field in the fields array, call the convertOperatorToTypeORM method
  //   //   // This method converts the operator and value to a format that is compatible with TypeORM
  //   //   // The result is assigned to the last field in the currentField object
  //   //   currentField[fields[fields.length - 1]] = this.convertOperatorToTypeORM({
  //   //     operator,
  //   //     value,
  //   //   });
  //   // });
  //   // return dataFilter;
  //   return dataFilter;
  // }

  convertOperatorToTypeORM({
    operator,
    value,
  }: {
    operator: CompareOperators;
    value: any;
  }) {
    switch (operator) {
      case 'eq':
        return Equal(value);
      case 'ne':
        return Not(Equal(value));
      case 'gt':
        return MoreThan(value);
      case 'lt':
        return LessThan(value);
      case 'gte':
        return MoreThanOrEqual(value);
      case 'lte':
        return LessThanOrEqual(value);
      case 'contain':
        return Like(`%${value}%`);
      case 'in':
        return In(value);
      case 'notin':
        return Not(In(value));
      case 'isnull':
        return Raw((alias) => `${alias} IS NULL`);
      case 'notnull':
        return Raw((alias) => `${alias} IS NOT NULL`);
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return Between(value[0], value[1]);
        }
        throw new BadRequestException(
          'Invalid "between" operator value. It should be an array with two values.',
        );
      default:
        throw new BadRequestException(`Unsupported operator: ${operator}`);
    }
  }
}

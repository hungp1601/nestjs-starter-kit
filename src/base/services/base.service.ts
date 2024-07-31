import { BadRequestException, Logger } from '@nestjs/common';
import {
  Between,
  DeepPartial,
  Equal,
  FindOperator,
  FindOptionsRelationByString,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsSelectByString,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  Raw,
} from 'typeorm';
import {
  CompareOperators,
  FindManyOperators,
  FindManyResponse,
  FindOneOperators,
  QueryOperator,
  QueryValue,
  WhereOperators,
  QueryType,
} from '../types';
import { RequestLoggerInterceptor } from 'src/logger/interceptors/request-logger.interceptor';
import { BaseMysqlRepository } from '../repositories/base-mysql.repository';

export class BaseMysqlService<E extends ObjectLiteral> {
  public readonly logger = new Logger(RequestLoggerInterceptor.name);

  constructor(protected repository: BaseMysqlRepository<E>) {}

  /**
   * Finds a record by its ID.
   * @param id - The ID of the record to find.
   * @returns A promise that resolves to the found record, or undefined if not found.
   */
  findOneById(id: string) {
    return this.repository.findOne({
      where: { id: id as any },
      cache: true,
    });
  }

  async findOne({
    where = {},
    join = [],
    select = [],
    withDeleted = false,
    cache = true,
  }: FindOneOperators) {
    try {
      const whereType = this.convertToWhereTypeORM(where);
      const selectType = this.convertFieldsToTypeORM(select);
      const joinType = this.convertToJoinTypeORM(join);

      return await this.repository.findOne({
        where: whereType,
        relations: joinType,
        select: selectType,
        withDeleted,
        cache,
      });
    } catch {
      this.logger.error('Error finding entity');
      throw new BadRequestException('Failed to find entity');
    }
  }

  async findMany({
    where = {},
    join = [],
    select = [],
    sort = [],
    page = 1,
    pageSize = 10,
    withDeleted = false,
    cache = true,
  }: FindManyOperators): Promise<FindManyResponse<E>> {
    try {
      const whereType = this.convertToWhereTypeORM(where);
      const selectType = this.convertFieldsToTypeORM(select);
      const joinType = this.convertToJoinTypeORM(join);
      const sortType = this.convertToSortTypeORM(sort);

      const [entities, total] = await this.repository.findAndCount({
        where: whereType,
        relations: joinType,
        select: selectType,
        order: sortType,
        take: pageSize,
        skip: (page - 1) * pageSize,
        withDeleted,
        cache,
      });

      return {
        data: entities,
        total,
        page,
        pageSize,
      };
    } catch {
      this.logger.error('Error finding entity');
      throw new BadRequestException('Failed to find entity');
    }
  }

  /**
   * Creates a new entity in the database.
   *
   * @param entity - The entity to be created.
   * @returns A promise that resolves to the created entity.
   * @throws BadRequestException if the entity creation fails.
   */
  async createOne(entity: DeepPartial<E>): Promise<E> {
    try {
      const e = this.repository.create(entity);
      const result = await this.repository.save(e);
      if (!result) {
        throw new BadRequestException('Failed to create entity');
      }
      return result;
    } catch {
      this.logger.error('Error creating entity');
      throw new BadRequestException('Failed to create entity');
    }
  }

  /**
   * Updates an entity by its ID.
   *
   * @param id - The ID of the entity to update.
   * @param entity - The updated entity object.
   * @returns A promise that resolves to the updated entity, or undefined if the entity was not found.
   * @throws BadRequestException if the update operation fails.
   */
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
      this.logger.error('Error updating entity');
      throw new BadRequestException('Failed to update entity');
    }
  }

  convertToWhereTypeORM(where: WhereOperators) {
    const dataFilter = [];
    // TODO: Implement this method, which converts the where object to a format that is compatible with TypeORM
    // Iterate over each item in the filter array
    // where.map((item) => {
    //   // Destructure the field, operator, and value from the item
    // const { field, operator, value }: QueryFilter = item;
    // // Split the field string into an array of fields
    // const fields = field.split('.');
    // // Initialize the currentField to the dataFilter object
    // let currentField = dataFilter;
    // // Iterate over the fields array, excluding the last field
    // // This loop is used to create nested objects in the dataFilter object for each field
    // for (let i = 0; i < fields.length - 1; i++) {
    //   // If the current field does not exist in the currentField object, initialize it as an empty object
    //   currentField[fields[i]] = currentField[fields[i]] || {};
    //   // Update the currentField to point to the newly created nested object
    //   currentField = currentField[fields[i]];
    // }
    // // For the last field in the fields array, call the convertOperatorToTypeORM method
    // // This method converts the operator and value to a format that is compatible with TypeORM
    // // The result is assigned to the last field in the currentField object
    // currentField[fields[fields.length - 1]] = this.convertOperatorToTypeORM({
    //   operator,
    //   value,
    // });
    // });
    for (const query in where) {
      if (query === 'or') {
      } else if (query === 'and') {
        for (const item of where[query] as QueryOperator[]) {
          const andQuery = [];
          for (const [key, value] of Object.entries(item)) {
            let operator: CompareOperators = 'eq';
            const itemQuery = [];
            if (typeof value === 'object') {
              operator = Object.keys(value)[0] as CompareOperators;
            } else {
              itemQuery.push(
                this.convertOperatorToTypeORM({ operator, value }),
              );
            }
            andQuery.push(itemQuery);
          }
        }
        // const type = this.convertOperatorToTypeORM({ operator, value });
      }
    }
    return dataFilter;
  }

  /**
   * Converts the given operator and value to a TypeORM query condition.
   *
   * @param operator - The operator to be converted.
   * @param value - The value to be used in the query condition.
   * @returns The TypeORM query condition corresponding to the given operator and value.
   * @throws {BadRequestException} If the operator is not supported or if the "between" operator value is invalid.
   */
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

  /**
   * Converts an array of fields into a TypeORM FindOptionsSelect or FindOptionsSelectByString object.
   *
   * @param fields - An array of fields to convert.
   * @returns The converted TypeORM object.
   */
  convertFieldsToTypeORM(
    fields: string[] | undefined,
  ): FindOptionsSelect<E> | FindOptionsSelectByString<E> {
    const convertedFields: any = {};
    if (!fields) {
      return {};
    }
    if (fields.length) {
      for (const field of fields) {
        let currentField = convertedFields;
        const splitField = field.split('.');

        // Iterate over each subfield in the splitField array, except for the last one
        for (let i = 0; i < splitField.length - 1; i++) {
          // If the current subfield does not exist in the current field object, create it as an empty object
          if (!currentField[splitField[i]]) {
            currentField[splitField[i]] = {};
          }
          // Update the current field object to be the current subfield object
          currentField = currentField[splitField[i]];
        }
        // Assign the value true to the last subfield in the current field object
        currentField[splitField[splitField.length - 1]] = true;
      }
    }
    return convertedFields as
      | FindOptionsSelect<E>
      | FindOptionsSelectByString<E>;
  }

  /**
   * Converts an array of sort strings to a TypeORM-compatible sort object.
   * @param sort - The array of sort strings.
   * @returns The converted sort object.
   */
  convertToSortTypeORM(sort: string[]) {
    const sortType: any = {};
    for (const sortItem of sort) {
      const order = sortItem.startsWith('-') ? 'DESC' : 'ASC';
      const field = sortItem.charAt(0) === '-' ? sortItem.slice(1) : sortItem;
      const fields = field.split('.');
      let currentField = sortType;
      for (let i = 0; i < fields.length - 1; i++) {
        if (!currentField[fields[i]]) {
          currentField[fields[i]] = {};
        }
        currentField = currentField[fields[i]];
      }
      currentField[fields[fields.length - 1]] = order;
    }
    return sortType;
  }

  convertToJoinTypeORM(
    join: string[],
  ): FindOptionsRelations<E> | FindOptionsRelationByString {
    return join?.reduce((acc: any, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
  }
}

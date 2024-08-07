import { BadRequestException, Logger } from '@nestjs/common';
import {
  Between,
  DeepPartial,
  Equal,
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
  And,
  FindOperator,
  FindOptionsWhere,
  DeleteResult,
  UpdateResult,
} from 'typeorm';
import {
  CompareOperators,
  FindAllOperators,
  FindManyOperators,
  FindManyResponse,
  FindOneOperators,
  QueryOperator,
  WhereOperators,
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
    } catch (e) {
      this.logger.error('Error finding entity' + e);
      throw new BadRequestException('Failed to find entity');
    }
  }

  async count({ where = {} }: { where: WhereOperators }) {
    try {
      const whereType = this.convertToWhereTypeORM(where);
      return await this.repository.count({
        where: whereType,
      });
    } catch (e) {
      this.logger.error('Error counting entity' + e);
      throw new BadRequestException('Failed to count entity');
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

  async findAll({
    where = {},
    join = [],
    select = [],
    sort = [],
    withDeleted = false,
    cache = true,
  }: FindAllOperators): Promise<E[]> {
    try {
      const page = 1;
      const pageSize = 1000;

      const { data } = await this.findMany({
        where,
        join,
        select,
        sort,
        page,
        pageSize,
        withDeleted,
        cache,
      });
      return data;
    } catch (e) {
      this.logger.error('Error finding entity' + e);
      throw new BadRequestException('Failed to find entity');
    }
  }

  async deleteOneById({ id }: { id: string }, hardDelete: boolean = false) {
    try {
      const entity = await this.findOneById(id);
      if (!entity) {
        return undefined;
      }
      let result: UpdateResult | DeleteResult;

      if (hardDelete) {
        result = await this.repository.delete(entity);
      } else {
        result = await this.repository.softDelete(entity);
      }
      if (!result.affected) {
        throw new BadRequestException('Failed to delete entity');
      }
      return { success: true };
    } catch (e) {
      this.logger.error('Error deleting entity' + e);
      throw new BadRequestException('Failed to delete entity');
    }
  }

  async deleteMany({ where = {} }, hardDelete = false) {
    try {
      const entities = await this.findAll({ where, select: ['id'] });
      if (!entities.length) {
        return undefined;
      }
      let result: UpdateResult | DeleteResult;

      const entitiesIds = entities.map((entity) => entity.id);
      if (hardDelete) {
        result = await this.repository.delete(entitiesIds);
      } else {
        result = await this.repository.softDelete(entitiesIds);
      }
      if (!result.affected) {
        throw new BadRequestException('Failed to delete entities');
      }
      return { success: true };
    } catch (e) {
      this.logger.error('Error deleting entities' + e);
      throw new BadRequestException('Failed to delete entities');
    }
  }

  async deleteOne({ where = {} }, hardDelete = false) {
    try {
      const entity = await this.findOne({ where, select: ['id'] });
      if (!entity) {
        return undefined;
      }
      let result: UpdateResult | DeleteResult;

      if (hardDelete) {
        result = await this.repository.delete(entity);
      } else {
        result = await this.repository.softDelete(entity);
      }
      if (!result.affected) {
        throw new BadRequestException('Failed to delete entity');
      }
      return { success: true };
    } catch (e) {
      this.logger.error('Error deleting entity' + e);
      throw new BadRequestException('Failed to delete entity');
    }
  }

  async updateOne({
    where = {},
    entity,
  }: {
    where: WhereOperators;
    entity: DeepPartial<E>;
  }) {
    try {
      const entityToUpdate = await this.findOne({ where });
      if (!entityToUpdate) {
        return undefined;
      }
      const update = await this.repository.save({
        ...entityToUpdate,
        ...entity,
      });
      return update;
    } catch (e) {
      this.logger.error('Error updating entity' + e);
      throw new BadRequestException('Failed to update entity');
    }
  }

  async updateMany({
    where = {},
    entity,
  }: {
    where: WhereOperators;
    entity: E;
  }) {
    try {
      const entitiesToUpdate = await this.findAll({ where });
      if (!entitiesToUpdate.length) {
        return undefined;
      }
      const update = await this.repository.save(
        entitiesToUpdate.map((e) => ({ ...e, ...entity })),
      );
      return await this.repository.save(update);
    } catch (e) {
      this.logger.error('Error updating entities' + e);
      throw new BadRequestException('Failed to update entities');
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
    } catch (e) {
      this.logger.error('Error creating entity' + e);
      throw new BadRequestException('Failed to create entity');
    }
  }

  async createMany(entities: DeepPartial<E>[]): Promise<E[]> {
    try {
      const e = this.repository.create(entities);
      const result = await this.repository.save(e);
      if (!result) {
        throw new BadRequestException('Failed to create entities');
      }
      return result;
    } catch (e) {
      this.logger.error('Error creating entities' + e);
      throw new BadRequestException('Failed to create entities');
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
    } catch (e) {
      this.logger.error('Error updating entity' + e);
      throw new BadRequestException('Failed to update entity');
    }
  }

  convertToWhereTypeORM(where: WhereOperators) {
    const dataFilter = [];
    // TODO: Implement this method, which converts the where object to a format that is compatible with TypeORM
    for (const query in where) {
      if (query === 'and') {
        for (const item of where[query] as QueryOperator[]) {
          const andQuery = [];
          for (const [key, value] of Object.entries(item)) {
            const itemQuery: FindOperator<any>[] = [];
            if (typeof value === 'object') {
              for (const [keyO, valueO] of Object.entries(value)) {
                itemQuery.push(
                  this.convertOperatorToTypeORM({
                    operator: keyO as CompareOperators,
                    value: valueO,
                  }),
                );
              }
            } else {
              itemQuery.push(
                this.convertOperatorToTypeORM({ operator: 'eq', value }),
              );
            }
            andQuery.push({
              [key]: And(...itemQuery),
            });
          }
          const andQueryFinal: { [key: string]: FindOperator<any> } = {};
          for (const item of andQuery) {
            const [key, value] = Object.entries(item)[0];
            andQueryFinal[key] = value;
          }
          dataFilter.push(andQueryFinal);
        }
      }
    }

    //TODO: Implement the "or" operator
    // for (const query in where) {
    //   if (query === 'or') {
    //     for (const item of where[query] as QueryOperator[]) {
    //     }
    //   }
    // }
    return dataFilter as FindOptionsWhere<E>[];
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

  /**
   * Converts an array of join strings into a FindOptionsRelations object or a FindOptionsRelationByString object.
   * @param join - An array of join strings.
   * @returns A FindOptionsRelations object or a FindOptionsRelationByString object.
   */
  convertToJoinTypeORM(
    join: string[],
  ): FindOptionsRelations<E> | FindOptionsRelationByString {
    return join?.reduce((acc: any, curr) => {
      acc[curr] = true;
      return acc;
    }, {});
  }
}

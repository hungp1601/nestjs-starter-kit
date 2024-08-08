export type CompareOperators =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'in'
  | 'nin'
  | 'like'
  | 'ilike'
  | 'contain'
  | 'notin'
  | 'notnull'
  | 'isnull'
  | 'between'
  | 'or';

export type QueryType = string | number | boolean | Date;

export type QueryValue =
  | QueryType
  | {
      ne?: QueryType;
      eq?: QueryType;
      gt?: QueryType;
      lt?: QueryType;
      gte?: QueryType;
      lte?: QueryType;
      in?: QueryType[];
      nin?: QueryType[];
      like?: string;
      ilike?: string;
      contain?: QueryType;
      notnull?: boolean;
      isnull?: boolean;
      between?: [QueryType, QueryType];
    };

export type QueryOperator = Record<string, QueryValue>;

export type WhereOperators = {
  or?: Array<QueryOperator>;
  and?: Array<QueryOperator>;
};

export type JoinOperator = Array<string>;

export type SelectOperator = Array<string>;

export type FindOneOperators = {
  where?: WhereOperators;
  join?: JoinOperator;
  select?: SelectOperator;
  withDeleted?: boolean;
  cache?: boolean | number;
};

export type FindManyOperators = FindOneOperators & {
  sort?: Array<string>;
  page?: number;
  pageSize?: number;
};

export type FindAllOperators = FindOneOperators & {
  sort?: Array<string>;
};

export type FindManyResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

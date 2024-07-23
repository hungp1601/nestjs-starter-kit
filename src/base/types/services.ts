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
      eq?: QueryType;
      ne?: QueryType;
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
  or?: Array<QueryValue>;
} & QueryOperator;

export type JoinOperator = Array<string>;

export type SelectOperator = Array<string>;

export type FindOneOperators = {
  where?: WhereOperators;
  join?: JoinOperator;
  select?: SelectOperator;
  withDeleted?: boolean;
};

export type FindManyOperators = FindOneOperators & {
  sort?: Array<string>;
  page?: number;
  pageSize?: number;
};

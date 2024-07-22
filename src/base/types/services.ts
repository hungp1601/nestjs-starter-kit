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
  | 'between';

export type FindOperators<E, K extends keyof E> =
  | E[K]
  | {
      eq?: E[K];
      ne?: E[K];
      gt?: E[K];
      lt?: E[K];
      gte?: E[K];
      lte?: E[K];
      in?: E[K][];
      nin?: E[K][];
      like?: string;
      ilike?: string;
      contain?: E[K];
      notnull?: boolean;
      isnull?: boolean;
      between?: [E[K], E[K]];
    };

export type WhereOperators<E> = {
  [K in keyof E]?: FindOperators<E, K>;
};

export type JoinOperator<E> = Array<keyof E>;

export type SelectOperator<E> = Array<keyof E>;

export type FindOneOperators<E> = {
  where?: WhereOperators<E>;
  join?: JoinOperator<E>;
  select?: SelectOperator<E>;
};

export type FindManyOperators<E> = FindOneOperators<E> & {
  sort?: [keyof E, 'ASC' | 'DESC'];
  page?: number;
  pageSize?: number;
};

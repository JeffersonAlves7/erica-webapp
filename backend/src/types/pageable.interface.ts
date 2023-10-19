export interface Pageable<T> {
  page: number;
  total: number;
  data: T[];
}

export interface PageableParams {
  page: number;
  limit: number;
}

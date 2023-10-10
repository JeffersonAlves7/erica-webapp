export interface Pageable<T> {
  page: number;
  total: number;
  data: T[];
}

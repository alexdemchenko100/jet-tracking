import { UseSortByColumnProps } from 'react-table'

declare module 'react-table' {
  export interface TableOptions<D extends object>
    extends UsePaginationOptions<D>,
      UseSortByOptions<D>,
      UseRowSelectOptions<D> {}

  export interface TableInstance<D extends object = {}>
    extends UsePaginationInstanceProps<D>,
      UseSortByInstanceProps<D>,
      UseRowSelectInstanceProps<D> {}

  export interface TableState<D extends object = {}>
    extends UsePaginationState<D>,
      UseSortByState<D>,
      UseRowSelectState<D> {}

  export interface Row<D extends object = {}>
    extends UseExpandedRowProps<D>,
      UseGroupByRowProps<D>,
      UseRowSelectRowProps<D>,
      UseRowStateRowProps<D> {}

  export interface Hooks<D extends object = {}> extends UseSortByHooks<D>, UseRowSelectHooks<D> {}

  export interface ColumnInterface<D extends object = {}> extends UseSortByColumnOptions<D> {}

  export interface ColumnInstance<D extends object = {}> extends UseSortByColumnProps<D> {}
}

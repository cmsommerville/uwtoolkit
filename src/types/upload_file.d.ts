export interface ColumnMapperInterface {
  excelColumn: string;
  key: string;
  label: string;
  type: string;
  parser: (
    val: string | number | null | undefined
  ) => string | number | null | undefined;
}

export interface ReadExcelDataConfigInterface {
  startRow?: number;
  startColumn?: string;
}

export interface QuoteDataInterface {
  id: number;
  vortex_id: string;
  group_name: string;
  broker: string;
  eligibles: number | null | undefined;
  received_date: string | null | undefined;
}

import { read as xlsxRead } from "xlsx";
import {
  ColumnMapperInterface,
  ReadExcelDataConfigInterface,
} from "../types/upload_file";

export const readExcelData = (
  buffer: ArrayBuffer,
  sheetName: string,
  columns: ColumnMapperInterface[],
  config: ReadExcelDataConfigInterface = {}
) => {
  const workbook = xlsxRead(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[sheetName];

  let i = config.startRow ?? 2;
  const startColumn = config.startColumn ?? "A";

  // iterate over the worksheet pulling out the columns we're expecting
  const rowData = [];
  while (worksheet[startColumn + i]) {
    const row: any = {};
    columns.forEach((col) => {
      row[col.key] = col.parser(worksheet[col.excelColumn + i].w);
    });
    rowData.push({ ...row, id: i });
    i++;
  }
  return rowData;
};

export const parseExcelFile = async (
  files: FileList,
  column_mapper: ColumnMapperInterface[],
  config: ReadExcelDataConfigInterface = {}
) => {
  const _files = Array.from(files);
  const buffer = await _files[0].arrayBuffer();

  const data = readExcelData(buffer, "Data", column_mapper, config);
  return data;
};

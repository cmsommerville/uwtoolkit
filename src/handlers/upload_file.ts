import { read as xlsxRead } from "xlsx";
import {
  ColumnMapperInterface,
  ReadExcelDataConfigInterface,
} from "../types/data";

export const readExcelData = (
  buffer: ArrayBuffer,
  // sheetName: string,
  columns: ColumnMapperInterface[],
  config: ReadExcelDataConfigInterface = {}
) => {
  const workbook = xlsxRead(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  let i = config.startRow ?? 2;
  const startColumn = config.startColumn ?? "A";

  // iterate over the worksheet pulling out the columns we're expecting
  const rowData = [];
  while (worksheet[startColumn + i]) {
    const row: any = {};
    columns.forEach((col) => {
      try {
        const val = col.parser(worksheet[col.excelColumn + i].w);
        row[col.key] = val;
      } catch (err) {
        if (col.optional) {
          row[col.key] = undefined;
        }
        console.log("Whoops!");
      }
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

  const data = readExcelData(buffer, column_mapper, config);
  return data;
};

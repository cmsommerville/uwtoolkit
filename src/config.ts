import { DateTime } from "luxon";
import { ColumnMapperInterface } from "./types/data";

export const CASE_DATA_COLUMN_MAPPER: ColumnMapperInterface[] = [
  {
    excelColumn: "G",
    key: "vortex_id",
    label: "Vortex ID",
    type: "number0",
    parser: (val: string | number | null | undefined) => {
      if (val == null) return val;
      if (isNaN(Number(val))) return 0;
      return Number(val);
    },
  },
  {
    excelColumn: "F",
    key: "group_name",
    label: "Group Name",
    type: "text",
    parser: (val: string | number | null | undefined) => {
      if (val == null) return val;
      return String(val).trim();
    },
  },
  {
    excelColumn: "A",
    key: "broker",
    label: "Broker",
    type: "text",
    parser: (val: string | number | null | undefined) => {
      if (val == null) return val;
      return String(val).trim();
    },
  },
  {
    excelColumn: "M",
    key: "eligibles",
    label: "# Eligible EEs",
    type: "number0",
    parser: (val: string | number | null | undefined) => {
      if (val == null) return val;
      if (isNaN(Number(val))) return 0;
      return Number(val);
    },
  },
  {
    excelColumn: "O",
    key: "received_date",
    label: "Received Date",
    type: "date",
    parser: (val: string | number | null | undefined) => {
      if (val == null) return val;
      return DateTime.fromFormat(String(val), "M/d/yy").toISO();
    },
  },
];

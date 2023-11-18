import { DateTime } from "luxon";
import { ColumnMapperInterface } from "./types/data";

const floatParser = (val: string | number | null | undefined) => {
  if (val == null) return val;
  if (isNaN(Number(val))) return 0;
  return Number(val);
};

const stringParser = (val: string | number | null | undefined) => {
  if (val == null) return val;
  return String(val).trim();
};

const dateParser = (val: string | number | null | undefined) => {
  if (val == null) return val;
  if (DateTime.fromFormat(String(val), "M/d/yy").toISO() != null) {
    return DateTime.fromFormat(String(val), "M/d/yy").toISO();
  }
  if (DateTime.fromFormat(String(val), "M/d/yy H:mm").toISO()) {
    return DateTime.fromFormat(String(val), "M/d/yy H:mm").toISO();
  }
  return null;
};

export const CASE_DATA_COLUMN_MAPPER: ColumnMapperInterface[] = [
  {
    excelColumn: "A",
    key: "vortex_id",
    label: "Vortex ID",
    type: "number0",
    parser: floatParser,
  },
  {
    excelColumn: "B",
    key: "group_name",
    label: "Group Name",
    type: "text",
    parser: stringParser,
  },
  {
    excelColumn: "H",
    key: "eligibles",
    label: "# Eligible EEs",
    type: "number0",
    parser: floatParser,
  },
  {
    excelColumn: "K",
    key: "received_date",
    label: "Received Date",
    type: "date",
    parser: dateParser,
  },
  {
    excelColumn: "E",
    key: "broker",
    label: "Broker",
    type: "text",
    parser: stringParser,
  },
  {
    excelColumn: "D",
    key: "regional_director",
    label: "Regional Director",
    type: "text",
    parser: stringParser,
  },
  {
    excelColumn: "F",
    key: "pipeline_alignment",
    label: "Pipeline Alignment",
    type: "text",
    parser: stringParser,
  },

  {
    excelColumn: "G",
    key: "status",
    label: "Status",
    type: "text",
    parser: stringParser,
  },
  {
    excelColumn: "I",
    key: "sales_support_assignment",
    label: "Support Assignment",
    type: "text",
    parser: stringParser,
  },
  {
    excelColumn: "J",
    key: "uw_assignment",
    label: "Underwriter Assignment",
    type: "text",
    parser: stringParser,
  },
  {
    excelColumn: "L",
    key: "sales_support_release_date",
    label: "Sales Support Release Date",
    type: "date",
    parser: dateParser,
    optional: true,
  },
  {
    excelColumn: "M",
    key: "info_received_date",
    label: "All Info Received Date",
    type: "date",
    parser: dateParser,
  },
  {
    excelColumn: "N",
    key: "completed_date",
    label: "Completed Date",
    type: "date",
    parser: dateParser,
  },
  {
    excelColumn: "O",
    key: "due_date",
    label: "Due Date",
    type: "date",
    parser: dateParser,
  },
  {
    excelColumn: "P",
    key: "effective_date",
    label: "Effective Date",
    type: "date",
    parser: dateParser,
  },
  {
    excelColumn: "R",
    key: "is_captive",
    label: "Captive Arrangement",
    type: "text",
    parser: stringParser,
  },
];

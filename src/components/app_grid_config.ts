import { DateTime } from "luxon";
import { ColDef } from "ag-grid-community";

export const GRID_COLUMN_TYPES: { [k: string]: ColDef } = {
  date: {
    cellClass: "text-right",
    valueFormatter: (params) => {
      if (params.value == null) return "";
      return DateTime.fromISO(String(params.value)).toLocaleString(
        DateTime.DATE_SHORT
      );
    },
  },
  number0: {
    cellClass: "text-right",
    valueFormatter: (params) => {
      if (isNaN(Number(params.value))) return "";
      return Number(params.value).toLocaleString("en-US");
    },
  },
  text: {},
};

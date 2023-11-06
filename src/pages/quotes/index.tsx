"use client";
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { parseExcelFile } from "../../handlers/upload_file";
import { db } from "../../store/local_storage";
import { CASE_DATA_COLUMN_MAPPER } from "../../config";
import FileUploader from "../../components/FileUploader";
import AppPanel from "../../components/AppPanel";
import { setQuoteData } from "../../store/slices/quotes";
import { setBrokers } from "../../store/slices/config";
import { newBrokerAnalyzer } from "../../handlers/broker_handlers";
import { KEY_BROKER_LIST } from "../../store/constants";
import { BrokerType } from "../../types/rulesets";
import AppGrid from "../../components/AppGrid";
import { ColDef, GridApi } from "ag-grid-community";
import { QuoteDataInterface } from "../../types/upload_file";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const QuoteData = () => {
  const dispatch = useDispatch();
  const brokers: BrokerType[] = useSelector(
    (state: any) => state.config.brokers
  );
  const quotes: QuoteDataInterface[] = useSelector(
    (state: any) => state.quotes
  );
  const [gridApi, setGridApi] = useState<GridApi>();

  const new_brokers = brokers.filter((brk) => brk.reviewed === "N");

  const handleFileSelected = useCallback(
    async (file_list: FileList) => {
      if (!file_list) return;
      const data = await parseExcelFile(file_list, CASE_DATA_COLUMN_MAPPER);
      const old_brokers: BrokerType[] | null = await db.getItem(
        KEY_BROKER_LIST
      );

      const brokers_analyzed = newBrokerAnalyzer(data, old_brokers);
      db.setItem(KEY_BROKER_LIST, brokers_analyzed);

      dispatch(setQuoteData(data));
      dispatch(setBrokers(brokers_analyzed));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!gridApi) return;
    gridApi.setRowData(quotes);
  }, [quotes, gridApi]);

  return (
    <AppPanel>
      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-4 space-y-6">
          <AppGrid
            style={{ height: "500px" }}
            columnDefs={COL_DEFS}
            defaultColDef={{
              headerClass: "text-center",
            }}
            onGridReady={(params) => {
              setGridApi(params.api);
            }}
            onFirstDataRendered={(params) => {
              params.columnApi.autoSizeAllColumns();
            }}
          />
        </div>
        <div className="space-y-4">
          <FileUploader
            className="relative col-span-1"
            onSelectFile={handleFileSelected}
          >
            Upload
          </FileUploader>
          {brokers.length > 0 ? (
            <AddBrokerRules new_broker_count={new_brokers.length} />
          ) : null}
        </div>
      </div>
    </AppPanel>
  );
};

interface AddBrokerRulesProps {
  new_broker_count: number;
}

const AddBrokerRules = ({ new_broker_count }: AddBrokerRulesProps) => {
  if (new_broker_count === 0) {
    return (
      <div className="flex justify-center items-center shadow bg-slate-100 p-4 rounded space-x-2">
        <CheckCircleIcon className="text-green-500 w-10 h-10" />
        <span className="inline-block text-sm text-slate-600">
          No new brokers since last upload!
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center shadow bg-amber-200 p-4 rounded space-x-2">
      <ExclamationCircleIcon className="text-primary-400 w-10 h-10" />
      <Link
        to={"/config"}
        className="ml-1 text-sm text-primary-500 hover:text-primary-700 transition duration-100"
      >
        {new_broker_count} new brokers!
      </Link>
    </div>
  );
};

const COL_DEFS: ColDef[] = [
  ...CASE_DATA_COLUMN_MAPPER.map((row) => {
    return {
      field: row.key,
      headerName: row.label,
      type: row.type,
    };
  }),
];

export default QuoteData;

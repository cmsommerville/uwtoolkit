"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import { db } from "../store/local_storage";
import ResumeOrRestart from "../components/ResumeOrRestart";

import { parseExcelFile } from "../handlers/upload_file";
import { CASE_DATA_COLUMN_MAPPER } from "../config";
import { newBrokerAnalyzer } from "../handlers/broker_handlers";

import {
  setBrokers,
  setCaseSizes,
  setQuoteData,
  setRulesets,
  setUnderwriters,
  calcRuleAppliedData,
} from "../store/slices/data";
import {
  KEY_ASSIGNMENTS,
  KEY_RULESETS,
  KEY_BROKER_LIST,
  KEY_CASE_FILES,
  KEY_CASE_SIZES,
  KEY_UNDERWRITERS,
} from "../store/constants";

import {
  BrokerType,
  RulesetType,
  QuoteDataInterface,
  AssignmentsGridInterface,
  EligibleMapper,
  Underwriter,
} from "../types/data";

const calculateLoadStatus = (
  quotes: QuoteDataInterface[] | null | undefined,
  underwriters: Underwriter[] | null | undefined,
  case_sizes: EligibleMapper[] | null | undefined,
  rulesets: RulesetType[] | null | undefined
) => {
  if (
    quotes &&
    quotes.length &&
    underwriters &&
    underwriters.length &&
    case_sizes &&
    case_sizes.length &&
    rulesets &&
    rulesets.length
  )
    return "FULLY_CONFIGURED";
  if (
    (!quotes || quotes.length === 0) &&
    (!underwriters || underwriters.length === 0) &&
    (!case_sizes || case_sizes.length === 0) &&
    (!rulesets || rulesets.length === 0)
  )
    return "NOT_CONFIGURED";
  return "PARTIALLY_CONFIGURED";
};

const fileListHandler = async (
  file_list: FileList,
  dispatch: Dispatch<AnyAction>
) => {
  const data = await parseExcelFile(file_list, CASE_DATA_COLUMN_MAPPER);
  const old_brokers: BrokerType[] | null = await db.getItem(KEY_BROKER_LIST);

  const brokers_analyzed = newBrokerAnalyzer(data, old_brokers);
  db.setItem(KEY_BROKER_LIST, brokers_analyzed);

  dispatch(setQuoteData(data));
  dispatch(setBrokers(brokers_analyzed));
  return data;
};

const loadData = async (dispatch: Dispatch<AnyAction>) => {
  const [file_list, rulesets, assignments, case_sizes, underwriters] =
    (await Promise.all([
      db.getItem(KEY_CASE_FILES),
      db.getItem(KEY_RULESETS),
      db.getItem(KEY_ASSIGNMENTS),
      db.getItem(KEY_CASE_SIZES),
      db.getItem(KEY_UNDERWRITERS),
    ])) as [
      FileList | null,
      RulesetType[] | null,
      AssignmentsGridInterface[] | null,
      EligibleMapper[] | null,
      Underwriter[] | null
    ];
  let quotes: QuoteDataInterface[] = [];
  if (file_list) {
    quotes = await fileListHandler(file_list as FileList, dispatch);
    dispatch(
      calcRuleAppliedData({
        quotes,
        rulesets,
        assignments,
        case_sizes,
      })
    );
  }
  if (rulesets) dispatch(setRulesets(rulesets));
  if (case_sizes) dispatch(setCaseSizes(case_sizes));
  if (underwriters) dispatch(setUnderwriters(underwriters));

  return calculateLoadStatus(quotes, underwriters, case_sizes, rulesets);
};

const useLoadIndexedDB = () => {
  const dispatch = useDispatch();
  const [initialStatus, setInitialStatus] = useState<string>();

  useEffect(() => {
    loadData(dispatch).then((status) => {
      setInitialStatus(status);
    });
  }, [dispatch]);

  return initialStatus;
};

interface Props {
  children: React.ReactNode;
}

const LoadIndexedDBProvider = (props: Props) => {
  const initialStatus = useLoadIndexedDB();
  const navigate = useNavigate();
  const underwriters: Underwriter[] = useSelector(
    (state: any) => state.data.underwriters
  );
  const case_sizes: EligibleMapper[] = useSelector(
    (state: any) => state.data.case_sizes
  );
  const rulesets: RulesetType[] = useSelector(
    (state: any) => state.data.rulesets
  );
  const quotes: QuoteDataInterface[] = useSelector(
    (state: any) => state.data.quotes
  );

  let resumePath: string = "/";
  if (!quotes || quotes.length === 0) resumePath = "/quotes";
  else if (!underwriters || underwriters.length === 0) resumePath = "/config";
  else if (!case_sizes || case_sizes.length === 0) resumePath = "/config";
  else if (!rulesets || rulesets.length === 0) resumePath = "/config";
  else resumePath = "/assignments";

  const status = useMemo(() => {
    return calculateLoadStatus(quotes, underwriters, case_sizes, rulesets);
  }, [quotes, underwriters, case_sizes, rulesets]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (status === "NOT_CONFIGURED") {
        navigate("/quotes");
        return;
      }
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [status, navigate]);

  return (
    <>
      {props.children}
      {initialStatus === "PARTIALLY_CONFIGURED" ? (
        <ResumeOrRestart resumePath={resumePath} />
      ) : null}
    </>
  );
};

export default LoadIndexedDBProvider;
